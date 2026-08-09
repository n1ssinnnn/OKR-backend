import type { User } from "./user.entity"

export interface Position {
    id: string
    name: string
    users?: User[]
    createdAt: Date
}