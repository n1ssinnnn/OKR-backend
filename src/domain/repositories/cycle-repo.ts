import type { Cycle } from "../entities/okr-cycle-entity"

export type CreateCycleInput = Omit<Cycle, "id" | "createdAt" | "updatedAt">

export interface CycleRepository {
    findById(id: string): Promise<Cycle | null>
    findAll(): Promise<Cycle[]>
    findActive(): Promise<Cycle | null>   // ใช้บ่อย — ดึง cycle ที่กำลัง active อยู่
    create(data: CreateCycleInput): Promise<Cycle>
    update(id: string, data: Partial<Cycle>): Promise<Cycle>
    delete(id: string): Promise<void>
}