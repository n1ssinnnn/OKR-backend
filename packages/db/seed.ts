import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { department, position } from "./schema";

const initialData = [
    {
        departmentName: "Human Resources",
        positions: ["HR Manager", "Recruiter", "HR Officer"],
    },
    {
        departmentName: "Finance",
        positions: ["Finance Manager", "Accountant", "Financial Analyst"],
    },
    {
        departmentName: "Engineering",
        positions: ["Engineering Manager", "Software Engineer", "QA Engineer"],
    },
    {
        departmentName: "Marketing",
        positions: ["Marketing Manager", "Digital Marketer", "Content Creator"],
    },
    {
        departmentName: "Sales",
        positions: ["Sales Manager", "Sales Executive", "Account Manager"],
    },
];

await db.transaction(async (tx) => {
    for (const item of initialData) {
        // หาแผนกเดิมก่อน เพื่อให้รัน seed ซ้ำแล้วไม่เพิ่มแผนกซ้ำ
        let [departmentRecord] = await tx
            .select()
            .from(department)
            .where(eq(department.name, item.departmentName))
            .limit(1);

        if (!departmentRecord) {
            const [insertedDepartment] = await tx
                .insert(department)
                .values({
                    id: createId(),
                    name: item.departmentName,
                })
                .returning();

            if (!insertedDepartment) {
                throw new Error(`Could not create department: ${item.departmentName}`);
            }

            departmentRecord = insertedDepartment;
        }

        for (const positionName of item.positions) {
            const [existingPosition] = await tx
                .select()
                .from(position)
                .where(
                    and(
                        eq(position.departmentId, departmentRecord.id),
                        eq(position.name, positionName),
                    ),
                )
                .limit(1);

            if (existingPosition) {
                continue;
            }

            await tx.insert(position).values({
                id: createId(),
                name: positionName,
                departmentId: departmentRecord.id,
            });
        }
    }
});

console.log("Seeded departments and positions.");
process.exit(0);
