-- AlterTable
ALTER TABLE "ConsignmentItem" ADD COLUMN     "actualSalePrice" DECIMAL(10,2),
ADD COLUMN     "soldAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ConsignmentItem_soldAt_idx" ON "ConsignmentItem"("soldAt");
