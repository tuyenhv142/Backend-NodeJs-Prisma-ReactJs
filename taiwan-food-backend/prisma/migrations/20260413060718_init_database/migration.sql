/*
  Warnings:

  - Added the required column `lat` to the `restaurants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `restaurants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `restaurants` ADD COLUMN `lat` VARCHAR(100) NOT NULL,
    ADD COLUMN `lng` VARCHAR(100) NOT NULL;
