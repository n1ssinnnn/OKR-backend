import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
    await prisma.role.createMany({
        data: [
            { id: "role_01", name: "Admin" },
            { id: "role_02", name: "Manager" },
            { id: "role_03", name: "Member" },
            { id: "role_04", name: "Viewer" },
            { id: "role_05", name: "Guest" },
        ],
        skipDuplicates: true,
    })

    await prisma.department.createMany({
        data: [
            { id: "dept_01", name: "Engineering" },
            { id: "dept_02", name: "Product" },
            { id: "dept_03", name: "Design" },
            { id: "dept_04", name: "Marketing" },
            { id: "dept_05", name: "HR" },
        ],
        skipDuplicates: true,
    })

    await prisma.position.createMany({
        data: [
            { id: "post_01", name: "Software Engineer" },
            { id: "post_02", name: "Product Manager" },
            { id: "post_03", name: "Designer" },
            { id: "post_04", name: "Marketing Manager" },
            { id: "post_05", name: "HR Manager" },
        ],
        skipDuplicates: true,
    })

    console.log("✅ Seed เสร็จแล้ว")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())