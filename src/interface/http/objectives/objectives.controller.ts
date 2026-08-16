import Elysia, { t } from "elysia"
import { CreateObjectiveDTO } from "./objectives.dto"
import type { CreateObjectiveUseCase } from "../../../application/use-cases/objectives/create-objective.usecase"
import type { GetObjectivesUseCase } from "../../../application/use-cases/objectives/get-objectives.usecase"

export const createObjectivesController = (
    createObjective: CreateObjectiveUseCase,
    getObjectives: GetObjectivesUseCase,
) =>
    new Elysia({
        prefix: "/objectives",
        detail: { tags: ['Objectives'] },
    })
        .get("/", async ({ query, status }) => {
            try {
                return await getObjectives.executeByCycle(query.cycleId)
            } catch (e: any) {
                return status(400, { message: e.message })
            }
        }, {
            query: t.Object({ cycleId: t.String() }),
        })

        .get("/:id", async ({ params, status }) => {
            try {
                return await getObjectives.executeById(params.id)
            } catch (e: any) {
                return status(404, { message: e.message })
            }
        },
        )

        .post("/", async ({ body, status }) => {
            try {
                return await createObjective.execute(body)
            } catch (e: any) {
                return status(400, { message: e.message })
            }
        }, {
            body: CreateObjectiveDTO
        })