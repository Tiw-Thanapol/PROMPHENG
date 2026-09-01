-- CreateTable
CREATE TABLE "OwnerPayment" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OwnerPayment_ownerId_idx" ON "OwnerPayment"("ownerId");

-- CreateIndex
CREATE INDEX "OwnerPayment_createdById_idx" ON "OwnerPayment"("createdById");

-- CreateIndex
CREATE INDEX "OwnerPayment_paidAt_idx" ON "OwnerPayment"("paidAt");

-- AddForeignKey
ALTER TABLE "OwnerPayment" ADD CONSTRAINT "OwnerPayment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerPayment" ADD CONSTRAINT "OwnerPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
