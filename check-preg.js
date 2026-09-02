import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkPreg() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  try {
    const [pregs] = await connection.execute('SELECT * FROM pregnancy_profiles');
    console.log('=== PREGNANCY PROFILES ===');
    console.table(pregs);

    const [meds] = await connection.execute('SELECT * FROM mother_medical_info');
    console.log('\n=== MEDICAL INFO ===');
    console.table(meds);
  } finally {
    await connection.end();
  }
}

checkPreg();
