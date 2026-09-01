-- AlterTable
ALTER TABLE "ConsignmentItem" ADD COLUMN     "note" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ConsignmentItem_ownerId_idx" ON "ConsignmentItem"("ownerId");

-- CreateIndex
CREATE INDEX "ConsignmentItem_name_idx" ON "ConsignmentItem"("name");

-- CreateIndex
CREATE INDEX "ConsignmentItem_status_idx" ON "ConsignmentItem"("status");

-- CreateIndex
CREATE INDEX "ConsignmentItem_purchaseDate_idx" ON "ConsignmentItem"("purchaseDate");
