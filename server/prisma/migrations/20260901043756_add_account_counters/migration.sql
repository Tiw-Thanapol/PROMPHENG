-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "customerNumber" INTEGER;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "orderNo" INTEGER;

-- CreateTable
CREATE TABLE "AccountCounter" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountCounter_accountId_idx" ON "AccountCounter"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountCounter_accountId_type_key" ON "AccountCounter"("accountId", "type");

-- CreateIndex
CREATE INDEX "Customer_accountId_customerNumber_idx" ON "Customer"("accountId", "customerNumber");

-- CreateIndex
CREATE INDEX "Sale_accountId_orderNo_idx" ON "Sale"("accountId", "orderNo");

-- AddForeignKey
ALTER TABLE "AccountCounter" ADD CONSTRAINT "AccountCounter_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
