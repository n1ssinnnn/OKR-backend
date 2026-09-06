import { t } from "elysia"

export const CreateObjectiveDTO = t.Object({
    cycleId: t.String(),
    title: t.String({ minLength: 1, maxLength: 200 }),
    description: t.Optional(t.String({ maxLength: 1000 })),
    ownerId: t.String(),
    ownerType: t.Union([
        t.Literal("USER"),
        t.Literal("TEAM"),
        t.Literal("COMPANY"),
    ]),
})