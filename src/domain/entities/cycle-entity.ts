export type CycleStatus = "ACTIVE" | "CLOSED" | "DRAFT" | "ARCHIVED"

export interface Cycle {
    id: string
    name: string
    startDate: Date
    endDate: Date
    status: CycleStatus
    createdAt: Date
    updatedAt: Date
};

export const isCycleActive = (cycle: Cycle): boolean => {
    return cycle.status === "ACTIVE"
}

export const isCycleEditable = (cycle: Cycle): boolean => {
    return cycle.status === "DRAFT" || cycle.status === "ACTIVE"
}