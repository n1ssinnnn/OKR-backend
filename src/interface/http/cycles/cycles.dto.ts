import { t } from "elysia"

export const CreateCycleDTO = t.Object({
    name: t.String({ minLength: 1, maxLength: 100 }),
    startDate: t.String(),   // ISO string "2026-01-01"
    endDate: t.String(),
    status: t.Optional(
        t.Union([t.Literal("DRAFT"), t.Literal("ACTIVE"), t.Literal("CLOSED"), t.Literal("ARCHIVED")])
    ),
})