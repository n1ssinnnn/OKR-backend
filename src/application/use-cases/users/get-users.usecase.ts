import type { User } from "../../../domain/entities/user.entity"
import type { UserRepository } from "../../../domain/repositories/user-repo"

export class GetUsersUseCase {
    constructor(private readonly userRepo: UserRepository) { }

    async execute(): Promise<User[]> {
        return this.userRepo.findAll()
    }

    async executeById(id: string) {
        const user = await this.userRepo.findById(id)
        if (!user) throw new Error("User not found")
        return user
    }
}