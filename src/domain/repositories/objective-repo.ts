import type { Prisma } from "@prisma/client"
import type { Objective } from "../entities/objective.entity"

export type CreateObjectiveInput = Prisma.ObjectiveUncheckedCreateInput
export type UpdateObjectiveInput = Prisma.ObjectiveUncheckedUpdateInput

export interface ObjectiveRepository {
    findById(id: string): Promise<Objective | null>
    findByCycle(cycleId: string): Promise<Objective[]>
    create(data: CreateObjectiveInput): Promise<Objective>
    update(id: string, data: UpdateObjectiveInput): Promise<Objective>
    delete(id: string): Promise<void>
}