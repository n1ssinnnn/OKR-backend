import Elysia from "elysia"
import { CreateKeyResultDTO, CheckInDTO } from "./key-results.dto"
import type { CreateKeyResultUseCase } from "../../../application/use-cases/key-results/create-keyresult.usecase"
import type { SubmitCheckInUseCase } from "../../../application/use-cases/checkins/submit-checkin.usecase"

export const createKeyResultsController = (
    createKeyResult: CreateKeyResultUseCase,
    submitCheckIn: SubmitCheckInUseCase,
) =>
    new Elysia({
        prefix: "/key-results",
        tags: ["Key Results"]
    })
        .post("/", async ({ body, status }) => {
            try {
                return await createKeyResult.execute({
                    ...body,
                    currentValue: body.startValue,
                })
            } catch (e: any) {
                return status(400, { message: e.message })
            }
        }, {
            body: CreateKeyResultDTO
        })

        .post("/:id/checkin", async ({ params, body, status, request }) => {
            try {
                const userId = request.headers.get("x-user-id") ?? ""
                return await submitCheckIn.execute({
                    keyResultId: params.id,
                    userId,
                    ...body,
                })
            } catch (e: any) {
                return status(400, { message: e.message })
            }
        }, {
            body: CheckInDTO,
        })