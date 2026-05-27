-- baoyu-skills-studio 数据库初始化 DDL
-- 等价于 alembic upgrade head（migrations 001-006）
-- 字符集: utf8mb4，引擎: InnoDB

CREATE DATABASE IF NOT EXISTS `baoyu_studio` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `baoyu_studio`;

-- ----------------------------
-- 1. users
-- ----------------------------
CREATE TABLE `users` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT,
  `email`         VARCHAR(255) NOT NULL,
  `username`      VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role`          ENUM('user','admin') NOT NULL DEFAULT 'user',
  `credits`       INT          NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 2. refresh_tokens
-- ----------------------------
CREATE TABLE `refresh_tokens` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT       NOT NULL,
  `token_hash`  VARCHAR(255) NOT NULL,
  `expires_at`  DATETIME     NOT NULL,
  `revoked`     TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_rt_user` (`user_id`),
  CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 3. portfolios（含 migration 004、005、006 的变更）
-- ----------------------------
CREATE TABLE `portfolios` (
  `id`          VARCHAR(36)  NOT NULL,
  `user_id`     BIGINT       NOT NULL,
  `module`      ENUM('cover_image','infographic','article_illustrator','comic','slide_deck','xhs_images') NOT NULL,
  `title`       VARCHAR(255) NOT NULL,
  `params`      JSON         NOT NULL,
  `status`      ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
  `image_paths` JSON,
  `image_count` INT          NOT NULL DEFAULT 0,
  `error_msg`   TEXT,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME,
  `seq`         BIGINT       NOT NULL AUTO_INCREMENT,   -- 004: 排序用自增序号
  `is_deleted`  TINYINT(1)   NOT NULL DEFAULT 0,        -- 006: 软删除
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_portfolios_seq` (`seq`),
  KEY `ix_portfolios_status_completed` (`status`, `completed_at`),  -- 005
  KEY `fk_portfolios_user` (`user_id`),
  CONSTRAINT `fk_portfolios_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 4. credit_transactions
-- ----------------------------
CREATE TABLE `credit_transactions` (
  `id`           BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT       NOT NULL,
  `amount`       INT          NOT NULL,
  `balance_after` INT         NOT NULL,
  `type`         ENUM('admin_grant','admin_deduct','generation') NOT NULL,
  `note`         VARCHAR(500),
  `operator_id`  BIGINT,
  `portfolio_id` VARCHAR(36),
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ct_user` (`user_id`),
  KEY `fk_ct_operator` (`operator_id`),
  KEY `fk_ct_portfolio` (`portfolio_id`),
  CONSTRAINT `fk_ct_user`      FOREIGN KEY (`user_id`)      REFERENCES `users` (`id`),
  CONSTRAINT `fk_ct_operator`  FOREIGN KEY (`operator_id`)  REFERENCES `users` (`id`),
  CONSTRAINT `fk_ct_portfolio` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 5. user_activities（003 最终状态，去掉了 002 的 unique 约束）
-- ----------------------------
CREATE TABLE `user_activities` (
  `id`         BIGINT   NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT   NOT NULL,
  `date`       DATE     NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_user_activities_date` (`date`),
  KEY `ix_user_activities_user_id` (`user_id`),
  CONSTRAINT `fk_ua_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 6. alembic_version（alembic 迁移版本记录）
-- ----------------------------
CREATE TABLE `alembic_version` (
  `version_num` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `alembic_version` VALUES ('006');
