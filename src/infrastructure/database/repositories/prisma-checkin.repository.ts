import type { PrismaClient } from "@prisma/client"
import type { CheckInRepository, CreateCheckInInput } from "../../../domain/repositories/checkin-repo"
import type { CheckIn } from "../../../domain/entities/checkin.entity"

export class PrismaCheckInRepository implements CheckInRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<CheckIn | null> {
        return this.prisma.checkIn.findUnique({ where: { id } }) as unknown as Promise<CheckIn | null>
    }

    async findByKeyResult(keyResultId: string): Promise<CheckIn[]> {
        return this.prisma.checkIn.findMany({
            where: { keyResultId },
            orderBy: { createdAt: "desc" },
        }) as unknown as Promise<CheckIn[]>
    }

    async findByUser(userId: string): Promise<CheckIn[]> {
        return this.prisma.checkIn.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        }) as unknown as Promise<CheckIn[]>
    }

    async create(data: CreateCheckInInput): Promise<CheckIn> {
        return this.prisma.checkIn.create({ data }) as unknown as Promise<CheckIn>
    }
}