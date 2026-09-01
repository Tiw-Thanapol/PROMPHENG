-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "customerCode" TEXT;

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");
