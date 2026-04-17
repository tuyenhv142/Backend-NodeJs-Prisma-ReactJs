/*
  Warnings:

  - You are about to alter the column `lat` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Double`.
  - You are about to alter the column `lng` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Double`.

*/
-- AlterTable
ALTER TABLE `restaurants` MODIFY `lat` DOUBLE NOT NULL DEFAULT 0.0,
    MODIFY `lng` DOUBLE NOT NULL DEFAULT 0.0;
