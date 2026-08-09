import type { ObjectiveRepository, CreateObjectiveInput } from "../../../domain/repositories/objective-repo"
import type { CycleRepository } from "../../../domain/repositories/cycle-repo"
import type { Objective } from "../../../domain/entities/objective.entity"
import { isCycleActive } from "../../../domain/entities/cycle.entity"

export class CreateObjectiveUseCase {
    constructor(
        private readonly objectiveRepo: ObjectiveRepository,
        private readonly cycleRepo: CycleRepository,
    ) { }

    async execute(input: CreateObjectiveInput): Promise<Objective> {
        // Validate
        if (!input.title.trim()) throw new Error("Objective title is required")

        // เช็ค cycle ว่า active อยู่มั้ย
        const cycle = await this.cycleRepo.findById(input.cycleId)
        if (!cycle) throw new Error("Cycle not found")
        if (!isCycleActive(cycle)) throw new Error("Cannot create objective in an inactive cycle")

        // เช็ค parent ถ้ามี
        if (input.parentObjectiveId) {
            const parent = await this.objectiveRepo.findById(input.parentObjectiveId)
            if (!parent) throw new Error("Parent objective not found")
            if (parent.cycleId !== input.cycleId) throw new Error("Parent must be in the same cycle")
        }

        return this.objectiveRepo.create(input)
    }
}