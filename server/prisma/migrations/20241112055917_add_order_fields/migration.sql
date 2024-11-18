/*
  Warnings:

  - You are about to drop the column `curenncy` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `curenncy`,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'THB';
