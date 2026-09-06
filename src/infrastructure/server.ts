import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { container } from "./container"

import { createCyclesController } from "../interface/http/cycles/cycles.controller"
import { createObjectivesController } from "../interface/http/objectives/objectives.controller"
import { createKeyResultsController } from "../interface/http/key-results/key-results.controller"
import { createUsersController } from "../interface/http/users/users.controller"

export const createServer = () =>
    new Elysia()
        .use(cors())
        .use(swagger({
            documentation: {
                info: {
                    title: "OKR Management API",
                    version: "1.0.0",
                    description: "API สำหรับระบบ OKR Management",
                },
                tags: [
                    { name: "Cycles", description: "จัดการ OKR Cycles" },
                    { name: "Objectives", description: "จัดการ Objectives" },
                    { name: "Key Results", description: "จัดการ Key Results และ Check-ins" },
                    { name: "Users", description: "จัดการ Users" },
                ],
            },
        }))

        .get("/health", () => ({ status: "ok" }), {
            detail: { tags: ["Health"], summary: "Health check" },
        })

        .group("/api/v1", (app) =>
            app
                .use(createCyclesController(container.createCycle, container.getCycles))
                .use(createObjectivesController(container.createObjective, container.getObjectives))
                .use(createKeyResultsController(container.createKeyResult, container.getKeyResults, container.submitCheckIn))
                .use(createUsersController(container.createUser, container.getUsers, container.bulkImport))
        )