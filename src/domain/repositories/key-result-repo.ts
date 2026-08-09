import type { Prisma } from "@prisma/client"
import type { KeyResult } from "../entities/key-result.entity"

export type CreateKeyResultInput = Prisma.KeyResultUncheckedCreateInput
export type UpdateKeyResultInput = Prisma.KeyResultUncheckedUpdateInput

export interface KeyResultRepository {
    findById(id: string): Promise<KeyResult | null>
    findByObjective(objectiveId: string): Promise<KeyResult[]>
    create(data: CreateKeyResultInput): Promise<KeyResult>
    update(id: string, data: UpdateKeyResultInput): Promise<KeyResult>
}