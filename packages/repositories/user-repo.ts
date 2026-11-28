import { db } from "../db";
import { account, user, type Schema } from "../db/schema";
import { ORDER_DIRECTION, type OrderingParams, type PagingParams, type PagingResult } from "../domains/entities/common";
import type { User } from "../domains/entities/user";
import type { CreateUserRequest } from "../domains/dto/user";
import { count, eq, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { buildPagingResult } from "../domains/helper/paging";

type UserQueryRow = typeof Schema.user.$inferSelect

export type NewUserWithCredential = CreateUserRequest & {
    passwordHash: string;
};

export class UserRepository {

    mapToEntity(row: UserQueryRow): User {
        return {
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            name: row.name,
            email: row.email,
            emailVerified: row.emailVerified,
            image: row.image,
            role: row.role,
            departmentId: row.departmentId,
            positionId: row.positionId,
            status: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            banned: row.banned,
            banReason: row.banReason,
            banExpires: row.banExpires,
        };
    }

    // Soft-deleted users (isActive = false) are left out of every find below,
    // so they behave as if they did not exist.

    // Find by ID
    async findById(id: string): Promise<User | null> {
        const row = await db.query.user.findFirst({
            where: (user, { and, eq }) => and(eq(user.id, id), eq(user.isActive, true)),
        });

        if (!row) {
            return null;
        }

        return this.mapToEntity(row as UserQueryRow);
    }

    // Find by email
    async findByEmail(email: string): Promise<User | null> {
        const row = await db.query.user.findFirst({
            where: (user, { and, eq }) => and(eq(user.email, email), eq(user.isActive, true)),
        });

        if (!row) {
            return null;
        }

        return this.mapToEntity(row as UserQueryRow);
    }

    // Find All
    async findAll(paging: PagingParams, ordering: OrderingParams<User>): Promise<PagingResult<User>> {
        const orderByKey =
            ordering.orderBy as keyof typeof Schema.user.$inferSelect;
        const isAsc = ordering.orderDirection === ORDER_DIRECTION.ASC;

        const [rows, countResult] = await Promise.all([
            db.query.user.findMany({
                where: (users, { eq }) => eq(users.isActive, true),
                orderBy: (users, { asc, desc }) =>
                    isAsc ? asc(users[orderByKey]) : desc(users[orderByKey]),
                limit: paging.perPage,
                offset: (paging.page - 1) * paging.perPage,
            }),
            db.select({ total: count() }).from(user).where(eq(user.isActive, true)),
        ])

        return buildPagingResult(
            rows.map((row) => this.mapToEntity(row as UserQueryRow)),
            Number(countResult[0]?.total ?? 0),
            paging,
        );
    }

    // Find which of the given emails are already registered.
    // Soft-deleted users are included on purpose: email is unique in the table, so their email cannot be reused.
    async findExistingEmails(emails: string[]): Promise<string[]> {
        if (emails.length === 0) return [];
        const rows = await db
            .select({ email: user.email })
            .from(user)
            .where(inArray(user.email, emails));
        return rows.map((row) => row.email);
    }

    // Create users with their Better Auth credential accounts.
    // All rows are inserted in one transaction: either every user is created or none.
    async createManyWithCredentials(inputs: NewUserWithCredential[]): Promise<User[]> {
        if (inputs.length === 0) return [];

        const userRows = inputs.map((input) => ({
            id: createId(),
            firstName: input.firstName,
            lastName: input.lastName,
            name: `${input.firstName} ${input.lastName}`,
            email: input.email,
            role: input.role,
            departmentId: input.departmentId,
            positionId: input.positionId,
        }));

        // Same shape Better Auth writes for email/password sign-up,
        // so these users can sign in through /auth/sign-in.
        const accountRows = userRows.map((row, i) => ({
            id: createId(),
            accountId: row.id,
            providerId: 'credential',
            userId: row.id,
            password: inputs[i]!.passwordHash,
        }));

        const created = await db.transaction(async (tx) => {
            const inserted = await tx.insert(user).values(userRows).returning();
            await tx.insert(account).values(accountRows);
            return inserted;
        });

        return created.map((row) => this.mapToEntity(row));
    }
}
