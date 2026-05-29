import { Elysia } from "elysia";

export const createServer = () =>
    new Elysia()
        .get("/health", () => ({ status: "ok" }))