import type { Objective } from "./objective.entity"

export enum CycleStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
    ARCHIVED = "ARCHIVED",
}

export interface Cycle {
    id: string
    name: string
    startDate: Date
    endDate: Date
    status: CycleStatus
    objectives?: Objective[]
    createdAt: Date
    updatedAt: Date
}

export const isCycleActive = (cycle: Cycle): boolean => {
    return cycle.status === "ACTIVE"
}

export const isCycleEditable = (cycle: Cycle): boolean => {
    return cycle.status === "DRAFT" || cycle.status === "ACTIVE"
}