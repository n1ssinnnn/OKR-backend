import * as XLSX from "xlsx"

// shape ที่คาดหวังจาก Excel
export interface ExcelUserRow {
    id: string
    firstName: string
    lastName: string
    email: string
    password: string
    departmentId: string
    positionId: string
    roleId?: string
}

const normalizeCell = (value: unknown): string => {
    if (value == null) return ""
    return typeof value === "string" ? value.trim() : String(value).trim()
}

export const parseUserExcel = (buffer: Buffer): {
    rows: ExcelUserRow[]
    errors: { row: number; reason: string }[]
} => {
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) throw new Error("Excel file contains no sheets")
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`)
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        raw: false,
        defval: "",
    })

    const rows: ExcelUserRow[] = []
    const errors: { row: number; reason: string }[] = []

    raw.forEach((r, index) => {
        const rowNum = index + 2  // +2 เพราะ row 1 คือ header

        // Validate required fields
        const id = normalizeCell(r["id"])
        const firstName = normalizeCell(r["firstName"])
        const lastName = normalizeCell(r["lastName"])
        const email = normalizeCell(r["email"])
        const password = normalizeCell(r["password"])
        const departmentId = normalizeCell(r["departmentId"])
        const positionId = normalizeCell(r["positionId"])
        const roleId = normalizeCell(r["roleId"]) || undefined

        if (!id) return errors.push({ row: rowNum, reason: "id is required" })
        if (!firstName) return errors.push({ row: rowNum, reason: "firstName is required" })
        if (!lastName) return errors.push({ row: rowNum, reason: "lastName is required" })
        if (!email) return errors.push({ row: rowNum, reason: "email is required" })
        if (!password) return errors.push({ row: rowNum, reason: "password is required" })
        if (!departmentId) return errors.push({ row: rowNum, reason: "departmentId is required" })
        if (!positionId) return errors.push({ row: rowNum, reason: "positionId is required" })


        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return errors.push({ row: rowNum, reason: `invalid email: ${email}` })
        }

        rows.push({
            id,
            firstName,
            lastName,
            email,
            password,
            departmentId,
            positionId,
            roleId,
        })
    })

    return { rows, errors }
}