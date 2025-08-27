-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `group` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `value` VARCHAR(191) NOT NULL,
    `refer` VARCHAR(191) NULL,
    `isVisible` BOOLEAN NULL DEFAULT true,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedBy` INTEGER NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `settings_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('BANNER', 'SLIDER') NOT NULL DEFAULT 'BANNER',
    `url` VARCHAR(191) NOT NULL,
    `mime` VARCHAR(191) NULL,
    `title` JSON NULL,
    `brief` JSON NULL,
    `refType` VARCHAR(191) NULL,
    `refValue` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `untilDate` DATETIME(3) NULL,
    `sorting` INTEGER NULL DEFAULT 0,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_keys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('SYSTEM', 'CLIENT', 'DEFAULT') NOT NULL DEFAULT 'CLIENT',
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `hash` VARCHAR(191) NOT NULL,
    `isDeprecated` BOOLEAN NULL DEFAULT false,
    `isActive` BOOLEAN NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `untilDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_versions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('IOS', 'AOS', 'WEB') NOT NULL DEFAULT 'IOS',
    `name` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `isForce` BOOLEAN NULL DEFAULT false,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `app_versions_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `countries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` JSON NULL,
    `flag` VARCHAR(191) NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isVisible` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `districts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `countryId` INTEGER NULL,
    `name` JSON NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isVisible` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `refId` INTEGER NULL,
    `refType` VARCHAR(191) NULL,
    `channel` ENUM('SMS', 'EMAIL', 'WHATAPP') NOT NULL DEFAULT 'EMAIL',
    `type` ENUM('TEXT', 'REFERRENCE') NOT NULL DEFAULT 'TEXT',
    `title` JSON NOT NULL,
    `description` JSON NULL,
    `content` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pushes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notificationId` INTEGER NOT NULL,
    `type` ENUM('INSTANT', 'DATETIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL DEFAULT 'INSTANT',
    `status` ENUM('PENDING', 'PUSHING', 'COMPLETED', 'CANCELED') NULL DEFAULT 'PENDING',
    `executeTime` VARCHAR(191) NULL,
    `executeDate` VARCHAR(191) NULL,
    `hours` INTEGER NULL,
    `minutes` INTEGER NULL,
    `seconds` INTEGER NULL,
    `weekday` INTEGER NULL,
    `day` INTEGER NULL,
    `month` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `untilDate` DATETIME(3) NULL,
    `retries` INTEGER NULL DEFAULT 0,
    `isActive` BOOLEAN NULL DEFAULT true,
    `expiresAt` DATETIME(3) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `push_groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `tierIds` JSON NULL,
    `emails` JSON NULL,
    `phones` JSON NULL,
    `joinSinceDate` DATETIME(3) NULL,
    `joinUntilDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_push_group_notification_mixins` (
    `groupId` INTEGER NOT NULL,
    `notificationId` INTEGER NOT NULL,

    PRIMARY KEY (`groupId`, `notificationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `push_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pushId` INTEGER NOT NULL,
    `notificationId` INTEGER NOT NULL,
    `totalDevice` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` INTEGER NULL DEFAULT 1,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(191) NOT NULL,
    `context` VARCHAR(191) NULL,
    `title` JSON NULL,
    `bitwise` INTEGER NULL DEFAULT 0,
    `sorting` INTEGER NULL DEFAULT 0,
    `isVisible` BOOLEAN NULL DEFAULT true,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    UNIQUE INDEX `permissions_subject_key`(`subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_roles_permissions` (
    `permissionId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,
    `bitwise` INTEGER NULL DEFAULT 0,
    `assignedBy` INTEGER NULL,
    `assignedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`permissionId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NULL,
    `level` INTEGER NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `phoneCountry` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `loginToken` VARCHAR(191) NULL,
    `loginDate` DATETIME(3) NULL,
    `password` VARCHAR(191) NOT NULL,
    `passwordConfirm` VARCHAR(191) NULL,
    `passwordAttempt` INTEGER NULL DEFAULT 0,
    `passwordExpired` DATETIME(3) NULL,
    `signUpFrom` VARCHAR(191) NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `isEmailVerified` BOOLEAN NULL DEFAULT true,
    `isPhoneVerified` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_token_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userToken` VARCHAR(191) NOT NULL,
    `refreshToken` TEXT NOT NULL,
    `refreshAttempt` INTEGER NULL DEFAULT 1,
    `refreshExpired` DATETIME(3) NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `user_token_histories_userId_userToken_idx`(`userId`, `userToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_login_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `ip` VARCHAR(191) NULL,
    `hostname` VARCHAR(191) NULL,
    `protocol` VARCHAR(191) NULL,
    `originalUrl` VARCHAR(191) NULL,
    `method` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `xForwardedFor` VARCHAR(191) NULL,
    `xForwardedHost` VARCHAR(191) NULL,
    `xForwardedPorto` VARCHAR(191) NULL,
    `loginDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_verify_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channel` ENUM('SMS', 'EMAIL') NOT NULL,
    `type` ENUM('SIGN_UP', 'RESET_PASSWORD', 'FORGOT_PASSWORD', 'CHANGE_PASSWORD') NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `attempts` INTEGER NULL DEFAULT 1,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isVerified` BOOLEAN NULL DEFAULT false,
    `verifiedAt` DATETIME(3) NULL,
    `isExpired` BOOLEAN NOT NULL DEFAULT false,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_users_roles` (
    `roleId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `assignedBy` INTEGER NULL,
    `assignedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `tierId` INTEGER NULL,
    `minTierId` INTEGER NULL,
    `countryId` INTEGER NULL,
    `districtId` INTEGER NULL,
    `referralCode` VARCHAR(191) NULL,
    `invitedCode` VARCHAR(191) NULL,
    `type` ENUM('STAFF', 'NORMAL', 'MASTER') NULL DEFAULT 'NORMAL',
    `email` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `refId` VARCHAR(191) NULL,
    `cardId` VARCHAR(191) NULL,
    `appleId` VARCHAR(191) NULL,
    `facebookId` VARCHAR(191) NULL,
    `facebookToken` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `locale` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `birthDate` DATETIME(3) NULL,
    `expiryDate` DATETIME(3) NULL,
    `pointBalance` INTEGER NULL DEFAULT 0,
    `personalSpending` DOUBLE NULL DEFAULT 0,
    `referralSpending` DOUBLE NULL DEFAULT 0,
    `maximumSpending` DOUBLE NULL DEFAULT 0,
    `phoneCountry` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `birthYear` INTEGER NULL,
    `birthMonth` INTEGER NULL,
    `birthDay` INTEGER NULL,
    `loginToken` VARCHAR(191) NULL,
    `loginDate` DATETIME(3) NULL,
    `password` VARCHAR(191) NULL,
    `passwordAttempt` INTEGER NULL DEFAULT 0,
    `passwordExpired` DATETIME(3) NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isVisible` BOOLEAN NULL DEFAULT true,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `isNotifiable` BOOLEAN NULL DEFAULT true,
    `isPromotable` BOOLEAN NULL DEFAULT true,
    `isEmailVerified` BOOLEAN NULL DEFAULT false,
    `isPhoneVerified` BOOLEAN NULL DEFAULT false,
    `receivePromotionViaApp` BOOLEAN NULL DEFAULT false,
    `receivePromotionViaEmail` BOOLEAN NULL DEFAULT false,
    `hasFirstPurchased` BOOLEAN NULL DEFAULT false,
    `hasBirthPurchased` BOOLEAN NULL DEFAULT false,
    `hasDiamondAchieved` BOOLEAN NULL DEFAULT false,
    `hasFirstPurchasedAt` DATETIME(3) NULL,
    `hasBirthPurchasedAt` DATETIME(3) NULL,
    `hasDiamondAchievedAt` DATETIME(3) NULL,
    `startedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `deletedBy` INTEGER NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    UNIQUE INDEX `members_referralCode_key`(`referralCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_delete_reasons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_token_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `memberToken` VARCHAR(191) NOT NULL,
    `refreshToken` TEXT NOT NULL,
    `refreshAttempt` INTEGER NULL DEFAULT 1,
    `refreshExpired` DATETIME(3) NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `member_token_histories_memberId_memberToken_idx`(`memberId`, `memberToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_device_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NULL,
    `type` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `version` VARCHAR(191) NULL,
    `token` VARCHAR(191) NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `member_device_histories_memberId_token_key`(`memberId`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_verify_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channel` ENUM('SMS', 'EMAIL') NOT NULL,
    `type` ENUM('SIGN_UP', 'RESET_PASSWORD', 'FORGOT_PASSWORD', 'CHANGE_PASSWORD') NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `memberId` INTEGER NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `attempts` INTEGER NULL DEFAULT 1,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isVerified` BOOLEAN NULL DEFAULT false,
    `verifiedAt` DATETIME(3) NULL,
    `isExpired` BOOLEAN NOT NULL DEFAULT false,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_notify_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `pushHistoryId` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `content` VARCHAR(191) NULL,
    `refId` INTEGER NULL,
    `refType` VARCHAR(191) NULL,
    `isActive` BOOLEAN NULL DEFAULT true,
    `pushedAt` DATETIME(3) NULL,
    `readAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_tier_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `prevTierId` INTEGER NOT NULL,
    `currTierId` INTEGER NOT NULL,
    `minTierId` INTEGER NULL,
    `invoiceId` INTEGER NULL,
    `type` ENUM('INITIAL', 'SYSTEM', 'UPGRADE', 'RENEWAL', 'DOWNGRADE') NOT NULL DEFAULT 'INITIAL',
    `personalSpending` DOUBLE NULL DEFAULT 0,
    `referralSpending` DOUBLE NULL DEFAULT 0,
    `excessSpending` DOUBLE NULL DEFAULT 0,
    `renewalSpending` DOUBLE NULL DEFAULT 0,
    `upgradeSpending` DOUBLE NULL DEFAULT 0,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isVisible` BOOLEAN NULL DEFAULT true,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `expiryDate` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_point_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `refereeId` INTEGER NULL,
    `tierId` INTEGER NULL,
    `invoiceId` INTEGER NULL,
    `invoiceAmount` DOUBLE NULL,
    `type` ENUM('INITIAL', 'IMPORT', 'SYSTEM', 'EXPIRY', 'REFUND', 'UPGRADE', 'RENEWAL', 'SHARE', 'PURCHASE', 'REWARD', 'REFER', 'WELCOME', 'REGISTER') NOT NULL DEFAULT 'INITIAL',
    `multipleRatio` DOUBLE NULL,
    `ratioNote` JSON NULL,
    `point` INTEGER NULL DEFAULT 0,
    `pointBalance` INTEGER NULL DEFAULT 0,
    `remark` VARCHAR(191) NULL,
    `isBirth` BOOLEAN NULL DEFAULT false,
    `isFirst` BOOLEAN NULL DEFAULT false,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isVisible` BOOLEAN NULL DEFAULT true,
    `isPending` BOOLEAN NULL DEFAULT false,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `expiryDate` DATETIME(3) NULL,
    `releaseDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_product_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `orderId` INTEGER NULL,
    `promotionId` INTEGER NULL,
    `redeemPrice` DOUBLE NULL DEFAULT 0,
    `redeemPoint` INTEGER NULL DEFAULT 0,
    `source` ENUM('SYSTEM', 'ORDER', 'PROMOTION') NULL DEFAULT 'SYSTEM',
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELED', 'RESERVED', 'USED', 'FAILED') NULL DEFAULT 'PENDING',
    `isActive` BOOLEAN NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `untilDate` DATETIME(3) NULL,
    `usedAt` DATETIME(3) NULL,
    `issuedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    INDEX `member_product_histories_memberId_productId_idx`(`memberId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tiers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` JSON NULL,
    `code` VARCHAR(191) NULL,
    `level` INTEGER NULL,
    `alive` BOOLEAN NULL DEFAULT true,
    `rewardPoint` INTEGER NULL DEFAULT 0,
    `limitSpending` DOUBLE NULL DEFAULT 0,
    `initialRate` DOUBLE NULL DEFAULT 0,
    `personalRate` DOUBLE NULL DEFAULT 0,
    `referralRate` DOUBLE NULL DEFAULT 0,
    `birthdayRatio` DOUBLE NULL DEFAULT 0,
    `cardIcon` VARCHAR(191) NULL,
    `cardImage` VARCHAR(191) NULL,
    `cardCover` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `untilDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tiers_code_key`(`code`),
    UNIQUE INDEX `tiers_level_key`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tier_languages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tierId` INTEGER NOT NULL,
    `language` CHAR(3) NOT NULL,
    `description` LONGTEXT NOT NULL,

    UNIQUE INDEX `tier_languages_tierId_language_key`(`tierId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tier_charts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currId` INTEGER NOT NULL,
    `nextId` INTEGER NOT NULL,
    `requireSpending` DOUBLE NULL DEFAULT 0,
    `isActive` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `tier_charts_currId_nextId_key`(`currId`, `nextId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `carts_memberId_key`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `offerId` INTEGER NULL,
    `bundleId` INTEGER NULL,
    `promotionId` INTEGER NULL,
    `quantity` INTEGER NULL DEFAULT 1,
    `vatPercentage` DOUBLE NULL DEFAULT 0,
    `unitPrice` DOUBLE NULL,
    `unitPoint` INTEGER NULL,
    `discPrice` DOUBLE NULL DEFAULT 0,
    `discPoint` INTEGER NULL DEFAULT 0,
    `finalPrice` DOUBLE NULL,
    `finalPoint` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cart_items_cartId_productId_key`(`cartId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `sorting` INTEGER NULL DEFAULT 0,
    `priority` INTEGER NULL DEFAULT 0,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    UNIQUE INDEX `promotions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `memberId` INTEGER NOT NULL,
    `promotionId` INTEGER NULL,
    `totalPrice` DOUBLE NULL DEFAULT 0,
    `totalPoint` INTEGER NULL DEFAULT 0,
    `discPrice` DOUBLE NULL DEFAULT 0,
    `discPoint` INTEGER NULL DEFAULT 0,
    `finalPrice` DOUBLE NULL DEFAULT 0,
    `finalPoint` INTEGER NULL DEFAULT 0,
    `source` ENUM('SYSTEM', 'WEB', 'APP', 'POS') NOT NULL DEFAULT 'SYSTEM',
    `status` ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `note` VARCHAR(191) NULL,
    `isBirth` BOOLEAN NULL DEFAULT false,
    `issuedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `promotionId` INTEGER NULL,
    `quantity` INTEGER NULL DEFAULT 1,
    `unitPrice` DOUBLE NULL,
    `unitPoint` INTEGER NULL,
    `finalPrice` DOUBLE NULL,
    `finalPoint` INTEGER NULL,
    `expiryDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `shipments_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `orderId` INTEGER NOT NULL,
    `memberId` INTEGER NOT NULL,
    `promotionId` INTEGER NULL,
    `invoiceRef` VARCHAR(191) NULL,
    `invoicePath` VARCHAR(191) NULL,
    `paidPrice` DOUBLE NULL DEFAULT 0,
    `paidPoint` INTEGER NULL DEFAULT 0,
    `finalPrice` DOUBLE NULL DEFAULT 0,
    `finalPoint` INTEGER NULL DEFAULT 0,
    `transactions` JSON NULL,
    `transactionIds` JSON NULL,
    `isBirth` BOOLEAN NULL DEFAULT false,
    `isEarned` BOOLEAN NULL DEFAULT false,
    `status` ENUM('PENDING', 'PARTIALLY_PAID', 'FULLY_PAID', 'OVERDUE', 'CANCELED', 'REFUNDED', 'FAILED', 'DISPUTED') NULL DEFAULT 'PENDING',
    `dueDate` DATETIME(3) NULL,
    `issuedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_code_key`(`code`),
    UNIQUE INDEX `invoices_orderId_key`(`orderId`),
    UNIQUE INDEX `invoices_invoiceRef_key`(`invoiceRef`),
    INDEX `invoices_status_isEarned_issuedAt_createdAt_idx`(`status`, `isEarned`, `issuedAt`, `createdAt`),
    INDEX `invoices_memberId_orderId_issuedAt_idx`(`memberId`, `orderId`, `issuedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `amount` DOUBLE NULL,
    `method` ENUM('CASH', 'CREDIT', 'PAYPAL', 'DEBIT') NULL DEFAULT 'CASH',
    `status` ENUM('PAID', 'CANCELED') NULL DEFAULT 'PAID',
    `issuedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NULL,
    `name` JSON NULL,
    `thumbnail` VARCHAR(191) NULL,
    `sorting` INTEGER NULL DEFAULT 0,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `title` JSON NULL,
    `content` JSON NULL,
    `thumbnail` VARCHAR(191) NULL,
    `sorting` INTEGER NULL DEFAULT 0,
    `isVisible` BOOLEAN NULL DEFAULT true,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brandId` INTEGER NULL,
    `categoryId` INTEGER NULL,
    `type` ENUM('SIMPLE', 'VIRTUAL', 'GROUPED', 'BUNDLE', 'CONFIGURABLE', 'DOWNLOADABLE') NULL DEFAULT 'SIMPLE',
    `sku` VARCHAR(191) NULL,
    `name` JSON NULL,
    `thumbnail` VARCHAR(191) NULL,
    `salePoint` DOUBLE NULL DEFAULT 0,
    `salePrice` DOUBLE NULL DEFAULT 0,
    `costPrice` DOUBLE NULL DEFAULT 0,
    `stockQty` INTEGER NULL DEFAULT 0,
    `unpaidQty` INTEGER NULL DEFAULT 0,
    `paidQty` INTEGER NULL DEFAULT 0,
    `sorting` INTEGER NULL DEFAULT 0,
    `salePerPerson` INTEGER NULL,
    `duePaidDays` INTEGER NULL DEFAULT 0,
    `expiryType` ENUM('STATIC', 'DYNAMIC') NULL DEFAULT 'DYNAMIC',
    `dynamicExpiryDays` INTEGER NULL DEFAULT 0,
    `staticExpiryDate` DATETIME(3) NULL,
    `hasShipment` BOOLEAN NULL DEFAULT true,
    `hasInventory` BOOLEAN NULL DEFAULT true,
    `hasExpiration` BOOLEAN NULL DEFAULT true,
    `hasDuePayment` BOOLEAN NULL DEFAULT true,
    `hasLimitPerson` BOOLEAN NULL DEFAULT true,
    `isPopular` BOOLEAN NULL DEFAULT false,
    `isBestSale` BOOLEAN NULL DEFAULT false,
    `isFlashSale` BOOLEAN NULL DEFAULT false,
    `isComingSoon` BOOLEAN NULL DEFAULT false,
    `isNewArrival` BOOLEAN NULL DEFAULT false,
    `isActive` BOOLEAN NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedBy` INTEGER NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_languages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `language` CHAR(3) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `termAndCond` LONGTEXT NOT NULL,

    UNIQUE INDEX `product_languages_productId_language_key`(`productId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_medias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `mime` VARCHAR(191) NULL,
    `sorting` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` JSON NULL,
    `sorting` INTEGER NULL DEFAULT 0,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_brands` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` JSON NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `thumbnail` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `sorting` INTEGER NULL DEFAULT 0,
    `isActive` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `rating` INTEGER NULL DEFAULT 1,
    `comment` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `wishlist_memberId_productId_key`(`memberId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `slip_counters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ORDER', 'INVOICE') NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `sequence` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `slip_counters_type_key_key`(`type`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_audit_log_http` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pid` INTEGER NULL,
    `correlationId` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `level` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NULL,
    `protocol` VARCHAR(191) NULL,
    `hostname` VARCHAR(191) NULL,
    `method` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `referrer` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `headers` JSON NULL,
    `params` JSON NULL,
    `query` JSON NULL,
    `body` JSON NULL,
    `userAgent` VARCHAR(191) NULL,
    `statusCode` INTEGER NULL,
    `responseHeaders` JSON NULL,
    `responseTime` DOUBLE NULL,
    `rawMetadata` JSON NULL,
    `rawRequest` JSON NULL,
    `rawResponse` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_audit_log_mysql` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hostname` VARCHAR(191) NULL,
    `pid` INTEGER NULL,
    `type` VARCHAR(191) NULL,
    `level` VARCHAR(191) NULL,
    `query` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `districts` ADD CONSTRAINT `districts_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pushes` ADD CONSTRAINT `pushes_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pushes` ADD CONSTRAINT `pushes_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pushes` ADD CONSTRAINT `pushes_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `notifications`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_push_group_notification_mixins` ADD CONSTRAINT `_push_group_notification_mixins_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `push_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_push_group_notification_mixins` ADD CONSTRAINT `_push_group_notification_mixins_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `notifications`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `push_histories` ADD CONSTRAINT `push_histories_pushId_fkey` FOREIGN KEY (`pushId`) REFERENCES `pushes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_roles_permissions` ADD CONSTRAINT `_roles_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_roles_permissions` ADD CONSTRAINT `_roles_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_token_histories` ADD CONSTRAINT `user_token_histories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_login_histories` ADD CONSTRAINT `user_login_histories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_verify_histories` ADD CONSTRAINT `user_verify_histories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_users_roles` ADD CONSTRAINT `_users_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_users_roles` ADD CONSTRAINT `_users_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `tiers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `districts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_delete_reasons` ADD CONSTRAINT `member_delete_reasons_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_device_histories` ADD CONSTRAINT `member_device_histories_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_verify_histories` ADD CONSTRAINT `member_verify_histories_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_notify_histories` ADD CONSTRAINT `member_notify_histories_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_notify_histories` ADD CONSTRAINT `member_notify_histories_pushHistoryId_fkey` FOREIGN KEY (`pushHistoryId`) REFERENCES `push_histories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_tier_histories` ADD CONSTRAINT `member_tier_histories_prevTierId_fkey` FOREIGN KEY (`prevTierId`) REFERENCES `tiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_tier_histories` ADD CONSTRAINT `member_tier_histories_currTierId_fkey` FOREIGN KEY (`currTierId`) REFERENCES `tiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_tier_histories` ADD CONSTRAINT `member_tier_histories_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_tier_histories` ADD CONSTRAINT `member_tier_histories_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_point_histories` ADD CONSTRAINT `member_point_histories_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_point_histories` ADD CONSTRAINT `member_point_histories_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_point_histories` ADD CONSTRAINT `member_point_histories_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_point_histories` ADD CONSTRAINT `member_point_histories_refereeId_fkey` FOREIGN KEY (`refereeId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_point_histories` ADD CONSTRAINT `member_point_histories_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `tiers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_point_histories` ADD CONSTRAINT `member_point_histories_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_product_histories` ADD CONSTRAINT `member_product_histories_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_product_histories` ADD CONSTRAINT `member_product_histories_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_product_histories` ADD CONSTRAINT `member_product_histories_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_product_histories` ADD CONSTRAINT `member_product_histories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_product_histories` ADD CONSTRAINT `member_product_histories_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_product_histories` ADD CONSTRAINT `member_product_histories_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tier_languages` ADD CONSTRAINT `tier_languages_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `tiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tier_charts` ADD CONSTRAINT `tier_charts_currId_fkey` FOREIGN KEY (`currId`) REFERENCES `tiers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tier_charts` ADD CONSTRAINT `tier_charts_nextId_fkey` FOREIGN KEY (`nextId`) REFERENCES `tiers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotions` ADD CONSTRAINT `promotions_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotions` ADD CONSTRAINT `promotions_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_payments` ADD CONSTRAINT `invoice_payments_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facts` ADD CONSTRAINT `facts_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facts` ADD CONSTRAINT `facts_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `product_brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `product_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_languages` ADD CONSTRAINT `product_languages_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_medias` ADD CONSTRAINT `product_medias_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist` ADD CONSTRAINT `wishlist_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist` ADD CONSTRAINT `wishlist_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
