import type { PrismaClient } from "@prisma/client"
import type { ObjectiveRepository, CreateObjectiveInput, UpdateObjectiveInput } from "../../../domain/repositories/objective-repo"
import type { Objective } from "../../../domain/entities/objective.entity"

export class PrismaObjectiveRepository implements ObjectiveRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Objective | null> {
        return this.prisma.objective.findUnique({ where: { id } }) as unknown as Promise<Objective | null>
    }

    async findByCycle(cycleId: string): Promise<Objective[]> {
        return this.prisma.objective.findMany({
            where: { cycleId },
            orderBy: { createdAt: "desc" },
        }) as unknown as Promise<Objective[]>
    }

    async create(data: CreateObjectiveInput): Promise<Objective> {
        return this.prisma.objective.create({
            data: { ...data, status: "ON_TRACK", progress: 0 },
        }) as unknown as Promise<Objective>
    }

    async update(id: string, data: UpdateObjectiveInput): Promise<Objective> {
        return this.prisma.objective.update({ where: { id }, data }) as unknown as Promise<Objective>
    }

    async delete(id: string): Promise<void> {
        await this.prisma.objective.delete({ where: { id } })
    }
}