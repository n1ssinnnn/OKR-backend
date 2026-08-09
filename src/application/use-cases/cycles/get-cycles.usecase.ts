import type { CycleRepository } from "../../../domain/repositories/cycle-repo"
import type { Cycle } from "../../../domain/entities/cycle.entity"

export class GetCyclesUseCase {
    constructor(private readonly cycleRepo: CycleRepository) { }

    async execute(): Promise<Cycle[]> {
        return this.cycleRepo.findAll()
    }

    async executeGetActive(): Promise<Cycle | null> {
        return this.cycleRepo.findActive()
    }
}