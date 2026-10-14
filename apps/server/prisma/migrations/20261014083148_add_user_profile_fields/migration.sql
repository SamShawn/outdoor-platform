/*
  Warnings:

  - A unique constraint covering the columns `[unionid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `unionid` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_unionid_key` ON `users`(`unionid`);

-- CreateIndex
CREATE UNIQUE INDEX `users_phone_key` ON `users`(`phone`);
