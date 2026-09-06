-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_userId_fkey";

-- AlterTable
ALTER TABLE "CheckIn" DROP COLUMN "userId";
