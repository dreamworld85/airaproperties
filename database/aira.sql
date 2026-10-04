-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 02, 2026 at 08:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `realastate_sparrow`
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
(51, NULL, 'Role switch request approved for user ID #11. New Role: Broker', 'Users', '2026-09-25 14:05:40'),
(52, NULL, 'New Builder Partner inquiry received from Tata Value Homes Kerala (Karthik Nambiar)', 'System', '2026-10-02 08:22:39'),
(53, NULL, 'Admin disabled subscription plan: Builder Launchpad', 'System', '2026-10-02 13:03:29'),
(54, NULL, 'Admin enabled subscription plan: Builder Launchpad', 'System', '2026-10-02 13:03:34'),
(55, NULL, 'Admin enabled all Boss Builder subscription plans', 'System', '2026-10-02 13:03:42');

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
-- Table structure for table `builders`
--

CREATE TABLE `builders` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `tagline` varchar(255) DEFAULT '',
  `logo_url` varchar(500) DEFAULT '',
  `banner_url` varchar(500) DEFAULT '',
  `about` text DEFAULT NULL,
  `experience_years` int(11) DEFAULT 15,
  `total_projects` int(11) DEFAULT 20,
  `ongoing_projects` int(11) DEFAULT 5,
  `completed_projects` int(11) DEFAULT 15,
  `upcoming_projects` int(11) DEFAULT 3,
  `rera_id` varchar(100) DEFAULT '',
  `office_address` text DEFAULT NULL,
  `district` varchar(100) DEFAULT 'Kochi',
  `phone` varchar(50) DEFAULT '',
  `email` varchar(160) DEFAULT '',
  `website` varchar(255) DEFAULT '',
  `is_featured` tinyint(1) DEFAULT 1,
  `is_verified` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `builders`
--

INSERT INTO `builders` (`id`, `name`, `slug`, `tagline`, `logo_url`, `banner_url`, `about`, `experience_years`, `total_projects`, `ongoing_projects`, `completed_projects`, `upcoming_projects`, `rera_id`, `office_address`, `district`, `phone`, `email`, `website`, `is_featured`, `is_verified`, `created_at`, `updated_at`) VALUES
(1, 'Skyline Builders', 'skyline-builders', 'Crafting Iconic Living Landmarks Across Kerala Since 1989', 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=600&fit=crop', 'With over three decades of engineering excellence, Skyline Builders has redefined luxury urban living in Kerala. Having successfully delivered more than 150 landmarks across Kochi, Trivandrum, Kozhikode, and Kottayam, our commitment to architectural purity, green living standards, and punctual handovers makes us Kerala\'s most awarded real estate pioneer.', 35, 154, 8, 142, 4, 'K-RERA/PRJ/ERN/042/2021', 'Skyline House, Rajaji Road, Kochi, Kerala - 682035', 'Ernakulam', '+91 484 4077777', 'enquiries@skylinebuilders.com', 'https://www.skylinebuilders.com', 1, 1, '2026-10-02 08:14:54', '2026-10-02 08:14:54'),
(2, 'Asset Homes', 'asset-homes', 'The Responsible Builder — 100+ Delightful Communities Delivered', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&h=600&fit=crop', 'Asset Homes is an ISO 9001:2015 certified builder committed to sustainable development and client delight. Known for our 10-year free transit insurance and pioneering 25-point life care commitments, we build homes with love, intelligence, and environmental consciousness.', 18, 112, 6, 102, 4, 'K-RERA/PRJ/TRV/018/2022', 'Asset Tree, G-129, Panampilly Nagar, Kochi, Kerala - 682036', 'Ernakulam', '+91 484 6755555', 'sales@assethomes.in', 'https://www.assethomes.in', 1, 1, '2026-10-02 08:14:54', '2026-10-02 08:14:54'),
(3, 'Sobha Developers', 'sobha-developers', 'Passion at Work — Unmatched German Craftsmanship & Architectural Purity', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=600&fit=crop', 'Sobha is India\'s premier backward-integrated real estate developer with an unblemished record of quality and timely deliveries. With our own concrete, glazing, interior woodwork, and metal fabrication divisions, we deliver European finishing and structural durability that lasts generations.', 28, 170, 10, 152, 8, 'K-RERA/PRJ/TCR/005/2020', 'Sobha City, Puzhakkal Padam, Thrissur, Kerala - 680553', 'Thrissur', '+91 487 2388888', 'sales@sobha.com', 'https://www.sobha.com', 1, 1, '2026-10-02 08:14:54', '2026-10-02 08:14:54'),
(4, 'Tata Value Homes Kerala', 'tata-value-homes-kerala', 'Premier Real Estate Developers & Builders — Ernakulam', '', '', 'Tata Value Homes Kerala is a premier construction firm committed to high architectural standards, punctual delivery, and customer-first quality living.', 16, 8, 5, 15, 3, '', 'Tata Business Center, MG Road, Ernakulam', 'Ernakulam', '+91 98460 99887', 'karthik@tatavaluehomes.in', '', 1, 1, '2026-10-02 08:23:03', '2026-10-02 08:23:03');

-- --------------------------------------------------------

--
-- Table structure for table `builder_inquiries`
--

CREATE TABLE `builder_inquiries` (
  `id` int(11) NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `contact_person` varchar(120) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(160) NOT NULL,
  `office_address` text NOT NULL,
  `city_district` varchar(100) DEFAULT '',
  `active_projects` varchar(50) DEFAULT '1-2 Projects',
  `package_preference` varchar(100) DEFAULT 'Builder Standard',
  `experience_years` int(11) DEFAULT 0,
  `message` text DEFAULT NULL,
  `status` enum('Pending','Contacted','Approved','Rejected') DEFAULT 'Pending',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `builder_inquiries`
--

INSERT INTO `builder_inquiries` (`id`, `company_name`, `contact_person`, `phone`, `email`, `office_address`, `city_district`, `active_projects`, `package_preference`, `experience_years`, `message`, `status`, `admin_notes`, `created_at`, `updated_at`) VALUES
(1, 'Prestige Group Kerala', 'Rajeev Menon', '+91 98470 11223', 'rajeev@prestigegroup.in', 'Level 4, Prestige TMS Square, NH 47 Bypass, Edappally', 'Ernakulam', '6-10 Projects', 'Builder Elite Showcase', 22, 'We are launching 3 new residential towers along Marine Drive and Kakkanad. Interested in developer showcase and NRI buyer push campaigns.', 'Pending', NULL, '2026-10-02 08:14:54', '2026-10-02 08:14:54'),
(2, 'Muthoot Homez Private Limited', 'Anjali Varma', '+91 94471 88990', 'anjali@muthoothomez.com', 'Muthoot Chambers, Kurians Tower, Banerji Road', 'Ernakulam', '3-5 Projects', 'Builder Launchpad', 14, 'Looking to list our upcoming premium villa gated community in Aluva with 3D walk-through embeds.', 'Contacted', NULL, '2026-10-02 08:14:54', '2026-10-02 08:14:54'),
(3, 'Confident Group Kerala', 'Gireesh Kumar', '+91 97455 33445', 'gireesh@confident-group.com', 'Confident House, S.A. Road, Kadavanthra', 'Ernakulam', '10+ Projects', 'Builder Enterprise Conglomerate', 19, 'We wish to partner for exclusive homepage banners and microsite listings for our upcoming Kochi and Trivandrum high-rises.', 'Approved', NULL, '2026-10-02 08:14:54', '2026-10-02 08:14:54'),
(4, 'Tata Value Homes Kerala', 'Karthik Nambiar', '+91 98460 99887', 'karthik@tatavaluehomes.in', 'Tata Business Center, MG Road, Ernakulam', 'Ernakulam', '6-10 Projects', 'Builder Elite Showcase', 16, 'Ready to launch our upcoming coastal township project.', 'Approved', ' [Approved by Admin]', '2026-10-02 08:22:39', '2026-10-02 08:23:03');

-- --------------------------------------------------------

--
-- Table structure for table `builder_leads`
--

CREATE TABLE `builder_leads` (
  `id` int(11) NOT NULL,
  `builder_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(160) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `source` varchar(50) DEFAULT 'microsite',
  `status` enum('New','Contacted','Qualified','Closed') DEFAULT 'New',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `builder_leads`
--

INSERT INTO `builder_leads` (`id`, `builder_id`, `project_id`, `name`, `phone`, `email`, `message`, `source`, `status`, `created_at`) VALUES
(1, 1, 1, 'Gopakumar Nair', '+91 94470 55667', 'gopakumar@gmail.com', 'Interested in visiting Skyline Epic Waterfront on Sunday.', 'microsite', 'New', '2026-10-02 08:22:55');

-- --------------------------------------------------------

--
-- Table structure for table `builder_projects`
--

CREATE TABLE `builder_projects` (
  `id` int(11) NOT NULL,
  `builder_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `project_type` varchar(100) DEFAULT 'Luxury Apartments',
  `status` enum('Completed','Ongoing','Upcoming') NOT NULL DEFAULT 'Ongoing',
  `location` varchar(200) NOT NULL,
  `district` varchar(100) NOT NULL,
  `price_range` varchar(100) NOT NULL,
  `units_config` varchar(150) NOT NULL,
  `area_sqft_range` varchar(100) DEFAULT '1200 - 2400 sq.ft',
  `possession_date` varchar(100) DEFAULT 'Dec 2026',
  `cover_image` varchar(500) NOT NULL,
  `gallery_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery_images`)),
  `rera_reg_number` varchar(100) DEFAULT '',
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `brochure_url` varchar(500) DEFAULT '',
  `is_featured` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `builder_projects`
--

INSERT INTO `builder_projects` (`id`, `builder_id`, `title`, `project_type`, `status`, `location`, `district`, `price_range`, `units_config`, `area_sqft_range`, `possession_date`, `cover_image`, `gallery_images`, `rera_reg_number`, `amenities`, `brochure_url`, `is_featured`, `created_at`) VALUES
(1, 1, 'Skyline Epic Waterfront', 'Luxury Waterfront Apartments', 'Ongoing', 'Marine Drive', 'Ernakulam', '₹1.85 Cr - ₹3.40 Cr', '3 & 4 BHK Panoramic Sky Suites', '2150 - 3800 sq.ft', 'December 2026', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&fit=crop', '[]', 'K-RERA/PRJ/089/2023', '[\"Infinity Pool overlooking Arabian Sea\", \"Rooftop Helipad & Sky Lounge\", \"Automated Smart Home Controls\", \"Clubhouse & Squash Court\", \"EV Superchargers\"]', '', 1, '2026-10-02 08:14:54'),
(2, 1, 'Skyline Cambridge Greens', 'Smart Urban Residences', 'Ongoing', 'Edappally Metro Station', 'Ernakulam', '₹78 Lakhs - ₹1.25 Cr', '2 & 3 BHK Contemporary Homes', '1180 - 1760 sq.ft', 'August 2027', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&fit=crop', '[]', 'K-RERA/PRJ/112/2023', '[\"Heated Indoor Swimming Pool\", \"Solar Powered Common Areas\", \"Children Play Arena\", \"Fitness Centre & Yoga Deck\"]', '', 1, '2026-10-02 08:14:54'),
(3, 1, 'Skyline Green Woods Estate', 'Exclusive Nature Villas', 'Upcoming', 'Kakkanad Infopark Corridor', 'Ernakulam', '₹1.45 Cr - ₹2.80 Cr', '3 & 4 BHK Independent Luxury Villas', '2400 - 3600 sq.ft', 'Booking Open (2028)', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&fit=crop', '[]', 'K-RERA/PRJ/144/2024', '[\"Private Landscaped Gardens\", \"Gated 24/7 Security\", \"Central Clubhouse\", \"Rainwater Harvesting\", \"Tennis Court\"]', '', 1, '2026-10-02 08:14:54'),
(4, 1, 'Skyline 24 Carat', 'Ultra Luxury Ready Residences', 'Completed', 'Panampilly Nagar', 'Ernakulam', '₹1.35 Cr - ₹2.10 Cr', '3 BHK Ready To Move Living', '1920 - 2450 sq.ft', 'Ready to Move (Occupancy Certified)', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&fit=crop', '[]', 'K-RERA/PRJ/015/2020', '[\"Occupancy Certificate Issued\", \"Immediate Registry\", \"Full Generator Backup\", \"Double Height Grand Lobby\"]', '', 1, '2026-10-02 08:14:54'),
(5, 2, 'Asset Signature Tech Smart', 'Modern Tech Residences', 'Ongoing', 'Kazhakoottam Technopark', 'Thiruvananthapuram', '₹65 Lakhs - ₹1.10 Cr', '2 & 3 BHK Tech-Savvy Apartments', '1050 - 1650 sq.ft', 'June 2027', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&fit=crop', '[]', 'K-RERA/PRJ/TRV/076/2023', '[\"Walk-to-Work Proximity\", \"Coworking Lounge with Hi-Speed Fiber\", \"Rooftop Swimming Pool\", \"EV Charging Station\"]', '', 1, '2026-10-02 08:14:54'),
(6, 2, 'Asset Marina Bay Sky Suites', 'Sea-facing Sky Villas', 'Upcoming', 'Calicut Beachfront', 'Kozhikode', '₹1.60 Cr - ₹2.95 Cr', '3 & 4 BHK Panoramic Sea-facing Homes', '2200 - 3400 sq.ft', 'Pre-Launch Booking', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&fit=crop', '[]', 'K-RERA/PRJ/KKD/033/2024', '[\"180 Degree Arabian Sea Views\", \"Private Jacuzzi in Balconies\", \"State-of-the-Art Wellness Spa\"]', '', 1, '2026-10-02 08:14:54'),
(7, 2, 'Asset Zenith High-Rise', 'Premium Finished Living', 'Completed', 'Vyttila Mobility Hub', 'Ernakulam', '₹95 Lakhs - ₹1.50 Cr', '3 BHK Ready To Occupy', '1580 - 2100 sq.ft', 'Ready to Move', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&fit=crop', '[]', 'K-RERA/PRJ/ERN/012/2019', '[\"Multi-level Car Parking\", \"Grand Banquet Hall\", \"24/7 Power Back-up\"]', '', 1, '2026-10-02 08:14:54'),
(8, 3, 'Sobha Silverstar Residency', 'Integrated Luxury Living', 'Ongoing', 'Puzhakkal Sobha City', 'Thrissur', '₹85 Lakhs - ₹1.95 Cr', '2, 3 & 4 BHK German Standard Residences', '1350 - 2800 sq.ft', 'October 2026', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&fit=crop', '[]', 'K-RERA/PRJ/TCR/041/2022', '[\"55-Acre Gated Integrated Township\", \"Private 6.5 Acre Artificial Lake\", \"Olympic Size Swimming Pool\", \"Commercial Mall On-premises\"]', '', 1, '2026-10-02 08:14:54'),
(9, 3, 'Sobha City Topaz', 'Township Luxury Apartments', 'Completed', 'Puzhakkal', 'Thrissur', '₹1.10 Cr - ₹2.25 Cr', '3 & 4 BHK Ready Luxury Homes', '1800 - 3100 sq.ft', 'Ready to Move', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&fit=crop', '[]', 'K-RERA/PRJ/TCR/008/2019', '[\"Clubhouse with Squash & Badminton\", \"Central Landscaped Promenades\", \"24/7 Security & CCTV Surveillance\"]', '', 1, '2026-10-02 08:14:54'),
(10, 3, 'Sobha Riverfront Meadows', 'Exclusive River-edge Gated Villas', 'Upcoming', 'Aluva Riverbanks', 'Ernakulam', '₹2.20 Cr - ₹4.50 Cr', '4 & 5 BHK Bespoke Riverfront Mansions', '3200 - 5200 sq.ft', 'Launching Early 2027', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&fit=crop', '[]', 'K-RERA/PRJ/ERN/098/2024', '[\"Direct Periyar River Access & Private Boating Jetty\", \"Private Plunge Pools\", \"Solar-powered Eco-residences\"]', '', 1, '2026-10-02 08:14:54');

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
(3, 15, 16, '2026-09-14 07:46:40'),
(4, 24, 29, '2026-09-26 15:31:15'),
(5, 25, 29, '2026-09-26 15:32:34'),
(6, 26, 29, '2026-09-26 15:35:49'),
(7, 27, 29, '2026-09-26 15:36:10');

-- --------------------------------------------------------

--
-- Table structure for table `credit_transactions`
--

CREATE TABLE `credit_transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `credit_type` enum('enquiry','listing_slot') NOT NULL,
  `transaction_type` enum('purchase','usage','refund','bonus','admin_adjustment') NOT NULL,
  `amount_credits` int(11) NOT NULL,
  `balance_after` int(11) NOT NULL,
  `price_paid` decimal(10,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'INR',
  `payment_id` varchar(255) DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `property_id` int(11) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `credit_transactions`
--

INSERT INTO `credit_transactions` (`id`, `user_id`, `credit_type`, `transaction_type`, `amount_credits`, `balance_after`, `price_paid`, `currency`, `payment_id`, `order_id`, `property_id`, `notes`, `created_at`) VALUES
(1, 23, 'enquiry', 'bonus', 3, 3, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free enquiry tokens', '2026-09-26 15:29:42'),
(2, 23, 'listing_slot', 'bonus', 2, 2, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free listing slots', '2026-09-26 15:29:42'),
(3, 24, 'enquiry', 'bonus', 3, 3, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free enquiry tokens', '2026-09-26 15:31:14'),
(4, 24, 'listing_slot', 'bonus', 2, 2, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free listing slots', '2026-09-26 15:31:14'),
(5, 24, 'enquiry', 'usage', -1, 2, 0.00, 'INR', NULL, NULL, 29, 'Unlocked contact details for property #29', '2026-09-26 15:31:15'),
(6, 24, 'listing_slot', 'usage', -1, 1, 0.00, 'INR', NULL, NULL, 30, 'Slot consumed for new property listing #30', '2026-09-26 15:31:15'),
(7, 25, 'enquiry', 'bonus', 3, 3, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free enquiry tokens', '2026-09-26 15:32:34'),
(8, 25, 'listing_slot', 'bonus', 2, 2, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free listing slots', '2026-09-26 15:32:34'),
(9, 25, 'enquiry', 'usage', -1, 2, 0.00, 'INR', NULL, NULL, 29, 'Unlocked contact details for property #29', '2026-09-26 15:32:34'),
(10, 25, 'listing_slot', 'usage', -1, 1, 0.00, 'INR', NULL, NULL, 31, 'Slot consumed for new property listing #31', '2026-09-26 15:32:34'),
(11, 26, 'enquiry', 'bonus', 3, 3, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free enquiry tokens', '2026-09-26 15:35:49'),
(12, 26, 'listing_slot', 'bonus', 2, 2, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free listing slots', '2026-09-26 15:35:49'),
(13, 26, 'enquiry', 'usage', -1, 2, 0.00, 'INR', NULL, NULL, 29, 'Unlocked contact details for property #29', '2026-09-26 15:35:49'),
(14, 26, 'listing_slot', 'usage', -1, 1, 0.00, 'INR', NULL, NULL, 32, 'Slot consumed for new property listing #32', '2026-09-26 15:35:49'),
(15, 26, 'listing_slot', 'refund', 1, 2, 0.00, 'INR', NULL, NULL, 32, 'Slot returned: marked property #32 as Sold', '2026-09-26 15:35:49'),
(16, 26, 'listing_slot', 'usage', -1, 1, 0.00, 'INR', NULL, NULL, 32, 'Slot consumed: activated property #32', '2026-09-26 15:35:49'),
(17, 26, 'listing_slot', 'refund', 1, 2, 0.00, 'INR', NULL, NULL, 32, 'Slot returned: marked property #32 as Inactive', '2026-09-26 15:35:49'),
(18, 26, 'listing_slot', 'usage', -1, 1, 0.00, 'INR', NULL, NULL, 32, 'Slot consumed: activated property #32', '2026-09-26 15:35:49'),
(19, 26, 'listing_slot', 'refund', 1, 2, 0.00, 'INR', NULL, NULL, 32, 'Slot returned: active property #32 deleted', '2026-09-26 15:35:49'),
(20, 27, 'enquiry', 'bonus', 3, 3, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free enquiry tokens', '2026-09-26 15:36:09'),
(21, 27, 'listing_slot', 'bonus', 2, 2, 0.00, 'INR', NULL, NULL, NULL, 'Welcome free listing slots', '2026-09-26 15:36:09'),
(22, 27, 'enquiry', 'usage', -1, 2, 0.00, 'INR', NULL, NULL, 29, 'Unlocked contact details for property #29', '2026-09-26 15:36:10'),
(23, 27, 'listing_slot', 'usage', -1, 1, 0.00, 'INR', NULL, NULL, 33, 'Slot consumed for new property listing #33', '2026-09-26 15:36:10'),
(24, 27, 'listing_slot', 'refund', 1, 2, 0.00, 'INR', NULL, NULL, 33, 'Slot returned: marked property #33 as Sold', '2026-09-26 15:36:10'),
(25, 27, 'listing_slot', 'usage', -1, 1, 0.00, 'INR', NULL, NULL, 33, 'Slot consumed: activated property #33', '2026-09-26 15:36:10'),
(26, 27, 'listing_slot', 'refund', 1, 2, 0.00, 'INR', NULL, NULL, 33, 'Slot returned: marked property #33 as Inactive', '2026-09-26 15:36:10'),
(27, 27, 'listing_slot', 'usage', -1, 1, 0.00, 'INR', NULL, NULL, 33, 'Slot consumed: activated property #33', '2026-09-26 15:36:10'),
(28, 27, 'listing_slot', 'refund', 1, 2, 0.00, 'INR', NULL, NULL, 33, 'Slot returned: active property #33 deleted', '2026-09-26 15:36:10');

-- --------------------------------------------------------

--
-- Table structure for table `enquiries`
--

CREATE TABLE `enquiries` (
  `id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `visitor_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `message` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enquiries`
--

INSERT INTO `enquiries` (`id`, `property_id`, `visitor_id`, `name`, `phone`, `email`, `message`, `created_at`) VALUES
(2, 19, 15, NULL, NULL, NULL, 'Clicked WhatsApp contact button', '2026-09-14 07:25:06'),
(3, 19, 15, NULL, NULL, NULL, 'Clicked WhatsApp contact button', '2026-09-14 07:25:06'),
(4, 16, 15, NULL, NULL, NULL, 'Clicked WhatsApp contact button', '2026-09-14 07:46:40'),
(5, 16, 15, NULL, NULL, NULL, 'Clicked Call contact button', '2026-09-14 07:46:52'),
(6, 16, 15, 'Anjana RAJ', '9946470404', 'anjanaraj1243@gmail.com', 'Hi, I am interested in Plot / Land in Wayanad. Please contact me with more details.', '2026-09-28 10:28:11');

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
(11, 10, 'House in Wayanad', 'House', 'For Sale', 6500000.00, 1500, 'panamram', 'Wayanad', 4, 3, 'Fully Furnished', 'East', '1-5 Years', NULL, 'Owner', 'Active', 24, '2026-08-24 13:40:06', '2026-09-29 07:11:30', '+919633221234', '+919633221234', 'anumol', NULL, NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(12, 10, 'Apartment in Kozhikode', 'Apartment', 'For Sale', 5000000.00, 1500, 'Panamaram', 'Kozhikode', 4, 2, 'Fully Furnished', 'East', '1-5 Years', NULL, 'Owner', 'Active', 33, '2026-08-24 13:49:34', '2026-10-01 14:25:17', '+919633221234', '+919633221234', 'anumol', NULL, NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(14, 1, 'Independent House / Villa in Wayanad', 'Independent House / Villa', 'For Sale', 6500000.00, 1536, 'Balussery , Kozhikode', 'Wayanad', 3, 3, NULL, NULL, NULL, NULL, 'Owner', 'Active', 17, '2026-08-29 14:33:23', '2026-09-14 10:59:08', '9946470404', '9946470404', 'Anjana RAJ', NULL, NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(16, 1, 'Plot / Land in Wayanad', 'Plot / Land', 'For Sale', 60000000.00, 2178000, 'Eachome', 'Wayanad', 3, 0, NULL, NULL, NULL, NULL, 'Owner', 'Active', 12, '2026-08-29 18:57:03', '2026-09-21 16:39:43', '9946470404', '9946470404', 'Anjana RAJ', NULL, NULL, NULL, NULL, 0, 1, 0, 0, 11.74099229, 76.07154066, 'Kerala'),
(19, 1, 'Independent House / Villa in Kozhikode', 'Independent House / Villa', 'For Sale', 8000000.00, 1500, 'Mukkam', 'Kozhikode', 5, 3, NULL, NULL, NULL, NULL, 'Broker', 'Active', 5, '2026-09-07 19:14:11', '2026-09-14 07:18:29', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, 11.32153875, 75.99546077, 'Kerala'),
(20, 1, 'Plot / Land in Kozhikode', 'Plot / Land', 'For Sale', 6500000.00, 87120, 'Thiruvambadi , mukkam', 'Kozhikode', 0, 0, NULL, NULL, NULL, NULL, 'Broker', 'Active', 0, '2026-09-15 03:58:46', '2026-09-15 03:58:47', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(21, 1, 'Independent House / Villa in Chennai', 'Independent House / Villa', 'For Sale', 6000580.00, 2000, 'Royapuram', 'Chennai', 4, 3, NULL, NULL, NULL, NULL, 'Broker', 'Active', 6, '2026-09-15 09:02:40', '2026-09-21 16:35:13', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Tamil Nadu'),
(22, 1, 'Apartment in Ballari', 'Apartment', 'For Rent', 15000.00, 1600, 'Siruguppa ', 'Ballari', 4, 3, NULL, NULL, NULL, NULL, 'Broker', 'Active', 38, '2026-09-15 09:09:12', '2026-10-01 13:16:43', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Karnataka'),
(23, 1, 'Plot / Land in South Goa', 'Plot / Land', 'For Sale', 1500000.00, 10890, 'Panaji', 'South Goa', 0, 0, NULL, NULL, NULL, NULL, 'Broker', 'Active', 2, '2026-09-15 09:18:22', '2026-09-25 13:02:17', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Goa'),
(28, 1, 'Plot / Land in Kozhikode', 'Plot / Land', 'For Sale', 2500000.00, 43560, 'Mukkam', 'Kozhikode', 0, 0, NULL, NULL, NULL, NULL, 'Broker', 'Active', 9, '2026-09-21 12:11:57', '2026-10-02 13:13:19', '9946470404', '9946470404', NULL, 'Anjana RAJ', NULL, NULL, NULL, 0, 1, 0, 0, NULL, NULL, 'Kerala'),
(29, 11, 'Plot / Land in Wayanad', 'Plot / Land', 'For Sale', 6000000.00, 108900, 'Mylambadi , Meenangadi', 'Wayanad', 5, 4, NULL, NULL, NULL, NULL, 'Owner', 'Active', 11, '2026-09-24 16:20:32', '2026-10-01 08:56:02', '+919961466736', '+919961466736', 'Aswanth', NULL, NULL, NULL, NULL, 0, 1, 0, 0, 11.68188339, 76.18333989, 'Kerala'),
(30, 24, 'Automated Credit Test Villa', 'House', '', 7500000.00, 2400, 'Kalpetta Bypass Road', 'Wayanad', 0, 0, NULL, NULL, NULL, NULL, 'Owner', 'Pending', 0, '2026-09-26 15:31:15', '2026-09-26 15:31:15', '+919876543210', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, 'Kerala'),
(31, 25, 'Automated Credit Test Villa', 'House', '', 7500000.00, 2400, 'Kalpetta Bypass Road', 'Wayanad', 0, 0, NULL, NULL, NULL, NULL, 'Owner', '', 1, '2026-09-26 15:32:34', '2026-09-26 17:15:40', '+919876543210', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, 'Kerala');

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
(234, 29, 10, '2026-09-25 14:16:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(235, 31, 1, '2026-09-26 17:15:40', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(236, 12, 1, '2026-09-26 17:16:36', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'),
(237, 11, 1, '2026-09-28 07:34:00', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(238, 11, 1, '2026-09-28 08:35:04', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(239, 11, NULL, '2026-09-28 08:37:29', '::1', 'curl/8.21.0'),
(240, 11, NULL, '2026-09-28 09:51:30', '::1', 'curl/8.21.0'),
(241, 11, NULL, '2026-09-29 07:11:30', '::1', 'curl/8.21.0'),
(242, 29, 1, '2026-09-29 07:13:55', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:156.0) Gecko/20100101 Firefox/156.0'),
(243, 29, NULL, '2026-10-01 07:36:11', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(244, 29, NULL, '2026-10-01 08:04:37', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444'),
(245, 29, NULL, '2026-10-01 08:56:02', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(246, 22, NULL, '2026-10-01 11:37:51', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(247, 22, NULL, '2026-10-01 11:39:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(248, 22, NULL, '2026-10-01 11:40:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(249, 22, NULL, '2026-10-01 11:41:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(250, 22, NULL, '2026-10-01 11:42:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(251, 22, NULL, '2026-10-01 11:43:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(252, 22, NULL, '2026-10-01 11:43:28', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(253, 22, NULL, '2026-10-01 11:43:38', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(254, 22, NULL, '2026-10-01 11:43:48', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(255, 22, NULL, '2026-10-01 11:43:58', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(256, 22, NULL, '2026-10-01 11:44:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(257, 22, NULL, '2026-10-01 11:44:28', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(258, 22, NULL, '2026-10-01 11:45:08', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(259, 22, NULL, '2026-10-01 11:46:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(260, 22, NULL, '2026-10-01 11:47:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(261, 22, NULL, '2026-10-01 11:48:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(262, 22, NULL, '2026-10-01 11:49:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(263, 22, NULL, '2026-10-01 11:50:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(264, 22, NULL, '2026-10-01 11:51:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(265, 22, NULL, '2026-10-01 11:52:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(266, 22, NULL, '2026-10-01 11:53:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(267, 22, NULL, '2026-10-01 11:54:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(268, 22, NULL, '2026-10-01 11:55:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(269, 22, NULL, '2026-10-01 11:56:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(270, 22, NULL, '2026-10-01 11:57:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(271, 22, NULL, '2026-10-01 11:58:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(272, 22, NULL, '2026-10-01 11:59:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(273, 22, NULL, '2026-10-01 12:00:15', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(274, 22, NULL, '2026-10-01 12:01:17', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(275, 22, NULL, '2026-10-01 12:28:21', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(276, 22, NULL, '2026-10-01 12:29:19', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(277, 22, NULL, '2026-10-01 13:16:43', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(278, 12, NULL, '2026-10-01 13:29:40', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(279, 12, NULL, '2026-10-01 14:24:19', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(280, 12, NULL, '2026-10-01 14:25:17', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444'),
(281, 28, NULL, '2026-10-02 13:13:19', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36');

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
('desktop_logo_url', '/uploads/1790934429376-5529631.png'),
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
('mobile_logo_url', '/uploads/1790947987334-195725194.png'),
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
  `id` int(11) NOT NULL,
  `role` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` varchar(255) DEFAULT '',
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `duration_months` int(11) NOT NULL DEFAULT 1,
  `features` text DEFAULT NULL,
  `plan_type` varchar(50) NOT NULL DEFAULT 'combo',
  `credits` int(11) NOT NULL DEFAULT 10,
  `listing_slots` int(11) NOT NULL DEFAULT 0,
  `enquiry_tokens` int(11) NOT NULL DEFAULT 0,
  `plan_id` varchar(60) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `role`, `price`, `updated_at`, `description`, `discount`, `duration_months`, `features`, `plan_type`, `credits`, `listing_slots`, `enquiry_tokens`, `plan_id`, `name`, `is_active`) VALUES
(197, 'user', 199.00, '2026-10-02 08:14:54', '10 Enquiry Tokens + 2 Active Listing Slots. Never expires!', 0.00, 0, '[\"10 Direct Owner/Broker Contact Unlocks\",\"2 Active Concurrent Listing Slots\",\"WhatsApp Direct Chat Shortcuts\",\"Permanent Access to Unlocked Listings\",\"100% Reusable Slots (credited back when Sold/Inactive)\",\"Zero Expiry — Tokens & slots valid forever\"]', 'combo', 10, 2, 10, 'user_starter_pack', 'Starter Pack', 1),
(198, 'user', 399.00, '2026-10-02 08:14:54', '25 Enquiry Tokens + 5 Active Listing Slots. Most popular choice!', 50.00, 0, '[\"25 Direct Owner/Broker Contact Unlocks\",\"5 Active Concurrent Listing Slots\",\"WhatsApp Direct Chat Shortcuts\",\"Permanent Access to Unlocked Listings\",\"100% Reusable Slots (credited back when Sold/Inactive)\",\"Zero Expiry — Valid forever until used\",\"Save ₹50 with package discount\"]', 'combo', 25, 5, 25, 'user_standard_pack', 'Standard Pack', 1),
(199, 'user', 799.00, '2026-10-02 08:14:54', '60 Enquiry Tokens + 10 Active Listing Slots. Best value for active seekers & investors.', 150.00, 0, '[\"60 Direct Owner/Broker Contact Unlocks\",\"10 Active Concurrent Listing Slots\",\"WhatsApp Direct Chat Shortcuts\",\"Permanent Access to Unlocked Listings\",\"100% Reusable Slots (credited back when Sold/Inactive)\",\"Zero Expiry — Valid forever until used\",\"Priority Customer Support Assistance\",\"Save ₹150 with our biggest discount\"]', 'combo', 60, 10, 60, 'user_premium_pack', 'Premium Pack', 1),
(200, 'owner', 499.00, '2026-10-02 08:14:54', '5 Active Listing Slots + 15 Enquiry Tokens. Ideal for individual owners.', 0.00, 0, '[\"5 Active Concurrent Listing Slots\",\"15 Direct Contact Unlock Tokens\",\"100% Reusable Slots (credited back when Sold or Inactive)\",\"Direct Owner Phone & WhatsApp Leads\",\"Zero Expiry — Valid forever until used\"]', 'combo', 5, 5, 15, 'owner_starter_pack', 'Owner Starter', 1),
(201, 'owner', 899.00, '2026-10-02 08:14:54', '10 Active Listing Slots + 30 Enquiry Tokens. For owners with multiple properties.', 100.00, 0, '[\"10 Active Concurrent Listing Slots\",\"30 Direct Contact Unlock Tokens\",\"100% Reusable Slots (credited back when Sold or Inactive)\",\"Direct Owner Phone & WhatsApp Leads\",\"Priority Search Listing Visibility\",\"Save ₹100 with package discount\"]', 'combo', 10, 10, 30, 'owner_growth_pack', 'Owner Growth', 1),
(202, 'owner', 1699.00, '2026-10-02 08:14:54', '25 Active Listing Slots + 60 Enquiry Tokens. Complete portfolio coverage.', 200.00, 0, '[\"25 Active Concurrent Listing Slots\",\"60 Direct Contact Unlock Tokens\",\"100% Reusable Slots (credited back when Sold or Inactive)\",\"Direct Owner Phone & WhatsApp Leads\",\"Priority Search Placement Across Feed\",\"Save ₹200 with best portfolio discount\"]', 'combo', 25, 25, 60, 'owner_portfolio_pack', 'Owner Portfolio', 1),
(203, 'broker', 899.00, '2026-10-02 08:14:54', '10 Active Listing Slots + 35 Enquiry Tokens. Essential broker toolkit.', 50.00, 0, '[\"10 Active Concurrent Listing Slots\",\"35 Direct Client Phone Unlock Tokens\",\"100% Reusable Slots (credited back when Sold or Inactive)\",\"Direct Broker Contact & WhatsApp Leads\",\"Verified Broker Badge on Listings\",\"Zero Expiration on Slots & Tokens\"]', 'combo', 10, 10, 35, 'broker_standard_pack', 'Broker Standard', 1),
(204, 'broker', 1699.00, '2026-10-02 08:14:54', '25 Active Listing Slots + 80 Enquiry Tokens. High-volume broker deals.', 150.00, 0, '[\"25 Active Concurrent Listing Slots\",\"80 Direct Client Phone Unlock Tokens\",\"100% Reusable Slots (credited back when Sold or Inactive)\",\"Direct Broker Contact & WhatsApp Leads\",\"Priority Listing Placement in Search\",\"Save ₹150 with volume savings\"]', 'combo', 25, 25, 80, 'broker_pro_pack', 'Broker Pro', 1),
(205, 'broker', 2899.00, '2026-10-02 08:14:54', '50 Active Listing Slots + 150 Enquiry Tokens. Maximum power for independent brokers.', 300.00, 0, '[\"50 Active Concurrent Listing Slots\",\"150 Direct Client Phone Unlock Tokens\",\"100% Reusable Slots (credited back when Sold or Inactive)\",\"Direct Broker Contact & WhatsApp Leads\",\"Priority Search Ranking & Top Feeds\",\"Save ₹300 with enterprise discount\"]', 'combo', 50, 50, 150, 'broker_enterprise_pack', 'Broker Enterprise', 1),
(206, 'agency', 2499.00, '2026-10-02 08:14:54', '25 Active Listing Slots + 100 Enquiry Tokens. Full agency brand exposure.', 200.00, 0, '[\"25 Active Concurrent Listing Slots\",\"100 Direct Client Phone Unlock Tokens\",\"100% Reusable Slots (credited back when Sold or Inactive)\",\"Agency Corporate Branding & Logo on Listings\",\"Dedicated Agency Profile Page\",\"Zero Expiration on Slots & Tokens\"]', 'combo', 25, 25, 100, 'agency_corporate_pack', 'Agency Corporate', 1),
(207, 'agency', 4499.00, '2026-10-02 08:14:54', '50 Active Listing Slots + 250 Enquiry Tokens. For mid-sized real estate firms.', 400.00, 0, '[\"50 Active Concurrent Listing Slots\",\"250 Direct Client Phone Unlock Tokens\",\"100% Reusable Slots (credited back when Sold or Inactive)\",\"Agency Corporate Branding & Logo on Listings\",\"Dedicated Agency Profile Page\",\"Priority Search Placement Across Kerala\",\"Save ₹400 with business package\"]', 'combo', 50, 50, 250, 'agency_business_pack', 'Agency Business', 1),
(208, 'agency', 7499.00, '2026-10-02 08:14:54', '100 Active Listing Slots + 500 Enquiry Tokens. Complete market domination package.', 700.00, 0, '[\"100 Active Concurrent Listing Slots\",\"500 Direct Client Phone Unlock Tokens\",\"100% Reusable Slots (credited back when Sold or Inactive)\",\"Agency Corporate Branding & Logo on Listings\",\"Dedicated Agency Profile Page\",\"Highest Priority Search Placement Across Kerala\",\"VIP Account Manager Support\",\"Save ₹700 with dominator package\"]', 'combo', 100, 100, 500, 'agency_dominator_pack', 'Agency Dominator', 1),
(209, 'builder', 9999.00, '2026-10-02 13:03:34', '10 Project Units + 150 High-Intent Buyer Leads. Ideal for boutique builders.', 1000.00, 12, '[\"Up to 10 Active Project Units / Layouts\",\"150 Verified High-Intent Buyer Leads\",\"Dedicated Builder Microsite Page\",\"Direct Inquiries to Builder WhatsApp & Email\",\"RERA Verification Badge on Projects\",\"Brochure Download & Floor Plan Showcase\",\"1 Year Validity with Dedicated Support\"]', 'combo', 5, 10, 150, 'builder_launchpad', 'Builder Launchpad', 1),
(210, 'builder', 24999.00, '2026-10-02 08:14:54', '25 Project Units + 400 Buyer Leads + Featured Developer Spotlight across Kerala.', 3000.00, 12, '[\"Up to 25 Active Project Units / Towers\",\"400 Verified High-Intent Buyer Leads\",\"Prominent Developer Spotlight on Homepage & Search\",\"Custom Branded Builder Microsite with Video Walkthroughs\",\"Direct Lead Capture CRM Integration\",\"Priority Search Ranking Across Kerala\",\"Quarterly Investor Email & Push Notification Spotlight\",\"Dedicated Key Account Manager\"]', 'combo', 15, 25, 400, 'builder_elite', 'Builder Elite Showcase', 1),
(211, 'builder', 49999.00, '2026-10-02 08:14:54', '100 Units + 1,200 High-Intent Leads + Full Platform Domination & Exclusive Banners.', 5000.00, 12, '[\"100 Active Units Across Multiple Ongoing Projects\",\"1,200 Verified High-Intent Buyer Leads\",\"Permanent Top-Tier Developer Banner Placement\",\"Exclusive Full-Featured Microsite with Custom Domain Options\",\"Unlimited Floor Plan & 3D Walkthrough Embeds\",\"High-Priority NRI Investor Blast Campaigns\",\"Zero Expiration on Unused Lead Tokens\",\"24/7 VIP Executive Relationship Manager\"]', 'combo', 50, 100, 1200, 'builder_enterprise', 'Builder Enterprise Conglomerate', 1);

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
  `whatsapp_number` varchar(50) DEFAULT NULL,
  `enquiry_credits_left` int(11) NOT NULL DEFAULT 3,
  `listing_slots_left` int(11) NOT NULL DEFAULT 2
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `location`, `avatar_url`, `created_at`, `is_disabled`, `last_login`, `reset_otp`, `reset_otp_expires_at`, `role`, `trial_ends_at`, `subscription_status`, `razorpay_subscription_id`, `custom_trial_expiry`, `is_free_subscription_granted`, `subscription_expires_at`, `subscription_duration_months`, `agency_address`, `agency_district`, `agency_logo_url`, `whatsapp_number`, `enquiry_credits_left`, `listing_slots_left`) VALUES
(1, 'Anjana RAJ', 'anjanaraj1243@gmail.com', '9946470404', '$2a$10$mgvEG.vGaDI2SKwV5hDxd..SwKF6luyCWm6IMZLTw2krsRzeAVLBa', 'Wayanad', 'https://api.dicebear.com/7.x/avataaars/svg?seed=anjanaraj1243%40gmail.com', '2026-07-15 19:03:13', 0, '2026-09-24 16:01:24', NULL, NULL, 'broker', '2026-07-20 19:03:13', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, '9946470404', 3, 2),
(10, 'Anumol', 'anumol@gmail.com', '+919633221234', '$2a$10$nYf3T7ynih98gNvLYAyVE.MtH2B92H/44YX2hn3be1Y6lTKI39O9y', '', NULL, '2026-08-24 11:16:29', 0, '2026-09-25 14:09:11', NULL, NULL, 'owner', '2026-08-29 11:16:29', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, '+919633221234', 3, 2),
(11, 'Aswanth', 'aswanth@gmail.com', '+919961466736', '$2a$10$6hSsOguTBOBuEF9NdOZT4OUAuwRp7yVZNQHC03BhUMjcCCzk5HOC6', NULL, '/uploads/1789999473658-255157213.png', '2026-08-24 14:04:29', 0, '2026-09-24 16:14:06', NULL, NULL, 'broker', '2026-09-30 14:05:40', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '+919961466736', 3, 2),
(14, 'jai', 'jai4isign@gmail.com', '+917760403244', '$2a$10$56dH70J8ZdDvK1HtjNynBeldr5gU7hEFyZhiXZ0SucVRf64eCLknq', 'Wayanad ', 'https://lh3.googleusercontent.com/a/ACg8ocL1GhjegZ3I5RLZNEXsqax4mlbU8-rmieBNwAzdKM5MAISK7J8=s96-c', '2026-09-07 11:33:25', 0, '2026-09-20 16:07:13', NULL, NULL, 'owner', '2026-09-25 13:21:27', NULL, NULL, '2026-09-30 00:00:00', 1, NULL, NULL, NULL, NULL, NULL, '+917760403244', 3, 2),
(15, 'Jai', 'jayapraveenk85@gmail.com', '7760403244', '$2a$10$EeFH0XMaaEPP.364124xJ.BG/3cJKDmWqYZhsEDaDwUR.O/o3CgMa', '', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jayapraveenk85%40gmail.com', '2026-09-07 12:51:08', 0, '2026-09-21 16:40:32', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2),
(16, 'Jai', 'jai@gmail.com', NULL, '$2a$10$MzsL2OAwMZ.SCsDT3qQSr.emDjV8oObQwbTAOdUQMUGlpcclkhJ.i', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=jai%40gmail.com', '2026-09-12 07:49:28', 0, '2026-09-12 07:49:28', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2),
(17, 'Green Sparrows', 'greensparrows85@gmail.com', '', '$2a$10$26igUGIfEiFkDQ1lrYT5WOge3aUuIP/ECK3ueD5OLcntlt.pXQykS', '', 'https://api.dicebear.com/7.x/avataaars/svg?seed=greensparrows85%40gmail.com', '2026-09-12 16:29:59', 0, '2026-09-12 16:29:59', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2),
(18, 'jayaraj B', 'jai4dhangout@gmail.com', '9495126132', '$2a$10$hJC0oo1rUkGxqe5xNtfTtOO4cXMzUUNHuVkNfh0YP.aoRuf96BMBO', '', 'https://lh3.googleusercontent.com/a/ACg8ocICgLihqjYX8m3kBQxvBweUS_-k3CZT2ng3N0teTUzjBhfB41qx=s96-c', '2026-09-12 21:21:16', 0, '2026-09-23 18:26:24', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2),
(19, 'Ambili Raj', 'ambiliraj26@gmail.com', '+919633981112', '$2a$10$Koo/Wz6JlvpPcCR2t/AaBuN94uFZKeZSZJYmfMLYEIDRSyYXY2k16', '', '/uploads/1789471331717-758504401.jpeg', '2026-09-15 09:23:44', 0, '2026-09-15 09:23:44', NULL, NULL, 'user', NULL, NULL, NULL, '2026-09-25 00:00:00', 1, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2),
(20, 'Sam Hill', 'sam@gmail.com', '+919495126132', '$2a$10$nW3EOPtI4R9Cxh4zor3zKuVKz89XR5h97VDYrGBoCyUIAlfMb8XzW', 'Wayanad ', '/uploads/1789559363200-134423496.jpg', '2026-09-16 11:26:49', 0, '2026-09-16 11:29:43', NULL, NULL, 'owner', '2026-09-21 11:27:24', NULL, NULL, '2026-09-23 00:00:00', 1, NULL, NULL, NULL, NULL, NULL, '+919495126132', 3, 2),
(21, 'Samsom', 'samm@gmail.com', '+916993452', '$2a$10$kZRMXdzLjPzgnseImPZi6OcJmiXjZkNyGn2.Uzp87z.0yONaOiZbC', '', NULL, '2026-09-19 20:20:10', 0, '2026-09-19 20:20:10', NULL, NULL, 'owner', '2026-09-24 20:20:28', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '+916993452', 3, 2),
(22, 'Jayapraveen Kr', 'jayapraveenk885@gmail.com', '52412396524', '$2a$10$zCY8.0wB/wwtmhPmVBCzEefFmqCReCLBQ/AV.O9GY3yUBknZ1qhx.', 'Wayanad ', 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10215552371837946&height=200&width=200&ext=1792477366&hash=AfuZepmdPevcQ9e3z1CWvrW1', '2026-09-20 06:22:47', 0, '2026-09-20 16:20:54', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2),
(23, 'Token Test User', 'token_test_1790436578423@testmail.com', '+919876543210', '$2a$10$NlyCI3ip0uhpTtEKS3F6qecUjsSaYk7jDENFNR6X43kPh7jYVyR0q', NULL, NULL, '2026-09-26 15:29:42', 0, '2026-09-26 15:29:42', NULL, NULL, 'user', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 3, 2),
(24, 'Token Test User', 'token_test_1790436674730@testmail.com', '+919436674730', '$2a$10$ahB3vhfelxo.rt6C9FiaSO6wQ4ZLcgp.YPxgviOSnX1MNMJAHTlrW', NULL, NULL, '2026-09-26 15:31:14', 0, '2026-09-26 15:31:14', NULL, NULL, 'owner', '2026-10-01 15:31:15', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 2, 1),
(25, 'Token Test User', 'token_test_1790436753847@testmail.com', '+919436753847', '$2a$10$xHCjtBF2F6ExEMKsT/1R2e1v0Fc1cViw1Cc1VHLUrl/7Z6Mbs/JTa', NULL, NULL, '2026-09-26 15:32:34', 0, '2026-09-26 15:32:34', NULL, NULL, 'owner', '2026-10-01 15:32:34', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 2, 1),
(26, 'Token Test User', 'token_test_1790436949143@testmail.com', '+919436949143', '$2a$10$BNtJ/25Nd7/bq3QAoUPV8u9unHgsvRuithmivOrVU0hSn/h18UXra', NULL, NULL, '2026-09-26 15:35:49', 0, '2026-09-26 15:35:49', NULL, NULL, 'owner', '2026-10-01 15:35:49', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 2, 2),
(27, 'Token Test User', 'token_test_1790436969817@testmail.com', '+919436969817', '$2a$10$yMAD6RIpElJI6ENLN3NRUOXG8V8aYMa.OdcnTf3TkWHkK36mw2NC2', NULL, NULL, '2026-09-26 15:36:09', 0, '2026-09-26 15:36:09', NULL, NULL, 'owner', '2026-10-01 15:36:10', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 2, 2);

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
-- Indexes for table `builders`
--
ALTER TABLE `builders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `builder_inquiries`
--
ALTER TABLE `builder_inquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `builder_leads`
--
ALTER TABLE `builder_leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `builder_id` (`builder_id`);

--
-- Indexes for table `builder_projects`
--
ALTER TABLE `builder_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `builder_id` (`builder_id`);

--
-- Indexes for table `contact_clicks`
--
ALTER TABLE `contact_clicks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_property` (`user_id`,`property_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `credit_transactions`
--
ALTER TABLE `credit_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_type` (`user_id`,`credit_type`);

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
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `app_download_page_settings`
--
ALTER TABLE `app_download_page_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `builders`
--
ALTER TABLE `builders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `builder_inquiries`
--
ALTER TABLE `builder_inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `builder_leads`
--
ALTER TABLE `builder_leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `builder_projects`
--
ALTER TABLE `builder_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `contact_clicks`
--
ALTER TABLE `contact_clicks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `credit_transactions`
--
ALTER TABLE `credit_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `enquiries`
--
ALTER TABLE `enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=282;

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
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=212;

--
-- AUTO_INCREMENT for table `top_locations`
--
ALTER TABLE `top_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `builder_leads`
--
ALTER TABLE `builder_leads`
  ADD CONSTRAINT `builder_leads_ibfk_1` FOREIGN KEY (`builder_id`) REFERENCES `builders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `builder_projects`
--
ALTER TABLE `builder_projects`
  ADD CONSTRAINT `builder_projects_ibfk_1` FOREIGN KEY (`builder_id`) REFERENCES `builders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contact_clicks`
--
ALTER TABLE `contact_clicks`
  ADD CONSTRAINT `contact_clicks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contact_clicks_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `credit_transactions`
--
ALTER TABLE `credit_transactions`
  ADD CONSTRAINT `credit_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
