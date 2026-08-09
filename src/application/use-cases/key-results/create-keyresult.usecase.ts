import type { KeyResultRepository, CreateKeyResultInput } from "../../../domain/repositories/key-result-repo"
import type { ObjectiveRepository } from "../../../domain/repositories/objective-repo"
import type { KeyResult } from "../../../domain/entities/key-result.entity"

export class CreateKeyResultUseCase {
    constructor(
        private readonly keyResultRepo: KeyResultRepository,
        private readonly objectiveRepo: ObjectiveRepository,
    ) { }

    async execute(input: CreateKeyResultInput): Promise<KeyResult> {
        // Validate
        if (!input.title.trim()) throw new Error("Key Result title is required")
        if (input.targetValue <= input.startValue) throw new Error("targetValue must be greater than startValue")

        // เช็คว่า objective มีอยู่จริง
        const objective = await this.objectiveRepo.findById(input.objectiveId)
        if (!objective) throw new Error("Objective not found")

        return this.keyResultRepo.create(input)
    }
}