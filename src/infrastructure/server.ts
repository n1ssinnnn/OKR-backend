import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { container } from "./container"

// Controllers
import { createCyclesController } from "../interface/http/cycles/cycles.controller"
import { createObjectivesController } from "../interface/http/objectives/objectives.controller"
import { createKeyResultsController } from "../interface/http/key-results/key-results.controller"
import { createUsersController } from "../interface/http/users/users.controller"

export const createServer = () =>
    new Elysia()
        .use(cors())

        .get("/health", () => ({ status: "ok" }))

        .group("/api/v1", (app) =>
            app
                .use(createCyclesController(
                    container.createCycle,
                    container.getCycles,
                ))
                .use(createObjectivesController(
                    container.createObjective,
                    container.getObjectives,
                ))
                .use(createKeyResultsController(
                    container.createKeyResult,
                    container.submitCheckIn,
                ))
                .use(createUsersController(
                    container.getUsers,
                    container.bulkImport,
                ))
        )