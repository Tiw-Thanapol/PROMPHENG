-- AlterTable
ALTER TABLE "ConsignmentItem" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
