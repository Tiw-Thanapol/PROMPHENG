-- ============================================================
-- STEP 1: Expense.category — String -> Enum
-- ข้อมูลปัจจุบันมีแค่ค่าเดียวคือ "Shipping" (1 แถว) map ไปที่ SHIPPING_ACTUAL
-- ============================================================

CREATE TYPE "ExpenseCategory" AS ENUM ('SHIPPING_ACTUAL', 'PACKAGING', 'COMMISSION', 'OTHER_SALE_COST', 'RENT', 'SALARY', 'MARKETING', 'UTILITY', 'OTHER_GENERAL');

-- เพิ่มคอลัมน์ใหม่แบบ nullable ก่อน
ALTER TABLE "Expense" ADD COLUMN "category_new" "ExpenseCategory";

-- Map ค่าเก่าไปคอลัมน์ใหม่ (ครอบคลุมทุกกรณีที่อาจเจอ ไม่ใช่แค่ "Shipping")
UPDATE "Expense" SET "category_new" =
  CASE
    WHEN category ILIKE '%ship%' THEN 'SHIPPING_ACTUAL'::"ExpenseCategory"
    WHEN category ILIKE '%pack%' THEN 'PACKAGING'::"ExpenseCategory"
    WHEN category ILIKE '%commission%' OR category ILIKE '%คอม%' THEN 'COMMISSION'::"ExpenseCategory"
    WHEN category ILIKE '%rent%' OR category ILIKE '%เช่า%' THEN 'RENT'::"ExpenseCategory"
    WHEN category ILIKE '%salary%' OR category ILIKE '%เงินเดือน%' THEN 'SALARY'::"ExpenseCategory"
    WHEN category ILIKE '%marketing%' OR category ILIKE '%โฆษณา%' THEN 'MARKETING'::"ExpenseCategory"
    WHEN category ILIKE '%utility%' OR category ILIKE '%น้ำ%' OR category ILIKE '%ไฟ%' THEN 'UTILITY'::"ExpenseCategory"
    ELSE 'OTHER_GENERAL'::"ExpenseCategory"
  END;

-- ตรวจสอบว่า map ครบทุกแถวแล้วก่อนบังคับ NOT NULL (กันพลาด)
-- ถ้า query นี้คืนค่า > 0 แปลว่ามีแถวที่ map ไม่ครบ ต้องหยุดตรวจสอบก่อน
-- SELECT COUNT(*) FROM "Expense" WHERE "category_new" IS NULL;

ALTER TABLE "Expense" ALTER COLUMN "category_new" SET NOT NULL;
ALTER TABLE "Expense" DROP COLUMN "category";
ALTER TABLE "Expense" RENAME COLUMN "category_new" TO "category";

CREATE INDEX "Expense_category_idx" ON "Expense"("category");
CREATE INDEX "Expense_saleId_idx" ON "Expense"("saleId");


-- ============================================================
-- STEP 2: Sale — แยก shippingCost เป็น shippingCharged / shippingActual
-- Backfill ด้วยค่าเดิมทั้งคู่ก่อน (เพราะข้อมูลเก่าไม่เคยแยกไว้)
-- ============================================================

ALTER TABLE "Sale" ADD COLUMN "shippingCharged" DECIMAL(10,2);
ALTER TABLE "Sale" ADD COLUMN "shippingActual" DECIMAL(10,2);

UPDATE "Sale" SET
  "shippingCharged" = "shippingCost",
  "shippingActual" = "shippingCost";

ALTER TABLE "Sale" ALTER COLUMN "shippingCharged" SET NOT NULL;
ALTER TABLE "Sale" ALTER COLUMN "shippingCharged" SET DEFAULT 0;
ALTER TABLE "Sale" ALTER COLUMN "shippingActual" SET NOT NULL;
ALTER TABLE "Sale" ALTER COLUMN "shippingActual" SET DEFAULT 0;

ALTER TABLE "Sale" DROP COLUMN "shippingCost";


-- ============================================================
-- STEP 3: SaleItem.costPriceAtSale — snapshot ต้นทุน ณ เวลาขาย
-- ข้อมูลเก่าไม่มี snapshot ไว้ ต้อง backfill จาก costPrice ปัจจุบันของสินค้า
-- (หมายเหตุ: ค่านี้อาจไม่ตรงกับต้นทุนจริง ณ วันที่ขาย ถ้า costPrice เคยถูกแก้ไขมาก่อน)
-- ============================================================

ALTER TABLE "SaleItem" ADD COLUMN "costPriceAtSale" DECIMAL(10,2);

UPDATE "SaleItem" si
SET "costPriceAtSale" = ci."costPrice"
FROM "ConsignmentItem" ci
WHERE ci.id = si."consignmentItemId";

ALTER TABLE "SaleItem" ALTER COLUMN "costPriceAtSale" SET NOT NULL;


-- ============================================================
-- ไม่มีการแตะต้อง ConsignmentItem.actualSalePrice ในรอบนี้
-- (เก็บไว้ก่อนตามที่ตรวจสอบพบว่ามี 3 รายการที่ไม่มี SaleItem คู่กัน
-- ต้องสืบสาเหตุก่อนตัดสินใจ — ดูรายละเอียดในบันทึกการสนทนา)
-- ============================================================