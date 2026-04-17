/*
  Warnings:

  - A unique constraint covering the columns `[placeId]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `restaurants_placeId_key` ON `restaurants`(`placeId`);
