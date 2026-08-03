import type { User } from "../entities/user.entity"

export type CreateUserInput = Omit<User, "createdAt" | "updatedAt" | "deletedAt">

export type BulkCreateResult = {
	success: CreateUserInput[]
	failed: { row: number; email: string; reason: string }[]
}

export interface UserRepository {
	findById(id: string): Promise<User | null>
	findByEmail(email: string): Promise<User | null>  // สำคัญ — ใช้ตอน login
	findByTeam(teamId: string): Promise<User[]>
	create(data: CreateUserInput): Promise<User>
	bulkCreate(data: CreateUserInput[]): Promise<BulkCreateResult>
	update(id: string, data: Partial<User>): Promise<User>
	delete(id: string): Promise<void>
}