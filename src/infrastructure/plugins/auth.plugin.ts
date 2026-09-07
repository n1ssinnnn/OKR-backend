import Elysia from "elysia"
import { jwt } from "@elysiajs/jwt"
import type { AuthPayload } from "../../domain/entities/user.entity"

export const authPlugin = new Elysia({ name: "auth" })
    .use(jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET!,
    }))
    .derive(async ({ jwt, headers, status }) => {
        const authHeader = headers["authorization"]
        if (!authHeader?.startsWith("Bearer ")) {
            return status(401, { message: "Unauthorized" })
        }

        const token = authHeader.split(" ")[1]
        const payload = await jwt.verify(token) as AuthPayload | false

        if (!payload) return status(401, { message: "Invalid token" })

        return { user: payload }   // inject user เข้า context ทุก route ที่ใช้ plugin นี้
    })