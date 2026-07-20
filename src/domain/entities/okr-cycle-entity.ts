export type OKRCycleStatus = "ACTIVE" | "CLOSED" | "DRAFT" | "ARCHIVED"

export interface OKRCycle {
    id: string
    name: string
    startDate: Date
    endDate: Date
};