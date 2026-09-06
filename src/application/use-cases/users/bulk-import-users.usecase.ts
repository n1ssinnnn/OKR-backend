import type { UserRepository } from "../../../domain/repositories/user-repo"
import { parseUserExcel } from "../../../infrastructure/excel/excel.parser"

export class BulkImportUsersUseCase {
    constructor(private readonly userRepo: UserRepository) { }

    async execute(fileBuffer: Buffer) {
        // 1. Parse Excel
        const { rows, errors: parseErrors } = parseUserExcel(fileBuffer)

        if (rows.length === 0) {
            return {
                imported: 0,
                failed: parseErrors,
                message: "No valid rows found",
            }
        }

        // 2. Bulk insert
        const { success, failed: insertFailed } = await this.userRepo.bulkCreate(
            rows.map(r => ({
                name: `${r.firstName} ${r.lastName}`,
                firstName: r.firstName,
                lastName: r.lastName,
                email: r.email,
                password: "1234",
                roleId: r.roleId,
                departmentId: r.departmentId,
            }))
        )

        return {
            imported: success.length,
            failed: [...parseErrors, ...insertFailed],
            message: `Imported ${success.length} users, ${insertFailed.length} failed`,
        }
    }
}