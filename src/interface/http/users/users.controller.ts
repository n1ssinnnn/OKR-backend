import Elysia, { status } from "elysia"
import { BulkImportDTO, CreateUserDTO } from "./users.dto"
import type { CreateUserUseCase } from "../../../application/use-cases/users/create-user.usecase"
import type { GetUsersUseCase } from "../../../application/use-cases/users/get-users.usecase"
import type { BulkImportUsersUseCase } from "../../../application/use-cases/users/bulk-import-users.usecase"

export const createUsersController = (
    createUser: CreateUserUseCase,
    getUsers: GetUsersUseCase,
    bulkImport: BulkImportUsersUseCase,
) =>
    new Elysia({
        prefix: "/users",
        detail: { tags: ['Users'] },
    })
        .post("/", async ({ body, status }) => {
            try {
                return await createUser.execute(body)
            } catch (e: any) {
                return status(400, { message: e.message })
            }
        }, {
            body: CreateUserDTO,
        })
        .get("/", () => getUsers.execute())

        .get("/:id", async ({ params, status }) => {
            try {
                return await getUsers.executeById(params.id)
            } catch (e: any) {
                return status(404, { message: e.message })
            }
        }
        )

        .post("/bulk-import", async ({ body, status }) => {
            try {
                const buffer = Buffer.from(await body.file.arrayBuffer())
                return await bulkImport.execute(buffer)
            } catch (e: any) {
                return status(400, { message: e.message })
            }
        }, {
            body: BulkImportDTO,
        }
        )