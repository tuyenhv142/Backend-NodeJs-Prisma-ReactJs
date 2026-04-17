-- DropIndex
DROP INDEX `restaurants_placeId_key` ON `restaurants`;

-- AlterTable
ALTER TABLE `restaurants` MODIFY `placeId` VARCHAR(255) NULL;
