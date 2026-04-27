-- Proper Database Schema for EEGFilterPro
-- This file is synchronized with models.py

CREATE DATABASE IF NOT EXISTS eeg_pro_db;
USE eeg_pro_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reset_otp VARCHAR(6) NULL,
    otp_expiry DATETIME NULL,
    phone VARCHAR(20) NULL,
    institution VARCHAR(255) NULL,
    department VARCHAR(255) NULL,
    profile_image VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000) NULL,
    subject_id VARCHAR(100) NULL,
    session VARCHAR(100) NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. EEG Files Table
CREATE TABLE IF NOT EXISTS eeg_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    file_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NULL,
    sampling_rate FLOAT NULL,
    duration FLOAT NULL,
    channels JSON NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 4. Analysis Results Table
CREATE TABLE IF NOT EXISTS analysis_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eeg_file_id INT,
    quality_score FLOAT NULL,
    interference_detected JSON NULL,
    snr_improvement FLOAT NULL,
    filter_settings JSON NULL,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eeg_file_id) REFERENCES eeg_files(id) ON DELETE CASCADE
);

-- Insert a dummy user for testing (matches models.py expectations)
-- Default password is 'password123' (hashed)
INSERT INTO users (name, email, password_hash) 
SELECT * FROM (SELECT 'Admin User', 'admin@example.com', '$2b$12$CmCk5z6TSZLdzNI1PAvEU.w/cDxniG3OIwR1pV41c3jqkRXm1a37i') AS tmp
WHERE NOT EXISTS (
    SELECT email FROM users WHERE email = 'admin@example.com'
) LIMIT 1;


