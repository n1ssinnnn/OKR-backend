# OKR Management API

ระบบ OKR Management API พัฒนาด้วย ElysiaJS + Prisma + PostgreSQL (Neon) โดยใช้ Clean Architecture

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Runtime | Bun |
| Framework | ElysiaJS |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| API Docs | Swagger (built-in) |

---

## Project Structure

```
src/
├── domain/              # Business entities และ repository interfaces
├── application/         # Use cases (business logic)
├── interface/           # Controllers และ DTOs
└── infrastructure/      # Prisma, Excel parser, container
```

---

## Getting Started

### 1. Clone และติดตั้ง

```bash
git clone <repo-url>
bun install
```

### 2. ตั้งค่า Environment

```bash
cp .env.example .env
```

แก้ไข `.env` ใส่ค่าจาก Neon dashboard:

```env
DATABASE_URL="postgresql://username:password@ep-xxxx.neon.tech/okr_db?sslmode=require"
PORT=3000
```

### 3. Migrate Database

```bash
bunx prisma migrate dev --name init
bunx prisma generate
```

### 4. Seed ข้อมูลเริ่มต้น

```bash
bunx prisma db seed
```

> สร้าง Roles และ Departments เริ่มต้นที่จำเป็นสำหรับการ import users

### 5. รัน Server

```bash
bun --watch src/index.ts
```

เปิด API Docs ได้ที่ `http://localhost:3000/swagger`

---

## คำสั่งหลัก

### Development

```bash
# รัน server (dev mode — auto restart เมื่อแก้ไฟล์)
bun --watch src/index.ts

# รัน server (ปกติ)
bun src/index.ts
```

### Prisma

```bash
# สร้าง migration ใหม่หลังแก้ schema
bunx prisma migrate dev --name <ชื่อ migration>

# ดู database ผ่าน Prisma Studio (GUI)
bunx prisma studio

# Generate Prisma client (ทำหลัง migrate หรือ pull)
bunx prisma generate

# ดึง schema จาก database มาอัปเดต (กรณีแก้ DB โดยตรง)
bunx prisma db pull

# Seed ข้อมูลเริ่มต้น (Roles, Departments)
bunx prisma db seed

# Reset database (ลบข้อมูลทั้งหมดแล้ว migrate ใหม่)
bunx prisma migrate reset
```

### Dependencies

```bash
# ติดตั้ง dependencies
bun install

# เพิ่ม package
bun add <package-name>

# เพิ่ม dev package
bun add -d <package-name>
```

---

## API Endpoints

| Method | Endpoint | หน้าที่ |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/v1/cycles` | ดึง cycles ทั้งหมด |
| GET | `/api/v1/cycles/active` | ดึง active cycle |
| POST | `/api/v1/cycles` | สร้าง cycle ใหม่ |
| GET | `/api/v1/objectives?cycleId=` | ดึง objectives ใน cycle |
| GET | `/api/v1/objectives/:id` | ดึง objective + Key Results |
| POST | `/api/v1/objectives` | สร้าง objective ใหม่ |
| POST | `/api/v1/key-results` | สร้าง key result ใหม่ |
| POST | `/api/v1/key-results/:id/checkin` | Check-in Key Result |
| GET | `/api/v1/users/:id` | ดึง user by ID |
| POST | `/api/v1/users/bulk-import` | Import users จากไฟล์ Excel |

ดูรายละเอียดและทดสอบ API ได้ที่ `/swagger`

---

## Excel Import Format

สำหรับ endpoint `POST /api/v1/users/bulk-import` ไฟล์ Excel ต้องมี columns ดังนี้:

| id | firstName | lastName | email | departmentId | roleId |
|---|---|---|---|---|---|
| usr_001 | สมชาย | ใจดี | somchai@company.com | dept_01 | role_01 |
| usr_002 | สมหญิง | รักเรียน | somying@company.com | dept_02 | |

> `roleId` ไม่บังคับ

---

## Environment Variables

| ตัวแปร | คำอธิบาย | ตัวอย่าง |
|---|---|---|
| `DATABASE_URL` | Connection string ของ Neon PostgreSQL | `postgresql://user:pass@host/db?sslmode=require` |
| `PORT` | Port ที่ server รัน | `3000` |