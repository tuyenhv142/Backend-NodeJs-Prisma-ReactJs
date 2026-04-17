/*
  Warnings:

  - Added the required column `type` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `videos` ADD COLUMN `type` VARCHAR(255) NOT NULL;
