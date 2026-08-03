import type { KeyResult } from "./key-result.entity"
import type { User } from "./user.entity"

export interface CheckIn {
    id: string
    keyResultId: string
    keyResult: KeyResult
    userId: string
    user: User
    previousValue: number
    newValue: number
    note?: string | null
    createdAt: Date
}