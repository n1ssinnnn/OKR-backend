import type { PrismaClient } from "@prisma/client"
import type { KeyResultRepository, CreateKeyResultInput, UpdateKeyResultInput } from "../../../domain/repositories/key-result-repo"
import type { KeyResult } from "../../../domain/entities/key-result.entity"

export class PrismaKeyResultRepository implements KeyResultRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<KeyResult | null> {
        return this.prisma.keyResult.findUnique({ where: { id } }) as unknown as Promise<KeyResult | null>
    }

    async findByObjective(objectiveId: string): Promise<KeyResult[]> {
        return this.prisma.keyResult.findMany({ where: { objectiveId } }) as unknown as Promise<KeyResult[]>
    }

    async create(data: CreateKeyResultInput): Promise<KeyResult> {
        return this.prisma.keyResult.create({
            data: { ...data, progress: 0 },
        }) as unknown as Promise<KeyResult>
    }

    async update(id: string, data: UpdateKeyResultInput): Promise<KeyResult> {
        return this.prisma.keyResult.update({ where: { id }, data }) as unknown as Promise<KeyResult>
    }
}