import type { CheckIn } from "../entities/checkin-entity"

export type CreateCheckInInput = Omit<CheckIn, "id" | "createdAt">

export interface CheckInRepository {
    findById(id: string): Promise<CheckIn | null>
    findByKeyResult(keyResultId: string): Promise<CheckIn[]>  // ดู history ของ KR
    findByUser(userId: string): Promise<CheckIn[]>            // ดูว่า user คนนี้ checkin อะไรบ้าง
    create(data: CreateCheckInInput): Promise<CheckIn>
}