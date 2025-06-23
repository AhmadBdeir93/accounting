-- --------------------------------------------------------
-- Hôte:                         127.0.0.1
-- Version du serveur:           10.11.0-MariaDB - mariadb.org binary distribution
-- SE du serveur:                Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Listage de la structure de la base pour compta_simple
CREATE DATABASE IF NOT EXISTS `compta_simple` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `compta_simple`;

-- Listage de la structure de la table compta_simple. ecritures
CREATE TABLE IF NOT EXISTS `ecritures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `tiers_id` int(11) NOT NULL,
  `date_ecriture` date NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `debit` decimal(15,2) DEFAULT 0.00,
  `credit` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `tiers_id` (`tiers_id`),
  CONSTRAINT `ecritures_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ecritures_ibfk_2` FOREIGN KEY (`tiers_id`) REFERENCES `tiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Listage des données de la table compta_simple.ecritures : ~0 rows (environ)
DELETE FROM `ecritures`;
/*!40000 ALTER TABLE `ecritures` DISABLE KEYS */;
INSERT INTO `ecritures` (`id`, `user_id`, `tiers_id`, `date_ecriture`, `libelle`, `debit`, `credit`, `created_at`) VALUES
	(1, 1, 108, '2025-06-23', 'FACTURE', 100.00, 0.00, '2025-06-23 11:00:47'),
	(2, 1, 108, '2025-06-23', 'CHEQUE', 0.00, 99.91, '2025-06-23 11:25:00');
/*!40000 ALTER TABLE `ecritures` ENABLE KEYS */;

-- Listage de la structure de la table compta_simple. tiers
CREATE TABLE IF NOT EXISTS `tiers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `type` enum('client','fournisseur') NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telephone` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tiers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4;

-- Listage des données de la table compta_simple.tiers : ~0 rows (environ)
DELETE FROM `tiers`;
/*!40000 ALTER TABLE `tiers` DISABLE KEYS */;
INSERT INTO `tiers` (`id`, `user_id`, `nom`, `type`, `email`, `telephone`, `created_at`) VALUES
	(108, 1, 'CHOUR HUSSEIN', 'client', 'husseinchour@email.com', '0149014901', '2025-06-23 11:00:11');
/*!40000 ALTER TABLE `tiers` ENABLE KEYS */;

-- Listage de la structure de la table compta_simple. users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

-- Listage des données de la table compta_simple.users : ~1 rows (environ)
DELETE FROM `users`;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`) VALUES
	(1, 'AHMAD', 'bdeirahmed.ba@gmail.com', '$2a$10$BC4xLRjRNJxEvecocX3aMumt/moVGJ5rWBqlz/4c4W2B6uJPNa.5O', '2025-06-23 10:57:28');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
