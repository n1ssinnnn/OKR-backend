import type { AuthPayload, LoginResult } from "../../../domain/entities/user.entity"
import type { UserRepository } from "../../../domain/repositories/user-repo"

export interface LoginInput {
    email: string
    password: string
}

export class LoginUseCase {
    constructor(private readonly userRepo: UserRepository) { }

    async execute(
        input: LoginInput,
        signJwt: (payload: AuthPayload) => Promise<string>
    ): Promise<LoginResult> {
        // 1. หา user จาก email
        const user = await this.userRepo.findByEmail(input.email)
        if (!user) throw new Error("Invalid email or password")

        // 2. เช็ค password
        const isMatch = await Bun.password.verify(input.password, user.password)
        if (!isMatch) throw new Error("Invalid email or password")

        // 3. Sign JWT
        const accessToken = await signJwt({
            userId: user.id,
            email: user.email,
            role: user.role.name,
        })

        // 4. Return token + user (ไม่ส่ง password กลับไป)
        const { password, ...userWithoutPassword } = user
        return { accessToken, user: userWithoutPassword }
    }
}