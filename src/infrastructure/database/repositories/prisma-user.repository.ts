import type { Department, PrismaClient, Role } from "@prisma/client"
import type { UserRepository, CreateUserInput, BulkCreateResult, UpdateUserInput } from "../../../domain/repositories/user-repo"
import type { User } from "../../../domain/entities/user.entity"

type UserRow = {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
    password: string
    roleId: string
    role: Role
    departmentId: string
    department: Department
    createdAt: Date
    updatedAt: Date | null
    deletedAt: Date | null
}

export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    private mapToEntity(row: UserRow): User {
        return {
            id: row.id,
            name: row.name,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            password: row.password,
            roleId: row.roleId,
            role: row.role,
            departmentId: row.departmentId,
            department: row.department,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            deletedAt: row.deletedAt,
        }
    }

    private get include() {
        return {
            role: true,
            department: true,
        } as const
    }

    async findAll(): Promise<User[]> {
        const rows = await this.prisma.user.findMany({
            where: { deletedAt: null },
            include: this.include,
            orderBy: { createdAt: "desc" },
        })
        return rows.map(row => this.mapToEntity(row as UserRow))
    }

    async findById(id: string): Promise<User | null> {
        const row = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: this.include,
        })
        if (!row) return null
        return this.mapToEntity(row as UserRow)
    }

    async findByEmail(email: string): Promise<User | null> {
        const row = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: this.include,
        })
        if (!row) return null
        return this.mapToEntity(row as UserRow)
    }

    async create(data: CreateUserInput): Promise<User> {
        const row = await this.prisma.user.create({
            data,
            include: this.include,
        })
        return this.mapToEntity(row as UserRow)
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

            const dataWithHashedPassword = await Promise.all(
                success.map(async (u) => ({
                    id: u.id,
                    name: u.name,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    password: await Bun.password.hash("changeme123"),  // hash ทุกคน
                    roleId: u.roleId,
                    departmentId: u.departmentId,
                }))
            )

            await this.prisma.user.createMany({
                data: dataWithHashedPassword,
                skipDuplicates: true,
            })
        }

        return { success, failed }
    }

    async update(id: string, data: UpdateUserInput): Promise<User> {
        const row = await this.prisma.user.update({
            where: { id },
            data,
            include: this.include,
        })
        return this.mapToEntity(row as UserRow)
    }

    async delete(id: string): Promise<void> {
        // soft delete — ไม่ลบจริง แค่ set deletedAt
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        })
    }
}