import type { PrismaClient } from "@prisma/client"
import type { UserRepository, CreateUserInput, BulkCreateResult, UpdateUserInput } from "../../../domain/repositories/user-repo"
import type { User } from "../../../domain/entities/user.entity"

export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            include: { role: true, department: true, position: true },
        }) as Promise<User[]>
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: { role: true, department: true, position: true },
        }) as Promise<User | null>
    }

    async create(data: CreateUserInput): Promise<User> {
        return this.prisma.user.create({
            data,
            include: { role: true, department: true, position: true },
        }) as Promise<User>
    }

    async bulkCreate(data: CreateUserInput[]): Promise<BulkCreateResult> {
        const success: CreateUserInput[] = []
        const failed: BulkCreateResult["failed"] = []

        const existingUsers = await this.prisma.user.findMany({
            where: { email: { in: data.map(u => u.email) } },
            select: { email: true },
        })
        const existingEmails = new Set(existingUsers.map(u => u.email))

        for (const [index, user] of data.entries()) {
            if (existingEmails.has(user.email)) {
                failed.push({ row: index + 2, email: user.email, reason: "email already exists" })
                continue
            }
            success.push(user)
        }

        if (success.length > 0) {
            await this.prisma.user.createMany({
                data: success.map(u => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    password: u.password,
                    roleId: u.roleId ?? null,
                    departmentId: u.departmentId,
                    positionId: u.positionId
                })),
                skipDuplicates: true,
            })
        }

        return { success, failed }
    }

    async update(id: string, data: UpdateUserInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
            include: { role: true, department: true, position: true },
        }) as Promise<User>
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({ where: { id } })
    }
}