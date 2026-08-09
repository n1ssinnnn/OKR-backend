import type { CycleRepository, CreateCycleInput } from "../../../domain/repositories/cycle-repo"
import type { Cycle } from "../../../domain/entities/cycle.entity"

export class CreateCycleUseCase {
    constructor(private readonly cycleRepo: CycleRepository) { }

    async execute(input: CreateCycleInput): Promise<Cycle> {
        // Validate
        if (!input.name.trim()) throw new Error("Cycle name is required")
        if (input.startDate >= input.endDate) throw new Error("startDate must be before endDate")

        // ถ้าจะ ACTIVE ต้องเช็คว่าไม่มี cycle อื่น active อยู่แล้ว
        if (input.status === "ACTIVE") {
            const existing = await this.cycleRepo.findActive()
            if (existing) throw new Error(`Cycle "${existing.name}" is already active`)
        }

        return this.cycleRepo.create(input)
    }
}