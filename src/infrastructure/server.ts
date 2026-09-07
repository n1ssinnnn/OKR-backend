import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { container } from "./container"

import { createCyclesController } from "../interface/http/cycles/cycles.controller"
import { createObjectivesController } from "../interface/http/objectives/objectives.controller"
import { createKeyResultsController } from "../interface/http/key-results/key-results.controller"
import { createUsersController } from "../interface/http/users/users.controller"
import { createAuthController } from "../interface/http/auth/auth.controller"
import { authPlugin } from "./plugins/auth.plugin"

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
                    { name: "Auth", description: "Authentication" },
                    { name: "Users", description: "Manage Users" },
                    { name: "Cycles", description: "Manage OKR Cycles" },
                    { name: "Objectives", description: "Manage Objectives" },
                    { name: "Key Results", description: "Manage Key Results and Check-ins" },
                ],
            },
        }))

        // Public routes — ไม่ต้อง login
        .group("/api/v1", (app) =>
            app.use(createAuthController(container.login))
        )

        .group("/api/v1", (app) =>
            app
                .use(authPlugin)
                .use(createCyclesController(container.createCycle, container.getCycles))
                .use(createObjectivesController(container.createObjective, container.getObjectives))
                .use(createKeyResultsController(container.createKeyResult, container.getKeyResults, container.submitCheckIn))
                .use(createUsersController(container.createUser, container.getUsers, container.bulkImport))
        )