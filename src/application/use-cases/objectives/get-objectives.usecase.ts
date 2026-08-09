import type { ObjectiveRepository } from "../../../domain/repositories/objective-repo"
import type { KeyResultRepository } from "../../../domain/repositories/key-result-repo"

export class GetObjectivesUseCase {
    constructor(
        private readonly objectiveRepo: ObjectiveRepository,
        private readonly keyResultRepo: KeyResultRepository,
    ) { }

    // ดึงทั้งหมดใน cycle พร้อม KRs
    async executeByCycle(cycleId: string) {
        const objectives = await this.objectiveRepo.findByCycle(cycleId)

        // attach KRs ให้แต่ละ objective
        const result = await Promise.all(
            objectives.map(async (obj) => ({
                ...obj,
                keyResults: await this.keyResultRepo.findByObjective(obj.id),
            }))
        )

        return result
    }

    async executeById(id: string) {
        const objective = await this.objectiveRepo.findById(id)
        if (!objective) throw new Error("Objective not found")

        const keyResults = await this.keyResultRepo.findByObjective(id)
        return { ...objective, keyResults }
    }
}