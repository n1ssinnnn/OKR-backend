import type { Cycle } from "./cycle.entity"
import type { KeyResult } from "./key-result.entity"

export enum OwnerType {
    USER = "USER",
    TEAM = "TEAM",
    COMPANY = "COMPANY",
}

export enum OKRStatus {
    ON_TRACK = "ON_TRACK",
    AT_RISK = "AT_RISK",
    OFF_TRACK = "OFF_TRACK",
    COMPLETED = "COMPLETED",
}

export interface Objective {
    id: string
    cycleId: string
    cycle: Cycle
    ownerId: string
    ownerType: OwnerType
    title: string
    description?: string | null
    status: OKRStatus
    progress: number
    keyResults?: KeyResult[]
    createdAt: Date
    updatedAt: Date
}

export const deriveStatus = (progress: number): OKRStatus => {
    if (progress >= 100) return OKRStatus.COMPLETED
    if (progress >= 70) return OKRStatus.ON_TRACK
    if (progress >= 40) return OKRStatus.AT_RISK
    return OKRStatus.OFF_TRACK
}

export const calculateObjectiveProgress = (krProgresses: number[]): number => {
    if (krProgresses.length === 0) return 0
    const avg = krProgresses.reduce((sum, p) => sum + p, 0) / krProgresses.length
    return Math.round(avg * 100) / 100
}