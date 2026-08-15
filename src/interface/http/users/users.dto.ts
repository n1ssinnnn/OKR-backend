import { t } from "elysia"

export const BulkImportDTO = t.Object({
    file: t.File({ type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
})