import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkAppointmentsTable() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  try {
    console.log('📋 Columns in appointments table:');
    const [cols] = await connection.execute('DESCRIBE appointments');
    console.table(cols);

    // Try a direct insert to see exact MySQL error
    const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
    if (users.length > 0) {
      const userId = users[0].id;
      const [mothers] = await connection.execute('SELECT id FROM mother_profiles WHERE user_id = ?', [userId]);
      const motherId = mothers.length > 0 ? mothers[0].id : null;
      console.log('\nTrying direct SQL insert with:', { userId, motherId });

      const testId = `direct-test-${Date.now()}`;
      await connection.execute(
        `INSERT INTO appointments
          (id, user_id, mother_profile_id, title, date, time, hospital, doctor, notes,
           completed, type, reminder, image_attachment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testId,
          userId,
          motherId,
          'Direct Test',
          '2026-09-15',
          '09:30:00',
          'Test Hospital',
          'Dr. Test',
          'Test notes',
          0,
          'ANC',
          '1_day',
          null
        ]
      );
      console.log('✅ Direct insert succeeded!');

      // Clean up
      await connection.execute('DELETE FROM appointments WHERE id = ?', [testId]);
      console.log('✅ Clean up succeeded!');
    }
  } catch (err) {
    console.error('❌ SQL Error:', err.message);
    console.error('❌ SQL Code:', err.code);
    console.error('❌ Full Error:', err);
  } finally {
    await connection.end();
  }
}

checkAppointmentsTable();
