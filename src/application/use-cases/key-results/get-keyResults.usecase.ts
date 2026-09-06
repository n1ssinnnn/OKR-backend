import type { KeyResultRepository } from "../../../domain/repositories/key-result-repo";


export class GetKeyResultsUseCase {
    constructor(private readonly keyResultRepo: KeyResultRepository) { }

    async executeByObjective(objectiveId: string) {
        const keyResult = await this.keyResultRepo.findByObjective(objectiveId)
        if (!keyResult) throw new Error("KeyResult not found")
        return keyResult
    }

}
