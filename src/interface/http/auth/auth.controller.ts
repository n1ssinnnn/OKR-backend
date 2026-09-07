import Elysia from "elysia"
import { jwt } from "@elysiajs/jwt"
import { LoginDTO } from "./auth.dto"
import type { LoginUseCase } from "../../../application/use-cases/auth/login.usecase"
import type { AuthPayload } from "../../../domain/entities/user.entity"

export const createAuthController = (loginUseCase: LoginUseCase) =>
    new Elysia({ prefix: "/auth" })
        .use(jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET!,
        }))

        .post("/login", async ({ body, jwt, status }) => {
            try {
                return await loginUseCase.execute(
                    body,
                    (payload: AuthPayload) => jwt.sign({ ...payload }),
                )
            } catch (e: any) {
                return status(401, { message: e.message })
            }
        }, {
            body: LoginDTO,
            detail: { tags: ["Auth"], summary: "Login" },
        })