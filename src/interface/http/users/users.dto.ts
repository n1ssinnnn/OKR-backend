import { t } from "elysia"

export const BulkImportDTO = t.Object({
    file: t.File({ type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
})

export const CreateUserDTO = t.Object({
    firstName: t.String({ minLength: 1 }),
    lastName: t.String({ minLength: 1 }),
    email: t.String({ format: "email" }),
    roleId: t.String({ minLength: 1 }),
    departmentId: t.String({ minLength: 1 }),
})