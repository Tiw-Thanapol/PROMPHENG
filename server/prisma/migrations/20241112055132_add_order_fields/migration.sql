-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_orderedById_fkey`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `amount` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `curenncy` VARCHAR(191) NOT NULL DEFAULT 'THB',
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `stripePaymentId` VARCHAR(191) NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_orderedById_fkey` FOREIGN KEY (`orderedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
