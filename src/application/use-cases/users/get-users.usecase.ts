import type { UserRepository } from "../../../domain/repositories/user-repo"

export class GetUsersUseCase {
    constructor(private readonly userRepo: UserRepository) { }

    async executeById(id: string) {
        const user = await this.userRepo.findById(id)
        if (!user) throw new Error("User not found")
        return user
    }
}