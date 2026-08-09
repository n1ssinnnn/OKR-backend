import type { PrismaClient } from "@prisma/client"
import type { CycleRepository, CreateCycleInput, UpdateCycleInput } from "../../../domain/repositories/cycle-repo"
import type { Cycle } from "../../../domain/entities/cycle.entity"

export class PrismaCycleRepository implements CycleRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Cycle | null> {
        return this.prisma.cycle.findUnique({ where: { id } }) as Promise<Cycle | null>
    }

    async findAll(): Promise<Cycle[]> {
        return this.prisma.cycle.findMany({ orderBy: { startDate: "desc" } }) as Promise<Cycle[]>
    }

    async findActive(): Promise<Cycle | null> {
        return this.prisma.cycle.findFirst({ where: { status: "ACTIVE" } }) as Promise<Cycle | null>
    }

    async create(data: CreateCycleInput): Promise<Cycle> {
        return this.prisma.cycle.create({ data }) as Promise<Cycle>
    }

    async update(id: string, data: UpdateCycleInput): Promise<Cycle> {
        return this.prisma.cycle.update({ where: { id }, data }) as Promise<Cycle>
    }

    async delete(id: string): Promise<void> {
        await this.prisma.cycle.delete({ where: { id } })
    }
}