CREATE DATABASE IF NOT EXISTS flowers_db;
USE flowers_db;

CREATE TABLE IF NOT EXISTS profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category ENUM('ultrasound','lab_test','prescription','vaccine','doctor_note','other'),
  date DATE NOT NULL,
  week INT,
  trimester TINYINT,
  facility VARCHAR(255),
  doctor VARCHAR(255),
  notes TEXT,
  status ENUM('Normal','Follow-up Needed','Completed','Pending'),
  image_attachment LONGTEXT,
  tags JSON,
  extracted_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255),
  date DATE NOT NULL,
  time TIME,
  hospital VARCHAR(255),
  doctor VARCHAR(255),
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  type ENUM('ANC','Ultrasound','Blood Test','Vaccine','Specialist','Other'),
  reminder ENUM('1_week','3_days','1_day','same_day','custom','none'),
  image_attachment LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);
