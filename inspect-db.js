import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function inspectDb() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  try {
    console.log('=== USERS ===');
    const [users] = await connection.execute('SELECT id, email, role, created_at FROM users');
    console.table(users);

    console.log('\n=== MOTHER PROFILES ===');
    const [mothers] = await connection.execute('SELECT id, user_id, full_name, phone FROM mother_profiles');
    console.table(mothers);

    console.log('\n=== APPOINTMENTS ===');
    const [appointments] = await connection.execute('SELECT id, user_id, mother_profile_id, title, date, time, hospital, doctor, completed FROM appointments');
    console.table(appointments);
  } catch (err) {
    console.error('Error inspecting DB:', err);
  } finally {
    await connection.end();
  }
}

inspectDb();
