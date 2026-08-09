import type { Objective } from "./objective.entity"
import type { CheckIn } from "./checkin.entity"

export enum KRType {
    NUMBER = "NUMBER",
    PERCENTAGE = "PERCENTAGE",
    BOOLEAN = "BOOLEAN",
    MILESTONE = "MILESTONE",
}

export interface KeyResult {
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

export const calculateKRProgress = (
    kr: Pick<KeyResult, "startValue" | "targetValue" | "currentValue">
): number => {
    const range = kr.targetValue - kr.startValue
    if (range === 0) return 0
    const progress = ((kr.currentValue - kr.startValue) / range) * 100
    return Math.min(100, Math.max(0, Math.round(progress * 100) / 100))
}