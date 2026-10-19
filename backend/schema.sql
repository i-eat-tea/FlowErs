-- FLOWERS schema (SAFE: re-runnable, never drops data). Database-agnostic: uses the connection's database.
-- NOTE: the 'doctor OR hospital must be set' rule for sharing_permissions is enforced in server.ts, not in SQL
--       (MySQL forbids a CHECK on columns used by ON DELETE SET NULL foreign keys).
-- FLOWER Maternal Health — 13-table DB schema (confirmed by user 2026-09-01; +3 for family/profiles/usage)
-- Split from old PassportProfile (30+ fields in one object)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role ENUM('mother','doctor','hospital_admin','family') DEFAULT 'mother',
    subscription_tier ENUM('free','basic','premium') DEFAULT 'free',
    subscription_status ENUM('active','expired','pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mother_profiles (
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

CREATE TABLE IF NOT EXISTS pregnancy_profiles (
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

CREATE TABLE IF NOT EXISTS mother_medical_info (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL UNIQUE,
    blood_type VARCHAR(10),
    allergies TEXT,
    existing_conditions TEXT,
    current_medications TEXT,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    relation VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medical_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mother_profile_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    category ENUM('ultrasound','lab_test','prescription','vaccine','doctor_note','other') NOT NULL,
    date DATE,
    week INT,
    trimester INT,
    facility VARCHAR(255),
    doctor VARCHAR(255),
    notes TEXT,
    image_attachment LONGTEXT,
    status ENUM('Normal','Follow-up Needed','Completed','Pending') DEFAULT 'Normal',
    tags JSON,
    extracted_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mother_profile_id VARCHAR(36),
    title VARCHAR(255),
    date DATE,
    time TIME,
    hospital VARCHAR(255),
    doctor VARCHAR(255),
    notes TEXT,
    type ENUM('ANC','Ultrasound','Blood Test','Vaccine','Specialist','Other'),
    reminder ENUM('1_week','3_days','1_day','same_day','custom','none') DEFAULT 'none',
    completed BOOLEAN DEFAULT FALSE,
    image_attachment LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    license_number VARCHAR(100),
    specialty VARCHAR(255),
    facility_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hospital_profiles (
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

CREATE TABLE IF NOT EXISTS sharing_permissions (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL,
    doctor_profile_id VARCHAR(36),
    hospital_profile_id VARCHAR(36),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    record_types_granted JSON,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (hospital_profile_id) REFERENCES hospital_profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(36) PRIMARY KEY,
    data JSON NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_members (
    id VARCHAR(36) PRIMARY KEY,
    mother_profile_id VARCHAR(36) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    relation VARCHAR(50),
    can_edit BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feature_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    role ENUM('mother','doctor','hospital_admin','family') NULL,
    session_id CHAR(32) NULL,
    feature_key VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    source ENUM('client','server') NOT NULL,
    lang ENUM('en','kh') NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_feature_action (feature_key, action, created_at),
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
);
CREATE TABLE IF NOT EXISTS user_consents (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(36) NOT NULL, consent_version VARCHAR(32) NOT NULL, lang ENUM('en','kh') NULL, accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, consent_version), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS daily_notes (id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, note_date DATE NOT NULL, task VARCHAR(255) NULL, note TEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, INDEX idx_user_note_date (user_id, note_date));
