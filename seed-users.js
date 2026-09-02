/**
 * Seed Demo Users into MySQL Database
 *
 * Run: node seed-users.js
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seedUsers() {
  console.log('🌱 Seeding demo users into flowers_db...\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('1234', salt);

  const demoUsers = [
    // Mother account
    {
      id: 'usr-mother-001',
      email: 'sophy@example.com',
      passwordHash: defaultPassword,
      role: 'mother',
      motherProfile: {
        id: 'moth-001',
        fullName: 'Sophy Cheat',
        dob: '1998-05-15',
        phone: '+855-97-123-4567',
        heightCm: 158,
        weightKg: 52,
        languagePref: 'kh',
      },
    },
    // Doctor account
    {
      id: 'usr-doctor-001',
      email: 'dr.sophy@hospital.com',
      passwordHash: defaultPassword,
      role: 'doctor',
      doctorProfile: {
        id: 'doc-001',
        licenseNumber: 'DOC-KH-2024-8891',
        specialty: 'Obstetrics & Gynecology',
        facilityName: 'Calmette Hospital, Phnom Penh',
        phone: '+855-23-426-948',
        email: 'dr.sophy@hospital.com',
      },
    },
    // Hospital Admin account
    {
      id: 'usr-admin-001',
      email: 'admin@calmette.gov.kh',
      passwordHash: defaultPassword,
      role: 'hospital_admin',
      hospitalProfile: {
        id: 'hosp-001',
        name: 'Calmette Hospital',
        address: 'No. 3, Monivong Blvd, Phnom Penh, Cambodia',
        contactPhone: '+855-23-426-948',
        email: 'admin@calmette.gov.kh',
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
      },
    },
  ];

  for (const user of demoUsers) {
    try {
      // Insert or ignore user
      await connection.execute(
        `INSERT IGNORE INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        [user.id, user.email, user.passwordHash, user.role]
      );

      console.log(`✅ User created: ${user.email} (${user.role})`);

      // Insert role-specific profile
      if (user.role === 'mother' && user.motherProfile) {
        await connection.execute(
          `INSERT IGNORE INTO mother_profiles (id, user_id, full_name, date_of_birth, phone, height_cm, pre_pregnancy_weight_kg, language_pref)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.motherProfile.id,
            user.id,
            user.motherProfile.fullName,
            user.motherProfile.dob,
            user.motherProfile.phone,
            user.motherProfile.heightCm,
            user.motherProfile.weightKg,
            user.motherProfile.languagePref,
          ]
        );
        console.log(`   └─ Mother profile created: ${user.motherProfile.fullName}`);
      }

      if (user.role === 'doctor' && user.doctorProfile) {
        await connection.execute(
          `INSERT IGNORE INTO doctor_profiles (id, user_id, license_number, specialty, facility_name, phone, email)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            user.doctorProfile.id,
            user.id,
            user.doctorProfile.licenseNumber,
            user.doctorProfile.specialty,
            user.doctorProfile.facilityName,
            user.doctorProfile.phone,
            user.doctorProfile.email,
          ]
        );
        console.log(`   └─ Doctor profile created: ${user.doctorProfile.specialty}`);
      }

      if (user.role === 'hospital_admin' && user.hospitalProfile) {
        await connection.execute(
          `INSERT IGNORE INTO hospital_profiles (id, user_id, name, address, contact_phone, email, subscription_tier, subscription_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.hospitalProfile.id,
            user.id,
            user.hospitalProfile.name,
            user.hospitalProfile.address,
            user.hospitalProfile.contactPhone,
            user.hospitalProfile.email,
            user.hospitalProfile.subscriptionTier,
            user.hospitalProfile.subscriptionStatus,
          ]
        );
        console.log(`   └─ Hospital profile created: ${user.hospitalProfile.name}`);
      }
    } catch (err) {
      console.error(`❌ Error inserting ${user.email}:`, err.message);
    }
  }

  await connection.end();

  console.log('\n🎉 Seed completed! You can now log in with:');
  console.log('═'.repeat(60));
  console.log('🌸 Mother Login:');
  console.log('   Email:    sophy@example.com');
  console.log('   Password: 1234');
  console.log('\n👨‍⚕️ Doctor Login:');
  console.log('   Role:     Doctor / Midwife');
  console.log('   Email:    dr.sophy@hospital.com');
  console.log('   Password: 1234');
  console.log('\n🏥 Hospital Admin Login:');
  console.log('   Role:     Hospital Admin');
  console.log('   Email:    admin@calmette.gov.kh');
  console.log('   Password: 1234');
  console.log('═'.repeat(60));
}

seedUsers().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
