-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `orderNo` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `activityId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paymentMethod` VARCHAR(191) NULL,
    `transactionId` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_orderNo_key`(`orderNo`),
    UNIQUE INDEX `orders_transactionId_key`(`transactionId`),
    INDEX `orders_userId_idx`(`userId`),
    INDEX `orders_activityId_idx`(`activityId`),
    INDEX `orders_status_idx`(`status`),
    UNIQUE INDEX `orders_userId_activityId_key`(`userId`, `activityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `activities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
