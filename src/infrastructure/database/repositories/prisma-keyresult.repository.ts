import type { PrismaClient } from "@prisma/client"
import type { KeyResultRepository, CreateKeyResultInput, UpdateKeyResultInput } from "../../../domain/repositories/key-result-repo"
import type { KeyResult, KRType } from "../../../domain/entities/key-result.entity"
import type { Objective } from "../../../domain/entities/objective.entity"
import type { CheckIn } from "../../../domain/entities/checkin.entity"

type KeyResultRow = {
    id: string
    objectiveId: string
    objective: Objective
    title: string
    type: KRType
    startValue: number
    targetValue: number
    currentValue: number
    progress: number
    checkIns?: CheckIn[]
    updatedAt: Date
}

export class PrismaKeyResultRepository implements KeyResultRepository {
    constructor(private readonly prisma: PrismaClient) { }

    private mapToEntity(row: KeyResultRow): KeyResult {
        return {
            id: row.id,
            objectiveId: row.objectiveId,
            objective: row.objective,
            title: row.title,
            type: row.type,
            startValue: row.startValue,
            targetValue: row.targetValue,
            currentValue: row.currentValue,
            progress: row.progress,
            checkIns: row.checkIns ?? undefined,
            updatedAt: row.updatedAt,
        }
    }

    private get include() {
        return {
            objective: true,
        } as const
    }

    async findById(id: string): Promise<KeyResult | null> {
        const row = await this.prisma.keyResult.findUnique({
            where: { id },
            include: this.include,
        })
        if (!row) return null
        return this.mapToEntity(row as unknown as KeyResultRow)
    }

    async findByObjective(objectiveId: string): Promise<KeyResult[]> {
        const rows = await this.prisma.keyResult.findMany({
            where: { objectiveId },
            include: this.include,
        })
        return rows.map(row => this.mapToEntity(row as unknown as KeyResultRow))
    }

    async create(data: CreateKeyResultInput): Promise<KeyResult> {
        const row = await this.prisma.keyResult.create({
            data: { ...data, progress: 0 },
            include: this.include,
        })
        return this.mapToEntity(row as unknown as KeyResultRow)
    }

    async update(id: string, data: UpdateKeyResultInput): Promise<KeyResult> {
        const row = await this.prisma.keyResult.update({
            where: { id },
            data,
            include: this.include,
        })
        return this.mapToEntity(row as unknown as KeyResultRow)
    }
}