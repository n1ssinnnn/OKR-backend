/*
  Warnings:

  - You are about to drop the column `parentObjectiveId` on the `Objective` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Objective" DROP CONSTRAINT "Objective_parentObjectiveId_fkey";

-- AlterTable
ALTER TABLE "Objective" DROP COLUMN "parentObjectiveId";
