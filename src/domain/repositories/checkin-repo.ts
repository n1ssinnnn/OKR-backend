import type { Prisma } from "@prisma/client"
import type { CheckIn } from "../entities/checkin.entity"

export type CreateCheckInInput = Prisma.CheckInUncheckedCreateInput

export interface CheckInRepository {
    findById(id: string): Promise<CheckIn | null>
    findByKeyResult(keyResultId: string): Promise<CheckIn[]>
    findByUser(userId: string): Promise<CheckIn[]>
    create(data: CreateCheckInInput): Promise<CheckIn>
}