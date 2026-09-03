CREATE INDEX CONCURRENTLY IF NOT EXISTS "Sale_accountId_status_createdAt_idx" ON "Sale"("accountId", "status", "createdAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "SaleItem_saleId_idx" ON "SaleItem"("saleId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "SaleItem_consignmentItemId_idx" ON "SaleItem"("consignmentItemId");