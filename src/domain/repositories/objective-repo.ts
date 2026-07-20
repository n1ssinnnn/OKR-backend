import type { Objective } from "../entities/objective.entity"

export type CreateObjectiveInput = Omit<
    Objective,
    "id" | "status" | "progress" | "createdAt" | "updatedAt"
>

export interface ObjectiveRepository {
    findById(id: string): Promise<Objective | null>
    findByCycle(cycleId: string): Promise<Objective[]>
    create(data: CreateObjectiveInput): Promise<Objective>
    update(id: string, data: Partial<Objective>): Promise<Objective>
    delete(id: string): Promise<void>
}