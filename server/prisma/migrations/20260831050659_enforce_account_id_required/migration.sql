/*
  Warnings:

  - Made the column `accountId` on table `ConsignmentItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accountId` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accountId` on table `Expense` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accountId` on table `Owner` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accountId` on table `Sale` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accountId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ConsignmentItem" DROP CONSTRAINT "ConsignmentItem_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Owner" DROP CONSTRAINT "Owner_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_accountId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_accountId_fkey";

-- AlterTable
ALTER TABLE "ConsignmentItem" ALTER COLUMN "accountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "accountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "accountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Owner" ALTER COLUMN "accountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "accountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "accountId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignmentItem" ADD CONSTRAINT "ConsignmentItem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
