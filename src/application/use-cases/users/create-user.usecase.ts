import type { User } from "../../../domain/entities/user.entity"
import type { CreateUserInput, UserRepository } from "../../../domain/repositories/user-repo"

export type CreateUserRequest = {
    firstName: string
    lastName: string
    email: string
    roleId: string
    departmentId: string
}

export class CreateUserUseCase {
    constructor(private readonly userRepo: UserRepository) { }

    async execute(input: CreateUserRequest): Promise<User> {
        const firstName = input.firstName.trim()
        const lastName = input.lastName.trim()
        const email = input.email.trim().toLowerCase()

        if (!firstName) throw new Error("firstName is required")
        if (!lastName) throw new Error("lastName is required")
        if (!email) throw new Error("email is required")
        if (!input.roleId) throw new Error("roleId is required")
        if (!input.departmentId) throw new Error("departmentId is required")

        const data: CreateUserInput = {
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email,
            password: "1234",
            roleId: input.roleId,
            departmentId: input.departmentId,
        }

        return this.userRepo.create(data)
    }
}