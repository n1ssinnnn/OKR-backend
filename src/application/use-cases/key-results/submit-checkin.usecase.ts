import type { CheckInRepository, CreateCheckInInput } from "../../../domain/repositories/checkin-repo"
import type { KeyResultRepository } from "../../../domain/repositories/key-result-repo"
import type { ObjectiveRepository } from "../../../domain/repositories/objective-repo"
import { calculateKRProgress } from "../../../domain/entities/key-result.entity"
import { calculateObjectiveProgress, deriveStatus } from "../../../domain/entities/objective.entity"

export interface SubmitCheckInInput {
    keyResultId: string
    userId: string
    newValue: number
    note?: string
}

export class SubmitCheckInUseCase {
    constructor(
        private readonly checkInRepo: CheckInRepository,
        private readonly keyResultRepo: KeyResultRepository,
        private readonly objectiveRepo: ObjectiveRepository,
    ) { }

    async execute(input: SubmitCheckInInput) {
        // 1. ดึง KR
        const kr = await this.keyResultRepo.findById(input.keyResultId)
        if (!kr) throw new Error("Key Result not found")

        // 2. คำนวณ progress ใหม่ (business logic จาก domain)
        const newProgress = calculateKRProgress({
            startValue: kr.startValue,
            targetValue: kr.targetValue,
            currentValue: input.newValue,
        })

        // 3. บันทึก check-in (audit trail)
        const checkIn = await this.checkInRepo.create({
            keyResultId: kr.id,
            userId: input.userId,
            previousValue: kr.currentValue,
            newValue: input.newValue,
            note: input.note,
        })

        // 4. Update KR
        await this.keyResultRepo.update(kr.id, {
            currentValue: input.newValue,
            progress: newProgress,
        })

        // 5. Recalculate Objective progress
        const allKRs = await this.keyResultRepo.findByObjective(kr.objectiveId)
        const objProgress = calculateObjectiveProgress(allKRs.map(k => k.progress))
        const objStatus = deriveStatus(objProgress)

        await this.objectiveRepo.update(kr.objectiveId, {
            progress: objProgress,
            status: objStatus,
        })

        return { checkIn, newProgress, objProgress, objStatus }
    }
}