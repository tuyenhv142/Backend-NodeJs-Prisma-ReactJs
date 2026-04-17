/*
  Warnings:

  - You are about to alter the column `placeId` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `restaurants` MODIFY `placeId` VARCHAR(191) NULL;
