import { t } from "elysia"

export const CreateKeyResultDTO = t.Object({
    objectiveId: t.String(),
    title: t.String({ minLength: 1, maxLength: 200 }),
    type: t.Union([
        t.Literal("NUMBER"),
        t.Literal("PERCENTAGE"),
        t.Literal("BOOLEAN"),
        t.Literal("MILESTONE"),
    ]),
    startValue: t.Number(),
    targetValue: t.Number(),
})

export const CheckInDTO = t.Object({
    newValue: t.Number(),
    note: t.Optional(t.String({ maxLength: 500 })),
})