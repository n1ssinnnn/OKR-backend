import type { Prisma } from "@prisma/client"
import type { User } from "../entities/user.entity"

export type CreateUserInput = Prisma.UserUncheckedCreateInput
export type UpdateUserInput = Prisma.UserUncheckedUpdateInput

export type BulkCreateResult = {
	success: CreateUserInput[]
	failed: { row: number; email: string; reason: string }[]
}

export interface UserRepository {
	findAll(): Promise<User[]>
	findById(id: string): Promise<User | null>
	findByEmail(email: string): Promise<User | null>
	create(data: CreateUserInput): Promise<User>
	bulkCreate(data: CreateUserInput[]): Promise<BulkCreateResult>
	update(id: string, data: UpdateUserInput): Promise<User>
	delete(id: string): Promise<void>
}