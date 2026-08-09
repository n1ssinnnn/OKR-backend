import type { User } from "./user.entity"

export interface Department {
  id: string
  name: string
  users?: User[]
  createdAt: Date
}