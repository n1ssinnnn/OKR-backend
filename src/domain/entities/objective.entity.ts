export type OKRStatus = "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "COMPLETE"
export type OwnerType = "TEAM" | "COMPANY"

export interface Objective {
    id: string
    cycleId: string
    ownerId: string
    ownerType: OwnerType
    parentObjectiveId?: string | null
    title: string
    description?: string | null
    status: OKRStatus
    progress: number
    createDate: Date
    updateDate: Date
}

export const deriveStatus = (progress: number): OKRStatus => {
    if (progress >= 100) return "COMPLETE"
    if (progress >= 70) return "ON_TRACK"
    if (progress >= 40) return "AT_RISK"
    return "OFF_TRACK"
}

export const calculateObjectiveProgress = (krProgresses: number[]): number => {
    if (krProgresses.length === 0) return 0
    const avg = krProgresses.reduce((sum, p) => sum + p, 0) / krProgresses.length
    return Math.round(avg * 100) / 100
}