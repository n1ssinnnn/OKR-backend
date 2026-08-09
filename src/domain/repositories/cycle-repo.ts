import type { Prisma } from "@prisma/client"
import type { Cycle } from "../entities/cycle.entity"

export type CreateCycleInput = Prisma.CycleUncheckedCreateInput
export type UpdateCycleInput = Prisma.CycleUncheckedUpdateInput

export interface CycleRepository {
    findById(id: string): Promise<Cycle | null>
    findAll(): Promise<Cycle[]>
    findActive(): Promise<Cycle | null>
    create(data: CreateCycleInput): Promise<Cycle>
    update(id: string, data: UpdateCycleInput): Promise<Cycle>
    delete(id: string): Promise<void>
}