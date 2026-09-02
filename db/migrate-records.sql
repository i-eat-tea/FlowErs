-- Migration script to update medical_records table
-- Run this to align existing table with new schema

USE flowers_db;

-- Check if table exists and alter it
ALTER TABLE medical_records
ADD COLUMN IF NOT EXISTS mother_profile_id VARCHAR(36) AFTER user_id,
ADD COLUMN IF NOT EXISTS extracted_data JSON AFTER tags,
MODIFY COLUMN title VARCHAR(255) NOT NULL,
MODIFY COLUMN category ENUM('ultrasound','lab_test','prescription','vaccine','doctor_note','other') NOT NULL;

-- Add foreign key if it doesn't exist
ALTER TABLE medical_records
ADD CONSTRAINT fk_medical_records_mother_profile
FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE SET NULL;

-- Do the same for appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS mother_profile_id VARCHAR(36) AFTER user_id,
ADD COLUMN IF NOT EXISTS image_attachment LONGTEXT AFTER completed;

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_mother_profile
FOREIGN KEY (mother_profile_id) REFERENCES mother_profiles(id) ON DELETE SET NULL;

SELECT 'Migration completed successfully!' as status;
