export interface CheckIn {
    id: string
    keyResultId: string
    userId: string
    previousValue?: number | null
    newValue: number
    note?: string | null
    createAt: Date
};