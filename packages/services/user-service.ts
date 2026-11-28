import type { OrderingParams, PagingParams, PagingResult } from "../domains/entities/common";
import ExcelJS from "exceljs";
import { isAPIError } from "better-auth/api";
import type { auth as Auth } from "../auth/auth";
import type { CreatedUserResult, CreateUserRequest, ExcelUserRow, ImportRowError, ImportUsersResult } from "../domains/dto/user";
import { USER_ROLES, type User, type UserRole } from "../domains/entities/user";
import { Errors } from "../domains/errors";
import { generateTemporaryPassword } from "../domains/helper/password";
import type { OrganizationRepository } from "../repositories/organization-repo";
import type { UserRepository } from "../repositories/user-repo";

export type PasswordHasher = (password: string) => Promise<string>;

type NewUserWithPassword = CreateUserRequest & { password: string };
type UserCreator = (inputs: NewUserWithPassword[]) => Promise<User[]>;

const IMPORT_COLUMNS = ['firstName', 'lastName', 'email', 'role', 'department', 'position'] as const;
const MAX_IMPORT_ROWS = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ParsedRow = { row: number; input: ExcelUserRow };
type ResolvedRow = { row: number; input: CreateUserRequest };
type RowIssue = { index: number; field?: keyof CreateUserRequest; message: string; kind: 'conflict' | 'not-found' | 'invalid' };

export class UserService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly orgRepo: OrganizationRepository,
        private readonly hashPassword: PasswordHasher,
        private readonly auth: typeof Auth,
    ) { }

    // getAll
    async getAllUsers(paging: PagingParams, ordering: OrderingParams<User>): Promise<PagingResult<User>> {
        try {
            const users = await this.userRepo.findAll(paging, ordering);
            return users
        }

        catch (error: unknown) {
            if (error instanceof Errors.ApiError) throw error;
            const err = error as {
                statusCode?: number;
                status?: number;
                message?: string;
            }
            throw new Errors.InternalServerError(err?.message ?? 'Failed to get all users')
        }
    }

    // getById
    async getUserById(id: string): Promise<User | null> {
        try {
            const user = await this.userRepo.findById(id);
            if (!user) {
                throw new Errors.NotFound('User not found')
            }
            return user
        }

        catch (error: unknown) {
            if (error instanceof Errors.ApiError) throw error;
            const err = error as {
                statusCode?: number;
                status?: number;
                message?: string;
            }
            throw new Errors.InternalServerError(err?.message ?? 'Failed to get user by id')
        }
    }

    // create (through Better Auth's admin plugin, which checks that the caller in `headers` may create users and set roles)
    async createUser(input: CreateUserRequest, headers: Headers): Promise<CreatedUserResult> {
        try {
            const normalized = this.normalize(input);
            const issues = await this.findIssues([normalized]);
            const issue = issues[0];
            if (issue) {
                if (issue.kind === 'conflict') throw new Errors.Conflict(issue.message);
                if (issue.kind === 'not-found') throw new Errors.NotFound(issue.message);
                throw new Errors.BadRequest(issue.message);
            }

            const [created] = await this.createWithTemporaryPasswords(
                [normalized],
                ([withPassword]) => this.createWithAdminPlugin(withPassword!, headers),
            );
            return created!;
        }

        catch (error: unknown) {
            if (error instanceof Errors.ApiError) throw error;
            if (isAPIError(error)) throw this.toApiError(error);
            const err = error as {
                statusCode?: number;
                status?: number;
                message?: string;
            }
            throw new Errors.InternalServerError(err?.message ?? 'Failed to create user')
        }
    }

    // create by excel (all-or-nothing: if any row is invalid, no user is created)
    async importUsersFromExcel(file: File): Promise<ImportUsersResult> {
        try {
            const rows = await this.parseExcel(file);

            const rowErrors: ImportRowError[] = [];
            const seenEmails = new Map<string, number>();

            rows.forEach(({ row, input }) => {
                for (const column of IMPORT_COLUMNS) {
                    if (!input[column]) {
                        rowErrors.push({ row, field: column, message: `${column} is required` });
                    }
                }
                if (input.email && !EMAIL_PATTERN.test(input.email)) {
                    rowErrors.push({ row, field: 'email', message: `Invalid email: ${input.email}` });
                }
                if (input.role && !USER_ROLES.includes(input.role)) {
                    rowErrors.push({ row, field: 'role', message: `Invalid role: ${input.role}. Allowed: ${USER_ROLES.join(', ')}` });
                }
                if (input.email) {
                    const firstRow = seenEmails.get(input.email);
                    if (firstRow !== undefined) {
                        rowErrors.push({ row, field: 'email', message: `Duplicate email in file (same as row ${firstRow})` });
                    } else {
                        seenEmails.set(input.email, row);
                    }
                }
            });

            // The checks below only run for rows that passed the checks above,
            // so the admin sees every problem in the file at once
            const invalidRows = new Set(rowErrors.map((e) => e.row));
            const validRows = rows.filter((r) => !invalidRows.has(r.row));

            // Department/position names -> ids
            const { resolved, errors: nameErrors } = await this.resolveOrganizationNames(validRows);
            rowErrors.push(...nameErrors);

            const issues = await this.findIssues(resolved.map((r) => r.input));
            for (const issue of issues) {
                rowErrors.push({ row: resolved[issue.index]!.row, field: issue.field === 'email' ? 'email' : undefined, message: issue.message });
            }

            if (rowErrors.length > 0) {
                rowErrors.sort((a, b) => a.row - b.row);
                throw new Errors.UnprocessableEntity('Excel file contains invalid rows; no users were created', rowErrors);
            }

            const users = await this.createWithTemporaryPasswords(
                resolved.map((r) => r.input),
                (inputs) => this.createWithCredentials(inputs),
            );
            return { total: users.length, users };
        }

        catch (error: unknown) {
            if (error instanceof Errors.ApiError) throw error;
            const err = error as {
                statusCode?: number;
                status?: number;
                message?: string;
            }
            throw new Errors.InternalServerError(err?.message ?? 'Failed to import users')
        }
    }

    // Looks up department by name, then the position by name inside that department
    // (position names are only unique within a department). Matching ignores case.
    private async resolveOrganizationNames(rows: ParsedRow[]): Promise<{ resolved: ResolvedRow[]; errors: ImportRowError[] }> {
        const departments = await this.orgRepo.findDepartmentsByNames(rows.map((r) => r.input.department));
        const positions = await this.orgRepo.findPositionsByDepartmentIds(departments.map((d) => d.id));

        const key = (name: string) => name.trim().toLowerCase();
        const departmentsByName = Map.groupBy(departments, (d) => key(d.name));
        const positionsByDepartmentAndName = Map.groupBy(positions, (p) => `${p.departmentId}|${key(p.name)}`);

        const resolved: ResolvedRow[] = [];
        const errors: ImportRowError[] = [];

        for (const { row, input } of rows) {
            const deptMatches = departmentsByName.get(key(input.department)) ?? [];
            if (deptMatches.length === 0) {
                errors.push({ row, field: 'department', message: `Department not found: ${input.department}` });
                continue;
            }
            if (deptMatches.length > 1) {
                errors.push({ row, field: 'department', message: `More than one department is named "${input.department}"` });
                continue;
            }
            const dept = deptMatches[0]!;

            const posMatches = positionsByDepartmentAndName.get(`${dept.id}|${key(input.position)}`) ?? [];
            if (posMatches.length === 0) {
                errors.push({ row, field: 'position', message: `Position "${input.position}" not found in department "${dept.name}"` });
                continue;
            }
            if (posMatches.length > 1) {
                errors.push({ row, field: 'position', message: `More than one position named "${input.position}" in department "${dept.name}"` });
                continue;
            }

            const { department: _d, position: _p, ...rest } = input;
            resolved.push({ row, input: { ...rest, departmentId: dept.id, positionId: posMatches[0]!.id } });
        }

        return { resolved, errors };
    }

    private normalize(input: CreateUserRequest): CreateUserRequest {
        return {
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            email: input.email.trim().toLowerCase(),
            role: input.role.trim().toLowerCase() as UserRole,
            departmentId: input.departmentId.trim(),
            positionId: input.positionId.trim(),
        };
    }

    // Checks that need the database: email already used, department/position exist,
    // and the position belongs to the given department.
    private async findIssues(inputs: CreateUserRequest[]): Promise<RowIssue[]> {
        if (inputs.length === 0) return [];
        const unique = (values: string[]) => [...new Set(values)];

        const [existingEmails, departments, positions] = await Promise.all([
            this.userRepo.findExistingEmails(unique(inputs.map((i) => i.email))),
            this.orgRepo.findDepartmentsByIds(unique(inputs.map((i) => i.departmentId))),
            this.orgRepo.findPositionsByIds(unique(inputs.map((i) => i.positionId))),
        ]);

        const emailSet = new Set(existingEmails);
        const departmentSet = new Set(departments.map((d) => d.id));
        const positionMap = new Map(positions.map((p) => [p.id, p]));

        const issues: RowIssue[] = [];
        inputs.forEach((input, index) => {
            if (emailSet.has(input.email)) {
                issues.push({ index, field: 'email', kind: 'conflict', message: `Email already exists: ${input.email}` });
            }
            if (!departmentSet.has(input.departmentId)) {
                issues.push({ index, field: 'departmentId', kind: 'not-found', message: `Department not found: ${input.departmentId}` });
            }
            const position = positionMap.get(input.positionId);
            if (!position) {
                issues.push({ index, field: 'positionId', kind: 'not-found', message: `Position not found: ${input.positionId}` });
            } else if (departmentSet.has(input.departmentId) && position.departmentId !== input.departmentId) {
                issues.push({ index, field: 'positionId', kind: 'invalid', message: `Position ${input.positionId} does not belong to department ${input.departmentId}` });
            }
        });
        return issues;
    }

    // Generates a temporary password per user and creates them with `createUsers`,
    // which must return the users in the same order as its inputs.
    private async createWithTemporaryPasswords(inputs: CreateUserRequest[], createUsers: UserCreator): Promise<CreatedUserResult[]> {
        const temporaryPasswords = inputs.map(() => generateTemporaryPassword());
        const users = await createUsers(inputs.map((input, i) => ({ ...input, password: temporaryPasswords[i]! })));
        return users.map((user, i) => ({ user, temporaryPassword: temporaryPasswords[i]! }));
    }

    // Used by import: all users are inserted in one transaction.
    private async createWithCredentials(inputs: NewUserWithPassword[]): Promise<User[]> {
        const passwordHashes = await Promise.all(inputs.map((input) => this.hashPassword(input.password)));
        // returning() keeps insert order, so index i matches inputs[i]
        return this.userRepo.createManyWithCredentials(
            inputs.map(({ password: _password, ...input }, i) => ({ ...input, passwordHash: passwordHashes[i]! })),
        );
    }

    // Used by createUser: Better Auth creates the user and its credential account.
    private async createWithAdminPlugin(input: NewUserWithPassword, headers: Headers): Promise<User[]> {
        const { user } = await this.auth.api.createUser({
            headers,
            body: {
                email: input.email,
                password: input.password,
                name: `${input.firstName} ${input.lastName}`,
                role: input.role,
                data: {
                    firstName: input.firstName,
                    lastName: input.lastName,
                    departmentId: input.departmentId,
                    positionId: input.positionId,
                },
            },
        });

        // Read back through the repository so the result has the same shape as other endpoints
        const created = await this.userRepo.findById(user.id);
        if (!created) throw new Errors.InternalServerError('Created user could not be read back');
        return [created];
    }

    private toApiError(error: { statusCode: number; message: string }): Errors.ApiError {
        switch (error.statusCode) {
            case 400: return new Errors.BadRequest(error.message);
            case 401: return new Errors.Unauthorized(error.message);
            case 403: return new Errors.Forbidden(error.message);
            case 404: return new Errors.NotFound(error.message);
            case 409: return new Errors.Conflict(error.message);
            default: return new Errors.InternalServerError(error.message);
        }
    }

    // Reads the first worksheet. Row 1 is the header; columns are matched by name,
    // so their order does not matter and extra columns (e.g. roleId) are ignored.
    private async parseExcel(file: File): Promise<ParsedRow[]> {
        const workbook = new ExcelJS.Workbook();
        try {
            await workbook.xlsx.load(await file.arrayBuffer());
        } catch {
            throw new Errors.BadRequest('File could not be read as an .xlsx workbook');
        }

        const sheet = workbook.worksheets[0];
        if (!sheet) throw new Errors.BadRequest('Excel file has no worksheet');

        const columnIndex = new Map<string, number>();
        sheet.getRow(1).eachCell((cell, col) => {
            columnIndex.set(cell.text.trim().toLowerCase(), col);
        });

        const missing = IMPORT_COLUMNS.filter((c) => !columnIndex.has(c.toLowerCase()));
        if (missing.length > 0) {
            throw new Errors.BadRequest(`Missing column(s) in header row: ${missing.join(', ')}`);
        }

        const rows: ParsedRow[] = [];
        for (let r = 2; r <= sheet.rowCount; r++) {
            const row = sheet.getRow(r);
            // cell.text gives the displayed value, which also handles hyperlink email cells
            const read = (column: string) => row.getCell(columnIndex.get(column.toLowerCase())!).text.trim();
            const values = Object.fromEntries(IMPORT_COLUMNS.map((c) => [c, read(c)])) as Record<(typeof IMPORT_COLUMNS)[number], string>;

            if (Object.values(values).every((v) => v === '')) continue; // skip blank rows

            rows.push({
                row: r,
                input: {
                    ...values,
                    email: values.email.toLowerCase(),
                    role: values.role.toLowerCase() as UserRole,
                },
            });
        }

        if (rows.length === 0) throw new Errors.BadRequest('Excel file has no user rows');
        if (rows.length > MAX_IMPORT_ROWS) {
            throw new Errors.BadRequest(`Too many rows: ${rows.length}. Maximum is ${MAX_IMPORT_ROWS} per file`);
        }
        return rows;
    }
}
