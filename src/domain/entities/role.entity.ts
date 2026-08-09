import type { User } from "./user.entity"

export interface Role {
  id: string
  name: string
  users?: User[]
  createdAt: Date
}