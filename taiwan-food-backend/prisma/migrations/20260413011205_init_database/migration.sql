/*
  Warnings:

  - Added the required column `idVideo` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `videos` ADD COLUMN `idVideo` VARCHAR(255) NOT NULL;
