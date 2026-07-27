import type { KeyResult } from "../entities/key-result.entity"

export type CreateKeyResultInput = Omit<KeyResult, "id" | "progress" | "updatedAt">

export interface KeyResultRepository {
    findById(id: string): Promise<KeyResult | null>
    findByObjective(objectiveId: string): Promise<KeyResult[]>
    create(data: CreateKeyResultInput): Promise<KeyResult>
    update(id: string, data: Partial<KeyResult>): Promise<KeyResult>
}