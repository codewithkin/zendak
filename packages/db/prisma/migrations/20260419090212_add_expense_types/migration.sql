-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExpenseType" ADD VALUE 'INSURANCE';
ALTER TYPE "ExpenseType" ADD VALUE 'PARKING';
ALTER TYPE "ExpenseType" ADD VALUE 'PERMITS';
ALTER TYPE "ExpenseType" ADD VALUE 'REPAIRS';
ALTER TYPE "ExpenseType" ADD VALUE 'CLEANING';
ALTER TYPE "ExpenseType" ADD VALUE 'MEALS';
ALTER TYPE "ExpenseType" ADD VALUE 'EQUIPMENT';
