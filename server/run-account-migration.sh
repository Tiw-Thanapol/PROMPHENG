#!/bin/bash
#
# run-account-migration.sh
#
# รันคำสั่งเดียวจบ: ทำ migration เพิ่ม Account/Plan/Subscription/Invoice
# ครบทั้ง 2 รอบ (nullable -> backfill -> required) อัตโนมัติ
#
# ก่อนรัน ให้วางไฟล์ทั้ง 4 นี้ไว้ที่ root โปรเจกต์ (ที่เดียวกับ package.json):
#   - schema.prisma                (schema สุดท้าย accountId เป็น required)
#   - schema.step1.nullable.prisma (schema ชั่วคราว accountId เป็น optional)
#   - backfillAccounts.js
#   - run-account-migration.sh     (ไฟล์นี้)
#
# วิธีรัน:
#   chmod +x run-account-migration.sh
#   ./run-account-migration.sh
#
# ถ้าข้อมูล Customer/Owner/ConsignmentItem เดิมเป็นข้อมูลทดสอบล้วนๆ
# (ไม่มีทางรู้เจ้าของจริง) ตัว backfill จะลบทิ้งให้อัตโนมัติ (--wipe-orphans)
# ถ้าไม่ต้องการแบบนี้ ให้แก้บรรทัด "node backfillAccounts.js --wipe-orphans"
# ด้านล่างเป็น "node backfillAccounts.js" เฉยๆ ก่อนรัน แล้ว map ข้อมูลด้วยมือทีหลัง

set -e   # หยุดทันทีถ้ามีคำสั่งไหน error ไม่ปล่อยให้รันขั้นต่อไปทับข้อมูลเสีย

PRISMA_SCHEMA_PATH="prisma/schema.prisma"

if [ ! -f "$PRISMA_SCHEMA_PATH" ]; then
  echo "❌ ไม่พบ $PRISMA_SCHEMA_PATH — รันสคริปต์นี้จาก root โปรเจกต์ (โฟลเดอร์เดียวกับ package.json)"
  exit 1
fi

echo "=================================================="
echo "STEP 0: สำรอง schema เดิมไว้ก่อน (กันพลาด)"
echo "=================================================="
cp "$PRISMA_SCHEMA_PATH" "$PRISMA_SCHEMA_PATH.before-account-migration.bak"
echo "สำรองไว้ที่ $PRISMA_SCHEMA_PATH.before-account-migration.bak แล้ว"

echo ""
echo "=================================================="
echo "STEP 1: Migrate โครงสร้างแบบ accountId เป็น optional ก่อน"
echo "=================================================="
cp schema.step1.nullable.prisma "$PRISMA_SCHEMA_PATH"
npx prisma migrate dev --name add_account_billing_nullable

echo ""
echo "=================================================="
echo "STEP 2: Backfill ข้อมูล (สร้าง Account/Subscription ให้ User เดิม)"
echo "=================================================="
node backfillAccounts.js --wipe-orphans

echo ""
echo "=================================================="
echo "STEP 3: Migrate โครงสร้างจริง บังคับ accountId เป็น required"
echo "=================================================="
cp schema.prisma "$PRISMA_SCHEMA_PATH"
npx prisma migrate dev --name enforce_account_id_required

echo ""
echo "=================================================="
echo "✅ เสร็จสมบูรณ์ — ทุก User มี Account + Subscription (FREE/TRIALING) แล้ว"
echo "=================================================="
