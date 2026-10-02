-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 26, 2026 at 09:34 AM
-- Server version: 11.8.9-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u859202671_RealEstatein`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `category` enum('Users','Properties','System') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `category`, `created_at`) VALUES
(1, 1, 'User registered as Seller', 'Users', '2026-07-21 18:16:06'),
(2, 1, 'New property submitted #P10023', 'Properties', '2026-07-21 18:16:06'),
(3, NULL, 'Admin approved property #P10023', 'System', '2026-07-21 18:16:06'),
(4, NULL, 'Admin updated site settings', 'System', '2026-07-21 18:16:06'),
(5, 1, 'User profile updated', 'Users', '2026-07-21 18:16:06'),
(6, NULL, 'Report marked as Resolved by Admin', 'System', '2026-07-22 07:31:29'),
(7, NULL, 'Property ID #1 deleted by Admin', 'Properties', '2026-07-22 07:31:44'),
(8, NULL, 'Property ID #8 status set to \'Active\' by Admin', 'Properties', '2026-07-22 07:31:48'),
(9, NULL, 'Property ID #7 status set to \'Active\' by Admin', 'Properties', '2026-07-22 07:31:50'),
(10, NULL, 'User ID #6 completely deleted by Admin', 'Users', '2026-08-24 11:51:30'),
(11, NULL, 'User ID #12 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: None)', 'Users', '2026-08-29 14:37:49'),
(12, NULL, 'User ID #1 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: None)', 'Users', '2026-08-29 15:12:21'),
(13, NULL, 'User ID #1 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: None)', 'Users', '2026-08-29 18:07:34'),
(14, NULL, 'User ID #1 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: None)', 'Users', '2026-08-29 18:12:54'),
(15, NULL, 'User ID #1 subscription overrides updated by Admin (Free Grant: No, Trial Expiry: None)', 'Users', '2026-08-29 18:19:35'),
(16, NULL, 'User ID #1 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: None)', 'Users', '2026-08-29 18:19:40'),
(17, NULL, 'User ID #1 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: None)', 'Users', '2026-08-29 18:20:39'),
(18, NULL, 'User ID #10 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: None)', 'Users', '2026-08-29 18:34:03'),
(19, NULL, 'Role switch request approved for user ID #1. New Role: Broker', 'Users', '2026-08-29 19:53:04'),
(20, NULL, 'Global trial settings updated for agency to 3 days. User trial windows recalculated.', 'System', '2026-08-29 20:25:42'),
(21, NULL, 'Global trial settings updated for owner to 5 days. User trial windows recalculated.', 'System', '2026-08-29 20:25:42'),
(22, NULL, 'Global trial settings updated for user to 30 days. User trial windows recalculated.', 'System', '2026-08-29 20:25:42'),
(23, NULL, 'Global trial settings updated for broker to 5 days. User trial windows recalculated.', 'System', '2026-08-29 20:25:42'),
(24, NULL, 'Property ID #18 deleted by Admin', 'Properties', '2026-09-07 19:04:46'),
(25, NULL, 'Property ID #13 deleted by Admin', 'Properties', '2026-09-07 19:04:57'),
(26, NULL, 'Property ID #17 deleted by Admin', 'Properties', '2026-09-07 19:05:05'),
(27, NULL, 'Property ID #15 deleted by Admin', 'Properties', '2026-09-07 19:05:10'),
(28, NULL, 'User ID #2 completely deleted by Admin', 'Users', '2026-09-07 19:09:03'),
(29, NULL, 'User ID #5 completely deleted by Admin', 'Users', '2026-09-07 19:09:11'),
(30, NULL, 'User ID #7 completely deleted by Admin', 'Users', '2026-09-07 19:09:19'),
(31, NULL, 'User ID #8 completely deleted by Admin', 'Users', '2026-09-07 19:09:25'),
(32, NULL, 'User ID #4 completely deleted by Admin', 'Users', '2026-09-07 19:09:32'),
(33, NULL, 'User ID #12 completely deleted by Admin', 'Users', '2026-09-07 19:09:37'),
(34, NULL, 'User ID #3 completely deleted by Admin', 'Users', '2026-09-07 19:09:43'),
(35, NULL, 'User ID #13 completely deleted by Admin', 'Users', '2026-09-07 19:10:02'),
(36, NULL, 'User ID #9 completely deleted by Admin', 'Users', '2026-09-07 19:10:17'),
(37, NULL, 'User ID #14 subscription overrides updated by Admin (Free Grant: No, Trial Expiry: 2026-09-30)', 'Users', '2026-09-16 08:26:51'),
(38, NULL, 'User ID #14 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: 2026-09-30)', 'Users', '2026-09-16 08:27:51'),
(39, NULL, 'User ID #20 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: 2026-09-23)', 'Users', '2026-09-16 11:48:55'),
(40, NULL, 'Property ID #22 status set to \'Active\' by Admin', 'Properties', '2026-09-21 13:46:09'),
(41, NULL, 'Property ID #27 deleted by Admin', 'Properties', '2026-09-21 13:47:04'),
(42, NULL, 'Property ID #28 status set to \'Active\' by Admin', 'Properties', '2026-09-21 13:47:07'),
(43, NULL, 'Property ID #23 status set to \'Active\' by Admin', 'Properties', '2026-09-21 13:47:11'),
(44, NULL, 'Property ID #26 deleted by Admin', 'Properties', '2026-09-21 13:47:18'),
(45, NULL, 'Property ID #25 deleted by Admin', 'Properties', '2026-09-21 13:47:42'),
(46, NULL, 'Property ID #24 deleted by Admin', 'Properties', '2026-09-21 13:47:50'),
(47, NULL, 'User ID #19 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: 2026-09-25)', 'Users', '2026-09-24 15:56:03'),
(48, NULL, 'User ID #19 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: 2026-09-25)', 'Users', '2026-09-24 15:57:53'),
(49, NULL, 'User ID #1 subscription overrides updated by Admin (Free Grant: Yes, Trial Expiry: None)', 'Users', '2026-09-24 16:07:20'),
(50, NULL, 'Property ID #29 status set to \'Active\' by Admin', 'Properties', '2026-09-24 16:21:12'),
(51, NULL, 'Role switch request approved for user ID #11. New Role: Broker', 'Users', '2026-09-25 14:05:40');

-- --------------------------------------------------------

--
-- Table structure for table `app_download_page_settings`
--

CREATE TABLE `app_download_page_settings` (
  `id` int(11) NOT NULL,
  `brand_logo_url` varchar(255) DEFAULT NULL,
  `main_title` varchar(255) NOT NULL,
  `subtitle` varchar(500) NOT NULL,
  `google_play_url` varchar(255) NOT NULL,
  `app_store_url` varchar(255) NOT NULL,
  `safe_secure_title` varchar(255) NOT NULL,
  `safe_secure_desc` varchar(255) NOT NULL,
  `trusted_users_title` varchar(255) NOT NULL,
  `trusted_users_desc` varchar(255) NOT NULL,
  `footer_brand` varchar(255) NOT NULL,
  `footer_tagline` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `app_download_page_settings`
--

INSERT INTO `app_download_page_settings` (`id`, `brand_logo_url`, `main_title`, `subtitle`, `google_play_url`, `app_store_url`, `safe_secure_title`, `safe_secure_desc`, `trusted_users_title`, `trusted_users_desc`, `footer_brand`, `footer_tagline`) VALUES
(1, '', 'You\'ve received a property on Kerala Realty', 'To view this property and more details, download the Kerala Realty app.', 'https://play.google.com/store', 'https://www.apple.com/app-store', 'Safe & Secure', 'We don\'t share any personal information.', 'Trusted by thousands', 'Trusted by thousands of users across Kerala.', 'Kerala Realty', 'Your trusted property partner in Kerala');

-- --------------------------------------------------------

--
-- Table structure for table `contact_clicks`
--

CREATE TABLE `contact_clicks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_clicks`
--

INSERT INTO `contact_clicks` (`id`, `user_id`, `property_id`, `created_at`) VALUES
(2, 15, 19, '2026-09-14 07:25:06'),
(3, 15, 16, '2026-09-14 07:46:40');

-- --------------------------------------------------------

--
-- Table structure for table `enquiries`
--

CREATE TABLE `enquiries` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `visitor_id` int(11) NOT NULL,
  `message` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enquiries`
--

INSERT INTO `enquiries` (`id`, `property_id`, `visitor_id`, `message`, `created_at`) VALUES
(2, 19, 15, 'Clicked WhatsApp contact button', '2026-09-14 07:25:06'),
(3, 19, 15, 'Clicked WhatsApp contact button', '2026-09-14 07:25:06'),
(4, 16, 15, 'Clicked WhatsApp contact button', '2026-09-14 07:46:40'),
(5, 16, 15, 'Clicked Call contact button', '2026-09-14 07:46:52');

-- --------------------------------------------------------

--
-- Table structure for table `landing_features`
--

CREATE TABLE `landing_features` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(80) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `landing_features`
--

INSERT INTO `landing_features` (`id`, `title`, `description`, `icon`, `created_at`) VALUES
(1, 'Verified Listings', 'Every property on our platform goes through mandatory moderation and title review checks, ensuring high-quality leads and scam-free deals.', 'CheckCircle2', '2026-08-24 11:04:04'),
(2, 'District & Local Maps', 'Easily filter properties by district, location, area size, and exact budget. Make informed choices with local community map references.', 'Map', '2026-08-24 11:04:04'),
(3, 'Direct Inquiry Channels', 'Direct phone and WhatsApp integrations let you contact owners or certified agents instantly, cutting out unnecessary delay or middleman margins.', 'Shield', '2026-08-24 11:04:04');

-- --------------------------------------------------------

--
-- Table structure for table `mobile_share_page_settings`
--

CREATE TABLE `mobile_share_page_settings` (
  `id` int(11) NOT NULL,
  `brand_name` varchar(150) NOT NULL,
  `brand_logo_url` varchar(255) DEFAULT NULL,
  `tagline` varchar(255) NOT NULL,
  `illustration_url` varchar(255) DEFAULT NULL,
  `description_quote` varchar(500) NOT NULL,
  `button_text` varchar(150) NOT NULL,
  `google_play_url` varchar(255) NOT NULL,
  `app_store_url` varchar(255) NOT NULL,
  `trust_text` varchar(255) NOT NULL,
  `background_image_url` varchar(255) DEFAULT '/share_interstitial_bg.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mobile_share_page_settings`
--

INSERT INTO `mobile_share_page_settings` (`id`, `brand_name`, `brand_logo_url`, `tagline`, `illustration_url`, `description_quote`, `button_text`, `google_play_url`, `app_store_url`, `trust_text`, `background_image_url`) VALUES
(1, 'Sparrow Properties', '/brand_logo.png', 'Your trusted property partner', '', 'The best way to buy, sell and rent properties.', 'Download the App to continue', 'https://play.google.com/store', 'https://www.apple.com/app-store', 'Secure. Trusted. Reliable.', '/share_interstitial_bg.png');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `message` varchar(500) NOT NULL,
  `property_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `title` varchar(120) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `message`, `property_id`, `is_read`, `created_at`, `title`, `link`) VALUES
(1, 10, 1, 'like', 'Anjana RAJ liked your property \"House in Wayanad\"', 11, 1, '2026-08-29 15:50:09', NULL, NULL),
(4, 1, NULL, 'System', 'Congratulations! The Admin has granted you a Free Premium Subscription. You now have unlimited access to all features.', NULL, 1, '2026-08-29 18:19:40', 'Free Subscription Granted', '/profile'),
(5, 10, 1, 'schedule', 'Anjana RAJ scheduled a visit for your property \"House in Wayanad\" on Aug 31, 2026', 11, 1, '2026-08-29 18:32:23', 'Visit Scheduled', '/my-properties/11'),
(6, 10, NULL, 'System', 'Congratulations! The Admin has granted you a Free Premium Subscription. You now have unlimited access to all features.', NULL, 1, '2026-08-29 18:34:03', 'Free Subscription Granted', '/profile'),
(8, 1, NULL, 'RoleUpgrade', 'Your role switch request has been approved! Your account role is now upgraded to Broker.', NULL, 1, '2026-08-29 19:53:04', NULL, NULL),
(9, 10, 1, 'like', 'Anjana RAJ liked your property \"Apartment in Kozhikode\"', 12, 0, '2026-09-04 13:47:24', NULL, NULL),
(10, 10, 1, 'like', 'Anjana RAJ liked your property \"Apartment in Kozhikode\"', 12, 0, '2026-09-04 13:49:49', NULL, NULL),
(13, 14, NULL, 'System', 'Your premium trial period has been updated/extended by the Admin to expire on Sep 30, 2026.', NULL, 0, '2026-09-16 08:26:51', 'Trial Period Updated', '/profile'),
(14, 14, NULL, 'System', 'Congratulations! The Admin has granted you a Free Premium Subscription. You now have unlimited access to all features.', NULL, 0, '2026-09-16 08:27:51', 'Free Subscription Granted', '/profile'),
(15, 20, NULL, 'System', 'Congratulations! The Admin has granted you a Free Premium Subscription. You now have unlimited access to all features.', NULL, 0, '2026-09-16 11:48:55', 'Free Subscription Granted', '/profile'),
(16, 20, NULL, 'System', 'Your premium trial period has been updated/extended by the Admin to expire on Sep 23, 2026.', NULL, 0, '2026-09-16 11:48:55', 'Trial Period Updated', '/profile'),
(17, 19, NULL, 'System', 'Congratulations! The Admin has granted you a Free Premium Subscription. You now have unlimited access to all features.', NULL, 0, '2026-09-24 15:56:03', 'Free Subscription Granted', '/profile'),
(18, 19, NULL, 'System', 'Your premium trial period has been updated/extended by the Admin to expire on Sep 25, 2026.', NULL, 0, '2026-09-24 15:56:03', 'Trial Period Updated', '/profile'),
(19, 11, NULL, 'RoleUpgrade', 'Your role switch request has been approved! Your account role is now upgraded to Broker.', NULL, 1, '2026-09-25 14:05:40', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `property_type` varchar(100) NOT NULL,
  `purpose` enum('For Sale','For Rent') NOT NULL,
  `price` decimal(14,2) NOT NULL,
  `area_sqft` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `district` varchar(80) NOT NULL,
  `bedrooms` int(11) DEFAULT 0,
  `bathrooms` int(11) DEFAULT 0,
  `furnishing` enum('Unfurnished','Semi-Furnished','Fully Furnished') DEFAULT NULL,
  `facing` varchar(20) DEFAULT NULL,
  `property_age` varchar(30) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `listing_role` enum('Owner','Broker','Agency') NOT NULL,
  `status` enum('Draft','Pending','Active','Inactive','Rejected') DEFAULT 'Pending',
  `views` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `contact_number` varchar(20) DEFAULT NULL,
  `whatsapp_number` varchar(20) DEFAULT NULL,
  `owner_name` varchar(120) DEFAULT NULL,
  `broker_name` varchar(120) DEFAULT NULL,
  `agency_name` varchar(120) DEFAULT NULL,
  `agency_logo_url` varchar(500) DEFAULT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  `use_admin_contact` tinyint(1) NOT NULL DEFAULT 0,
  `is_price_negotiable` tinyint(1) NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_broker_personal_property` tinyint(1) NOT NULL DEFAULT 0,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `state` varchar(100) NOT NULL DEFAULT 'Kerala'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `properties`
--

INSERT INTO `properties` (`id`, `owner_id`, `title`, `property_type`, `purpose`, `price`, `area_sqft`, `address`, `district`, `bedrooms`, `bathrooms`, `furnishing`, `facing`, `property_age`, `description`, `listing_role`, `status`, `views`, `created_at`, `updated_at`, `contact_number`, `whatsapp_number`, `owner_name`, `broker_name`, `agency_name`, `agency_logo_url`, `youtube_url`, `use_admin_contact`, `is_price_negotiable`, `is_featured`, `is_broker_personal_property`, `latitude`, `longitude`, `state`) VALUES
(11, 10, 'House in Wayanad', 'House', 'For Sale', 6500000.00, 1500, 'panamram', 'Wayanad', 4, 3, 'Fully Furnished', 'East', '1-5 Years', NULL, 'Owner', 'Active', 19, '2026-08-24 13:40:06', '2026-09-25 14:08:06', '+919633221234', '+919633221234', 'anumol', NULL, NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(12, 10, 'Apartment in Kozhikode', 'Apartment', 'For Sale', 5000000.00, 1500, 'Panamaram', 'Kozhikode', 4, 2, 'Fully Furnished', 'East', '1-5 Years', NULL, 'Owner', 'Active', 29, '2026-08-24 13:49:34', '2026-09-23 15:39:15', '+919633221234', '+919633221234', 'anumol', NULL, NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(14, 1, 'Independent House / Villa in Wayanad', 'Independent House / Villa', 'For Sale', 6500000.00, 1536, 'Balussery , Kozhikode', 'Wayanad', 3, 3, NULL, NULL, NULL, NULL, 'Owner', 'Active', 17, '2026-08-29 14:33:23', '2026-09-14 10:59:08', '9946470404', '9946470404', 'Anjana RAJ', NULL, NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(16, 1, 'Plot / Land in Wayanad', 'Plot / Land', 'For Sale', 60000000.00, 2178000, 'Eachome', 'Wayanad', 3, 0, NULL, NULL, NULL, NULL, 'Owner', 'Active', 12, '2026-08-29 18:57:03', '2026-09-21 16:39:43', '9946470404', '9946470404', 'Anjana RAJ', NULL, NULL, NULL, NULL, 0, 1, 0, 0, 11.74099229, 76.07154066, 'Kerala'),
(19, 1, 'Independent House / Villa in Kozhikode', 'Independent House / Villa', 'For Sale', 8000000.00, 1500, 'Mukkam', 'Kozhikode', 5, 3, NULL, NULL, NULL, NULL, 'Broker', 'Active', 5, '2026-09-07 19:14:11', '2026-09-14 07:18:29', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, 11.32153875, 75.99546077, 'Kerala'),
(20, 1, 'Plot / Land in Kozhikode', 'Plot / Land', 'For Sale', 6500000.00, 87120, 'Thiruvambadi , mukkam', 'Kozhikode', 0, 0, NULL, NULL, NULL, NULL, 'Broker', 'Active', 0, '2026-09-15 03:58:46', '2026-09-15 03:58:47', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(21, 1, 'Independent House / Villa in Chennai', 'Independent House / Villa', 'For Sale', 6000580.00, 2000, 'Royapuram', 'Chennai', 4, 3, NULL, NULL, NULL, NULL, 'Broker', 'Active', 6, '2026-09-15 09:02:40', '2026-09-21 16:35:13', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Tamil Nadu'),
(22, 1, 'Apartment in Ballari', 'Apartment', 'For Rent', 15000.00, 1600, 'Siruguppa ', 'Ballari', 4, 3, NULL, NULL, NULL, NULL, 'Broker', 'Active', 6, '2026-09-15 09:09:12', '2026-09-25 14:12:56', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Karnataka'),
(23, 1, 'Plot / Land in South Goa', 'Plot / Land', 'For Sale', 1500000.00, 10890, 'Panaji', 'South Goa', 0, 0, NULL, NULL, NULL, NULL, 'Broker', 'Active', 2, '2026-09-15 09:18:22', '2026-09-25 13:02:17', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Goa'),
(28, 1, 'Plot / Land in Kozhikode', 'Plot / Land', 'For Sale', 2500000.00, 43560, 'Mukkam', 'Kozhikode', 0, 0, NULL, NULL, NULL, NULL, 'Broker', 'Active', 8, '2026-09-21 12:11:57', '2026-09-25 13:51:08', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(29, 11, 'Plot / Land in Wayanad', 'Plot / Land', 'For Sale', 6000000.00, 108900, 'Mylambadi , Meenangadi', 'Wayanad', 5, 4, NULL, NULL, NULL, NULL, 'Owner', 'Active', 7, '2026-09-24 16:20:32', '2026-09-25 14:16:52', '+919961466736', '+919961466736', 'Aswanth', NULL, NULL, NULL, NULL, 0, 1, 0, 0, 11.68188339, 76.18333989, 'Kerala');

-- --------------------------------------------------------

--
-- Table structure for table `property_media`
--

CREATE TABLE `property_media` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `media_type` enum('image','video') NOT NULL,
  `url` varchar(500) NOT NULL,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_media`
--

INSERT INTO `property_media` (`id`, `property_id`, `media_type`, `url`, `sort_order`) VALUES
(19, 11, 'image', '/uploads/1787578804971-606586619.webp', 0),
(20, 11, 'image', '/uploads/1787578804980-505384097.webp', 1),
(21, 11, 'image', '/uploads/1787578805397-352317363.webp', 2),
(22, 12, 'image', '/uploads/1787579373412-266872500.webp', 0),
(23, 12, 'video', '/uploads/1787579373849-818692764.mp4', 1),
(26, 14, 'image', '/uploads/1788014002459-348622458.webp', 0),
(27, 14, 'image', '/uploads/1788014002462-319086498.webp', 1),
(28, 14, 'image', '/uploads/1788016301656-641479096.webp', 2),
(29, 14, 'image', '/uploads/1788016302829-485166018.webp', 3),
(32, 16, 'image', '/uploads/1788029822344-876433605.webp', 0),
(35, 19, 'image', '/uploads/1788808450820-129424248.webp', 0),
(36, 19, 'image', '/uploads/1788808450827-544828037.webp', 1),
(37, 19, 'image', '/uploads/1788808450830-720621833.webp', 2),
(38, 20, 'image', '/uploads/1789444726314-754929077.webp', 0),
(39, 21, 'image', '/uploads/1789462959791-351457580.webp', 0),
(40, 21, 'image', '/uploads/1789462959792-125453073.webp', 1),
(41, 21, 'image', '/uploads/1789462959792-255125549.webp', 2),
(42, 22, 'image', '/uploads/1789463352805-849023666.webp', 0),
(43, 23, 'image', '/uploads/1789463902488-81528372.webp', 0),
(44, 23, 'image', '/uploads/1789463902489-727191742.webp', 1),
(53, 28, 'image', '/uploads/1789992717235-379519164.webp', 0),
(54, 28, 'video', '/uploads/1789992717242-960688393.mov', 1),
(55, 29, 'image', '/uploads/1790266831478-430013097.webp', 0),
(56, 29, 'image', '/uploads/1790266831485-176794204.webp', 1),
(57, 29, 'image', '/uploads/1790266831488-802757091.webp', 2),
(58, 29, 'image', '/uploads/1790266831493-76732987.webp', 3),
(59, 29, 'image', '/uploads/1790266831494-623690993.webp', 4),
(60, 29, 'image', '/uploads/1790266831497-298052400.webp', 5);

-- --------------------------------------------------------

--
-- Table structure for table `property_reviews`
--

CREATE TABLE `property_reviews` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `property_views`
--

CREATE TABLE `property_views` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `visitor_id` int(11) DEFAULT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `property_views`
--

INSERT INTO `property_views` (`id`, `property_id`, `visitor_id`, `viewed_at`, `ip_address`, `user_agent`) VALUES
(88, 12, 11, '2026-08-28 06:34:12', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0'),
(89, 11, 11, '2026-08-28 06:34:18', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0'),
(90, 11, 11, '2026-08-28 06:35:51', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0'),
(93, 11, 12, '2026-08-29 06:51:10', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(94, 12, 1, '2026-08-29 13:21:52', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(107, 11, 1, '2026-08-29 18:32:16', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(109, 11, 1, '2026-08-29 18:38:22', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(110, 11, 1, '2026-08-29 18:43:20', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(113, 12, 1, '2026-08-29 19:42:54', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(115, 11, 1, '2026-08-29 19:53:37', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(116, 12, 1, '2026-08-29 20:16:11', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(117, 12, 1, '2026-08-29 20:18:53', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(118, 12, 1, '2026-08-29 20:19:17', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(119, 12, 1, '2026-08-29 20:19:44', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(120, 12, 1, '2026-08-29 20:24:13', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(121, 12, 1, '2026-08-29 20:26:44', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(122, 12, 1, '2026-08-29 20:28:14', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(123, 12, 1, '2026-08-29 20:29:20', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(124, 12, 1, '2026-08-29 20:30:45', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(125, 11, 1, '2026-08-29 20:32:52', '::1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'),
(126, 12, NULL, '2026-08-31 15:50:02', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0'),
(127, 12, NULL, '2026-08-31 16:08:00', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0'),
(128, 12, NULL, '2026-08-31 16:08:11', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0'),
(129, 12, NULL, '2026-08-31 16:13:45', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0'),
(130, 11, 1, '2026-09-04 15:04:52', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36'),
(131, 12, 1, '2026-09-04 15:05:26', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36'),
(132, 12, 1, '2026-09-04 15:14:39', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36'),
(133, 12, 1, '2026-09-04 15:15:06', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36'),
(134, 12, NULL, '2026-09-04 15:24:47', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9168'),
(135, 12, NULL, '2026-09-04 15:44:45', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9168'),
(136, 12, NULL, '2026-09-07 07:42:27', '::1', 'node'),
(137, 11, 14, '2026-09-07 11:33:58', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(138, 14, 14, '2026-09-07 12:17:59', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(139, 14, 14, '2026-09-07 12:21:11', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(140, 14, 14, '2026-09-07 12:21:29', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(141, 14, 14, '2026-09-07 12:21:59', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(142, 14, 14, '2026-09-07 12:22:12', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(150, 11, 1, '2026-09-08 06:28:53', '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/152.0.7977.64 Mobile/15E148 Safari/604.1'),
(151, 12, 15, '2026-09-08 16:34:06', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(152, 16, 15, '2026-09-08 16:34:37', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'),
(153, 12, 16, '2026-09-12 14:15:10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(154, 12, 14, '2026-09-12 21:12:34', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36'),
(155, 19, 14, '2026-09-13 16:00:25', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36'),
(156, 19, 14, '2026-09-13 16:01:11', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36'),
(157, 19, NULL, '2026-09-13 16:02:01', '127.0.0.1', ''),
(158, 19, NULL, '2026-09-13 16:08:53', '127.0.0.1', ''),
(159, 11, 15, '2026-09-13 17:11:06', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36'),
(160, 11, 14, '2026-09-13 17:13:28', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14; RMX3710 Build/UKQ1.230924.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.199 Mobile Safari/537.36'),
(161, 11, NULL, '2026-09-13 17:16:16', '127.0.0.1', ''),
(162, 11, 15, '2026-09-13 17:16:17', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36'),
(163, 11, NULL, '2026-09-13 18:06:18', '127.0.0.1', ''),
(164, 11, 15, '2026-09-13 18:06:19', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36'),
(165, 19, 15, '2026-09-14 07:18:29', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36'),
(166, 16, 15, '2026-09-14 07:41:28', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(167, 16, 15, '2026-09-14 07:41:54', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36'),
(168, 16, 15, '2026-09-14 07:46:37', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36'),
(169, 16, NULL, '2026-09-14 07:46:45', '127.0.0.1', ''),
(170, 16, 15, '2026-09-14 07:48:22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(171, 16, NULL, '2026-09-14 07:48:32', '127.0.0.1', ''),
(172, 16, 15, '2026-09-14 07:48:33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(173, 14, 15, '2026-09-14 07:48:49', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(174, 14, NULL, '2026-09-14 08:00:47', '127.0.0.1', ''),
(175, 14, 15, '2026-09-14 08:00:47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(176, 14, NULL, '2026-09-14 08:05:53', '127.0.0.1', ''),
(177, 14, 15, '2026-09-14 08:05:53', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(178, 14, NULL, '2026-09-14 08:06:08', '127.0.0.1', ''),
(179, 14, 15, '2026-09-14 08:06:08', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(180, 14, NULL, '2026-09-14 08:10:23', '127.0.0.1', ''),
(181, 14, 15, '2026-09-14 08:10:23', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(182, 14, NULL, '2026-09-14 10:30:53', '127.0.0.1', ''),
(183, 14, 15, '2026-09-14 10:30:53', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(184, 12, 15, '2026-09-14 10:37:44', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(185, 16, 15, '2026-09-14 10:48:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(186, 14, 15, '2026-09-14 10:59:08', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(187, 21, 19, '2026-09-15 11:34:26', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(188, 21, 20, '2026-09-16 11:41:40', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36'),
(190, 12, NULL, '2026-09-18 12:44:36', '127.0.0.1', ''),
(191, 12, 20, '2026-09-18 12:44:37', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36'),
(202, 16, NULL, '2026-09-21 13:48:59', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(203, 11, NULL, '2026-09-21 13:49:04', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(204, 21, NULL, '2026-09-21 13:49:15', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(205, 28, NULL, '2026-09-21 13:50:24', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(206, 28, 11, '2026-09-21 14:05:05', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(207, 22, NULL, '2026-09-21 16:32:23', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(208, 22, NULL, '2026-09-21 16:32:41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(209, 21, NULL, '2026-09-21 16:33:18', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(210, 16, NULL, '2026-09-21 16:33:33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(211, 22, NULL, '2026-09-21 16:33:56', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(212, 21, NULL, '2026-09-21 16:34:59', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(213, 28, NULL, '2026-09-21 16:35:04', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(214, 21, NULL, '2026-09-21 16:35:13', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(215, 23, NULL, '2026-09-21 16:38:39', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(216, 28, NULL, '2026-09-21 16:39:17', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(217, 28, NULL, '2026-09-21 16:39:24', '127.0.0.1', ''),
(218, 16, NULL, '2026-09-21 16:39:43', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(219, 28, NULL, '2026-09-21 16:40:09', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(220, 22, 15, '2026-09-21 16:41:16', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(221, 12, 20, '2026-09-23 15:39:15', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(222, 28, 18, '2026-09-23 18:26:25', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(223, 29, 18, '2026-09-24 17:07:06', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(224, 29, 18, '2026-09-24 17:07:22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(225, 29, 18, '2026-09-24 17:07:38', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(226, 29, 18, '2026-09-25 13:01:58', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(227, 23, 18, '2026-09-25 13:02:17', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(228, 22, 18, '2026-09-25 13:44:53', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(229, 29, 18, '2026-09-25 13:45:35', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(230, 28, 11, '2026-09-25 13:51:08', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(231, 11, 11, '2026-09-25 14:08:06', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(232, 22, 10, '2026-09-25 14:12:56', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(233, 29, 10, '2026-09-25 14:16:28', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(234, 29, 10, '2026-09-25 14:16:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0');

-- --------------------------------------------------------

--
-- Table structure for table `reported_listings`
--

CREATE TABLE `reported_listings` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `status` enum('Pending','Resolved') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_switch_requests`
--

CREATE TABLE `role_switch_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `requested_role` enum('Broker','Agency') NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_switch_requests`
--

INSERT INTO `role_switch_requests` (`id`, `user_id`, `requested_role`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Broker', 'Approved', '2026-08-29 19:52:46', '2026-08-29 19:53:04'),
(2, 20, 'Broker', 'Pending', '2026-09-16 11:49:37', '2026-09-16 11:49:37'),
(3, 11, 'Broker', 'Approved', '2026-09-25 14:05:26', '2026-09-25 14:05:40');

-- --------------------------------------------------------

--
-- Table structure for table `saved_properties`
--

CREATE TABLE `saved_properties` (
  `user_id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saved_properties`
--

INSERT INTO `saved_properties` (`user_id`, `property_id`, `created_at`) VALUES
(1, 11, '2026-08-29 15:50:09'),
(1, 14, '2026-08-29 15:50:07'),
(11, 29, '2026-09-25 13:46:16');

-- --------------------------------------------------------

--
-- Table structure for table `service_enquiries`
--

CREATE TABLE `service_enquiries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `city` varchar(120) NOT NULL,
  `user_class` varchar(50) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `service_name` varchar(120) NOT NULL,
  `status` varchar(50) DEFAULT 'New',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`key`, `value`) VALUES
('admin_contact_number', '+91 94460 12345'),
('admin_email', 'admin@keralarealty.com'),
('contact_address', 'GreenSparrows Ventures Private Limited,\nSkyline Signature Heights, Kakkanad,\nKochi, Kerala - 682030'),
('contact_email', 'support@greensparrows.com'),
('contact_phone', '+91 484 2901234 (10 AM - 6 PM)'),
('default_free_inquiries_limit', '20'),
('default_trial_days', '5'),
('default_trial_days_agency', '3'),
('default_trial_days_broker', '5'),
('default_trial_days_user', '30'),
('enable_schedule_visit', 'false'),
('featured_price', '190'),
('featured_text', 'Pin your listing to the top of home feed and search results to get up to 10x more leads.'),
('landing_app_description', 'Visiting our mobile app gives you access to maps, instant push notifications for matching properties, real-time agent chats, and location-aware search features. Scan the QR code or click the download button below to load the mobile-optimized experience directly on your smartphone.'),
('landing_app_download_url', 'http://localhost:5173/login'),
('landing_app_qr_image', ''),
('landing_app_title', 'Download Our Mobile App For Real-Time Notifications'),
('landing_hero_description', 'Explore curated houses, villas, apartments, and land plots across the lush greenery of Kerala. Connect directly with owners, brokers, and certified agencies.'),
('landing_hero_image', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000&q=80'),
('landing_hero_title', 'Find Your Perfect Kerala Nest & Escape'),
('login_banner_url', '/uploads/1788033494938-530342217.png'),
('login_heading', 'Hello!'),
('login_subheading', ''),
('welcome_banner_url', '/uploads/1789200892894-335450484.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `social_accounts`
--

CREATE TABLE `social_accounts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `provider` varchar(20) NOT NULL,
  `provider_user_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `social_accounts`
--

INSERT INTO `social_accounts` (`id`, `user_id`, `provider`, `provider_user_id`, `created_at`, `updated_at`) VALUES
(1, 18, 'google', '106874668654847659350', '2026-09-12 21:21:16', '2026-09-12 21:21:16'),
(2, 15, 'google', '110603837485083743088', '2026-09-13 16:11:55', '2026-09-13 16:11:55'),
(3, 14, 'google', '102631088883596724476', '2026-09-13 17:12:48', '2026-09-13 17:12:48'),
(4, 22, 'facebook', '10215552371837946', '2026-09-20 06:22:47', '2026-09-20 06:22:47');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `role` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` varchar(255) DEFAULT '',
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `duration_months` int(11) NOT NULL DEFAULT 1,
  `features` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`role`, `price`, `updated_at`, `description`, `discount`, `duration_months`, `features`) VALUES
('agency', 0.00, '2026-09-25 13:08:51', 'Agency free trial to configure corporate office and agents.', 0.00, 0, '[\"Post up to 5 properties free trial limit\",\"Direct email support\",\"Upload agency logo branding\"]'),
('agency', 1499.00, '2026-09-25 13:08:51', 'Agency features + contact unlocks for 1 month.', 200.00, 1, '[\"Multiple broker account seats\",\"Agency branding & logo on listings\",\"Dedicated agency profile page\",\"Premium visibility filters\"]'),
('agency', 7499.00, '2026-09-25 13:08:51', 'Agency features + contact unlocks for 6 months.', 1000.00, 6, '[\"Multiple broker account seats\",\"Agency branding & logo on listings\",\"Dedicated agency profile page\",\"Premium visibility filters\",\"3 Featured listing boosters\"]'),
('agency', 12999.00, '2026-09-25 13:08:51', 'Agency features + contact unlocks for 12 months.', 2000.00, 12, '[\"Multiple broker account seats\",\"Agency branding & logo on listings\",\"Dedicated agency profile page\",\"Premium visibility filters\",\"8 Featured listing boosters\",\"Personal account manager\"]'),
('broker', 0.00, '2026-09-25 13:08:51', 'Broker free trial to list properties and manage leads.', 0.00, 0, '[\"Post up to 5 properties free trial limit\",\"Direct email support\",\"Simple property wizard\"]'),
('broker', 799.00, '2026-09-25 13:08:51', 'Broker features + contact unlocks for 1 month.', 100.00, 1, '[\"Unlimited property listings\",\"Dedicated broker profile page\",\"Lead generation alerts\",\"Interactive customer inquiries tab\"]'),
('broker', 3999.00, '2026-09-25 13:08:51', 'Broker features + contact unlocks for 6 months.', 500.00, 6, '[\"Unlimited property listings\",\"Dedicated broker profile page\",\"Lead generation alerts\",\"Interactive customer inquiries tab\",\"2 Featured listing boosters\"]'),
('broker', 6999.00, '2026-09-25 13:08:51', 'Broker features + contact unlocks for 12 months.', 1000.00, 12, '[\"Unlimited property listings\",\"Dedicated broker profile page\",\"Lead generation alerts\",\"Interactive customer inquiries tab\",\"5 Featured listing boosters\",\"Priority listing verification\"]'),
('owner', 0.00, '2026-09-25 13:08:51', 'Individual property owner free tier with basic posting.', 0.00, 0, '[\"Post up to 2 properties completely free\",\"Simple listing editor\",\"Basic email support\"]'),
('owner', 399.00, '2026-09-25 13:08:51', 'Unlock direct contact details, WhatsApp shortcuts, and visitor leads for 1 month.', 50.00, 1, '[\"Post up to 5 properties\",\"View visitor statistics & leads\",\"Premium listing badge\",\"Direct lead contact details\"]'),
('owner', 1999.00, '2026-09-25 13:08:51', 'Unlock direct contact details, WhatsApp shortcuts, and visitor leads for 6 months.', 300.00, 6, '[\"Post up to 5 properties\",\"View visitor statistics & leads\",\"Premium listing badge\",\"Direct lead contact details\",\"1 Featured listing booster\"]'),
('owner', 3499.00, '2026-09-25 13:08:51', 'Unlock direct contact details, WhatsApp shortcuts, and visitor leads for 12 months.', 600.00, 12, '[\"Post up to 5 properties\",\"View visitor statistics & leads\",\"Premium listing badge\",\"Direct lead contact details\",\"3 Featured listing boosters\",\"Email marketing to active buyers\"]'),
('user', 0.00, '2026-09-25 13:08:51', 'Basic buyer account with search and saved property access.', 0.00, 0, '[\"Browse active listings\",\"Search and filter districts\",\"Save favorite properties\"]'),
('user', 299.00, '2026-09-25 13:08:51', 'Unlimited contact reveals & direct inquiry access for 1 month.', 50.00, 1, '[\"Reveal direct owner contacts\",\"WhatsApp chat shortcuts\",\"Save favorite listings\",\"Direct contact logs\"]'),
('user', 1499.00, '2026-09-25 13:08:51', 'Unlimited contact reveals & direct inquiry access for 6 months.', 200.00, 6, '[\"Reveal direct owner contacts\",\"WhatsApp chat shortcuts\",\"Save favorite listings\",\"Direct contact logs\",\"Email notifications for price drops\"]'),
('user', 2499.00, '2026-09-25 13:08:51', 'Unlimited contact reveals & direct inquiry access for 12 months.', 400.00, 12, '[\"Reveal direct owner contacts\",\"WhatsApp chat shortcuts\",\"Save favorite listings\",\"Direct contact logs\",\"Email notifications for price drops\",\"Priority support\"]');

-- --------------------------------------------------------

--
-- Table structure for table `top_locations`
--

CREATE TABLE `top_locations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `top_locations`
--

INSERT INTO `top_locations` (`id`, `name`, `image_url`, `created_at`) VALUES
(4, 'Ernakulam', '/uploads/1787578888472-752822174.jpeg', '2026-08-24 13:41:28'),
(5, 'Kozhikode', '/uploads/1787578911229-364200208.jpeg', '2026-08-24 13:41:51'),
(6, 'Thrissur', '/uploads/1787578936181-700631879.jpeg', '2026-08-24 13:42:16'),
(7, 'Wayanad', '/uploads/1787578999362-242555000.jpeg', '2026-08-24 13:43:19'),
(8, 'Kasargod', '/uploads/1787930604628-412523795.jpeg', '2026-08-28 15:23:24'),
(9, 'Kannur', '/uploads/1787930741011-667249410.jpeg', '2026-08-28 15:25:41'),
(10, 'Alapuzha', '/uploads/1787930760385-108923417.jpeg', '2026-08-28 15:26:00'),
(11, 'Idukki', '/uploads/1787930797757-3066265.jpeg', '2026-08-28 15:26:37'),
(12, 'Palakkad', '/uploads/1787930992638-171458505.jpeg', '2026-08-28 15:29:52'),
(13, 'Kottayam', '/uploads/1787931009541-988305668.jpeg', '2026-08-28 15:30:09'),
(14, 'Kollam', '/uploads/1787931070393-11668423.jpeg', '2026-08-28 15:31:10'),
(15, 'Pathanamthitta', '/uploads/1787931307729-478748503.jpeg', '2026-08-28 15:35:07'),
(16, 'Banglore', '/uploads/1788808700032-908350093.jpeg', '2026-09-07 19:18:20'),
(17, 'Delhi', '/uploads/1788808765581-450664179.jpeg', '2026-09-07 19:19:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(160) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `location` varchar(160) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_disabled` tinyint(4) DEFAULT 0,
  `last_login` timestamp NULL DEFAULT NULL,
  `reset_otp` varchar(10) DEFAULT NULL,
  `reset_otp_expires_at` datetime DEFAULT NULL,
  `role` enum('owner','broker','agency','user','Admin') DEFAULT 'user',
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `subscription_status` varchar(50) DEFAULT NULL,
  `razorpay_subscription_id` varchar(255) DEFAULT NULL,
  `custom_trial_expiry` datetime DEFAULT NULL,
  `is_free_subscription_granted` tinyint(1) NOT NULL DEFAULT 0,
  `subscription_expires_at` datetime DEFAULT NULL,
  `subscription_duration_months` int(11) DEFAULT NULL,
  `agency_address` text DEFAULT NULL,
  `agency_district` varchar(100) DEFAULT NULL,
  `agency_logo_url` varchar(255) DEFAULT NULL,
  `whatsapp_number` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `location`, `avatar_url`, `created_at`, `is_disabled`, `last_login`, `reset_otp`, `reset_otp_expires_at`, `role`, `trial_ends_at`, `subscription_status`, `razorpay_subscription_id`, `custom_trial_expiry`, `is_free_subscription_granted`, `subscription_expires_at`, `subscription_duration_months`, `agency_address`, `agency_district`, `agency_logo_url`, `whatsapp_number`) VALUES
(1, 'Anjana RAJ', 'anjanaraj1243@gmail.com', '9946470404', '$2a$10$mgvEG.vGaDI2SKwV5hDxd..SwKF6luyCWm6IMZLTw2krsRzeAVLBa', 'Wayanad', 'https://api.dicebear.com/7.x/avataaars/svg?seed=anjanaraj1243%40gmail.com', '2026-07-15 19:03:13', 0, '2026-09-24 16:01:24', NULL, NULL, 'broker', '2026-07-20 19:03:13', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, '9946470404'),
(10, 'Anumol', 'anumol@gmail.com', '+919633221234', '$2a$10$nYf3T7ynih98gNvLYAyVE.MtH2B92H/44YX2hn3be1Y6lTKI39O9y', '', NULL, '2026-08-24 11:16:29', 0, '2026-09-25 14:09:11', NULL, NULL, 'owner', '2026-08-29 11:16:29', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, '+919633221234'),
(11, 'Aswanth', 'aswanth@gmail.com', '+919961466736', '$2a$10$6hSsOguTBOBuEF9NdOZT4OUAuwRp7yVZNQHC03BhUMjcCCzk5HOC6', NULL, '/uploads/1789999473658-255157213.png', '2026-08-24 14:04:29', 0, '2026-09-24 16:14:06', NULL, NULL, 'broker', '2026-09-30 14:05:40', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '+919961466736'),
(14, 'jai', 'jai4isign@gmail.com', '+917760403244', '$2a$10$56dH70J8ZdDvK1HtjNynBeldr5gU7hEFyZhiXZ0SucVRf64eCLknq', 'Wayanad ', 'https://lh3.googleusercontent.com/a/ACg8ocL1GhjegZ3I5RLZNEXsqax4mlbU8-rmieBNwAzdKM5MAISK7J8=s96-c', '2026-09-07 11:33:25', 0, '2026-09-20 16:07:13', NULL, NULL, 'owner', '2026-09-25 13:21:27', NULL, NULL, '2026-09-30 00:00:00', 1, NULL, NULL, NULL, NULL, NULL, '+917760403244'),
(15, 'Jai', 'jayapraveenk85@gmail.com', '7760403244', '$2a$10$EeFH0XMaaEPP.364124xJ.BG/3cJKDmWqYZhsEDaDwUR.O/o3CgMa', '', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jayapraveenk85%40gmail.com', '2026-09-07 12:51:08', 0, '2026-09-21 16:40:32', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'Jai', 'jai@gmail.com', NULL, '$2a$10$MzsL2OAwMZ.SCsDT3qQSr.emDjV8oObQwbTAOdUQMUGlpcclkhJ.i', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=jai%40gmail.com', '2026-09-12 07:49:28', 0, '2026-09-12 07:49:28', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'Green Sparrows', 'greensparrows85@gmail.com', '', '$2a$10$26igUGIfEiFkDQ1lrYT5WOge3aUuIP/ECK3ueD5OLcntlt.pXQykS', '', 'https://api.dicebear.com/7.x/avataaars/svg?seed=greensparrows85%40gmail.com', '2026-09-12 16:29:59', 0, '2026-09-12 16:29:59', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'jayaraj B', 'jai4dhangout@gmail.com', '9495126132', '$2a$10$hJC0oo1rUkGxqe5xNtfTtOO4cXMzUUNHuVkNfh0YP.aoRuf96BMBO', '', 'https://lh3.googleusercontent.com/a/ACg8ocICgLihqjYX8m3kBQxvBweUS_-k3CZT2ng3N0teTUzjBhfB41qx=s96-c', '2026-09-12 21:21:16', 0, '2026-09-23 18:26:24', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'Ambili Raj', 'ambiliraj26@gmail.com', '+919633981112', '$2a$10$Koo/Wz6JlvpPcCR2t/AaBuN94uFZKeZSZJYmfMLYEIDRSyYXY2k16', '', '/uploads/1789471331717-758504401.jpeg', '2026-09-15 09:23:44', 0, '2026-09-15 09:23:44', NULL, NULL, 'user', NULL, NULL, NULL, '2026-09-25 00:00:00', 1, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Sam Hill', 'sam@gmail.com', '+919495126132', '$2a$10$nW3EOPtI4R9Cxh4zor3zKuVKz89XR5h97VDYrGBoCyUIAlfMb8XzW', 'Wayanad ', '/uploads/1789559363200-134423496.jpg', '2026-09-16 11:26:49', 0, '2026-09-16 11:29:43', NULL, NULL, 'owner', '2026-09-21 11:27:24', NULL, NULL, '2026-09-23 00:00:00', 1, NULL, NULL, NULL, NULL, NULL, '+919495126132'),
(21, 'Samsom', 'samm@gmail.com', '+916993452', '$2a$10$kZRMXdzLjPzgnseImPZi6OcJmiXjZkNyGn2.Uzp87z.0yONaOiZbC', '', NULL, '2026-09-19 20:20:10', 0, '2026-09-19 20:20:10', NULL, NULL, 'owner', '2026-09-24 20:20:28', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '+916993452'),
(22, 'Jayapraveen Kr', 'jayapraveenk885@gmail.com', '52412396524', '$2a$10$zCY8.0wB/wwtmhPmVBCzEefFmqCReCLBQ/AV.O9GY3yUBknZ1qhx.', 'Wayanad ', 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10215552371837946&height=200&width=200&ext=1792477366&hash=AfuZepmdPevcQ9e3z1CWvrW1', '2026-09-20 06:22:47', 0, '2026-09-20 16:20:54', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `app_download_page_settings`
--
ALTER TABLE `app_download_page_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_clicks`
--
ALTER TABLE `contact_clicks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_property` (`user_id`,`property_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `visitor_id` (`visitor_id`);

--
-- Indexes for table `landing_features`
--
ALTER TABLE `landing_features`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mobile_share_page_settings`
--
ALTER TABLE `mobile_share_page_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `property_media`
--
ALTER TABLE `property_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `property_reviews`
--
ALTER TABLE `property_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `property_views`
--
ALTER TABLE `property_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `reported_listings`
--
ALTER TABLE `reported_listings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`),
  ADD KEY `reporter_id` (`reporter_id`);

--
-- Indexes for table `role_switch_requests`
--
ALTER TABLE `role_switch_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `saved_properties`
--
ALTER TABLE `saved_properties`
  ADD PRIMARY KEY (`user_id`,`property_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `service_enquiries`
--
ALTER TABLE `service_enquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `social_accounts`
--
ALTER TABLE `social_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_provider_user` (`provider`,`provider_user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`role`,`duration_months`);

--
-- Indexes for table `top_locations`
--
ALTER TABLE `top_locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `app_download_page_settings`
--
ALTER TABLE `app_download_page_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_clicks`
--
ALTER TABLE `contact_clicks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `enquiries`
--
ALTER TABLE `enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `landing_features`
--
ALTER TABLE `landing_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mobile_share_page_settings`
--
ALTER TABLE `mobile_share_page_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `property_media`
--
ALTER TABLE `property_media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `property_reviews`
--
ALTER TABLE `property_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `property_views`
--
ALTER TABLE `property_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=235;

--
-- AUTO_INCREMENT for table `reported_listings`
--
ALTER TABLE `reported_listings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `role_switch_requests`
--
ALTER TABLE `role_switch_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `service_enquiries`
--
ALTER TABLE `service_enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `social_accounts`
--
ALTER TABLE `social_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `top_locations`
--
ALTER TABLE `top_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `contact_clicks`
--
ALTER TABLE `contact_clicks`
  ADD CONSTRAINT `contact_clicks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contact_clicks_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD CONSTRAINT `enquiries_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enquiries_ibfk_2` FOREIGN KEY (`visitor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `properties`
--
ALTER TABLE `properties`
  ADD CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_media`
--
ALTER TABLE `property_media`
  ADD CONSTRAINT `property_media_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_reviews`
--
ALTER TABLE `property_reviews`
  ADD CONSTRAINT `property_reviews_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `property_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `property_views`
--
ALTER TABLE `property_views`
  ADD CONSTRAINT `property_views_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reported_listings`
--
ALTER TABLE `reported_listings`
  ADD CONSTRAINT `reported_listings_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reported_listings_ibfk_2` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_switch_requests`
--
ALTER TABLE `role_switch_requests`
  ADD CONSTRAINT `role_switch_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_properties`
--
ALTER TABLE `saved_properties`
  ADD CONSTRAINT `saved_properties_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_properties_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `social_accounts`
--
ALTER TABLE `social_accounts`
  ADD CONSTRAINT `social_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
