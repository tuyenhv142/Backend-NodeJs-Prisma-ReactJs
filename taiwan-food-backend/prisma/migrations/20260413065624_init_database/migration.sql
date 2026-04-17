/*
  Warnings:

  - A unique constraint covering the columns `[placeId]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `placeId` to the `restaurants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `restaurants` ADD COLUMN `placeId` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `restaurants_placeId_key` ON `restaurants`(`placeId`);
