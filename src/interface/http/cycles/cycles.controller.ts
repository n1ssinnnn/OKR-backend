import Elysia from "elysia"
import { CreateCycleDTO } from "./cycles.dto"
import type { CreateCycleUseCase } from "../../../application/use-cases/cycles/create-cycle.usecase"
import type { GetCyclesUseCase } from "../../../application/use-cases/cycles/get-cycles.usecase"

export const createCyclesController = (
    createCycle: CreateCycleUseCase,
    getCycles: GetCyclesUseCase,
) =>
    new Elysia({ prefix: "/cycles" })
        .get("/", () => getCycles.execute(), {
            detail: { tags: ["Cycles"], summary: "ดึง cycles ทั้งหมด" },
        })

        .get("/active", async ({ status }) => {
            const cycle = await getCycles.executeGetActive()
            if (!cycle) return status(404, { message: "No active cycle found" })
            return cycle
        }, {
            detail: { tags: ["Cycles"], summary: "ดึง active cycle" },
        })

        .post("/", async ({ body, status }) => {
            try {
                return await createCycle.execute({
                    ...body,
                    startDate: new Date(body.startDate),
                    endDate: new Date(body.endDate),
                    status: body.status ?? "DRAFT",
                })
            } catch (e: any) {
                return status(400, { message: e.message })
            }
        }, {
            body: CreateCycleDTO,
            detail: { tags: ["Cycles"], summary: "สร้าง cycle ใหม่" },
        })