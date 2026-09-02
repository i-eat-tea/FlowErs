-- FLOWER Maternal Health — 10-table DB schema (confirmed by user 2026-09-01)
-- Split from old PassportProfile (30+ fields in one object)
CREATE DATABASE IF NOT EXISTS flowers_db;
USE flowers_db; 

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role ENUM('mother','doctor','hospital_admin','family') DEFAULT 'mother',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE mother_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    date_of_birth DATE,
    phone VARCHAR(50),
    height_cm DECIMAL(5,2),
    pre_pregnancy_weight_kg DECIMAL(5,2),
    language_pref ENUM('en','kh') DEFAULT 'kh',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE pregnancy_profiles (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL UNIQUE,
    edd DATE,
    lmp DATE,
    gravida INT DEFAULT 1,
    para INT DEFAULT 0,
    current_week INT DEFAULT 4,
    trimester INT DEFAULT 1,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE
);

CREATE TABLE mother_medical_info (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL UNIQUE,
    blood_type VARCHAR(10),
    allergies TEXT,
    existing_conditions TEXT,
    current_medications TEXT,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE
);

CREATE TABLE emergency_contacts (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    relation VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE
);

CREATE TABLE medical_records (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL,
    title VARCHAR(255),
    category ENUM('ultrasound','lab_test','prescription','vaccine','doctor_note','other'),
    exam_date DATE,
    week INT,
    trimester INT,
    facility VARCHAR(255),
    doctor VARCHAR(255),
    notes TEXT,
    image_url VARCHAR(500),
    status ENUM('Normal','Follow-up Needed','Completed','Pending') DEFAULT 'Normal',
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE
);

CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL,
    title VARCHAR(255),
    appt_date DATE,
    appt_time TIME,
    hospital VARCHAR(255),
    doctor VARCHAR(255),
    notes TEXT,
    type ENUM('ANC','Ultrasound','Blood Test','Vaccine','Specialist','Other'),
    reminder ENUM('1_week','3_days','1_day','same_day','custom','none') DEFAULT 'none',
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE
);

CREATE TABLE doctor_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    license_number VARCHAR(100),
    specialty VARCHAR(255),
    facility_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE hospital_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255),
    address TEXT,
    contact_phone VARCHAR(50),
    email VARCHAR(255),
    subscription_tier ENUM('free','basic','premium') DEFAULT 'free',
    subscription_status ENUM('active','expired','pending') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE sharing_permissions (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL,
    doctor_profile_id VARCHAR(36),
    hospital_profile_id VARCHAR(36),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    record_types_granted JSON,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (hospital_profile_id) REFERENCES hospital_profiles(id) ON DELETE SET NULL,
    CHECK (doctor_profile_id IS NOT NULL OR hospital_profile_id IS NOT NULL)
);

CREATE TABLE family_members (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    relation VARCHAR(50),
    can_edit BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE
);
