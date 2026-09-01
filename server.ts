/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));

// ─── MySQL Connection Pool ───────────────────────────────────────────────────

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'flowers_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ─── Helper: ensure profile row exists for a user ────────────────────────────

async function ensureProfile(userId: string): Promise<void> {
  await pool.execute<ResultSetHeader>(
    `INSERT IGNORE INTO profiles (user_id, data) VALUES (?, '{"personal":{"name":"","dob":"","age":0,"phone":""},"pregnancy":{"edd":"","gravida":0,"para":0},"medical":{"bloodType":"","allergies":"","existingConditions":"","currentMedications":"","emergencyContactName":"","emergencyContactRelation":"","emergencyContactPhone":""}}')`,
    [userId],
  );
}

// ─── Profile API ──────────────────────────────────────────────────────────────

// GET /api/profile/:userId
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT data FROM profiles WHERE user_id = ?',
      [req.params.userId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(rows[0].data);
  } catch (err: any) {
    console.error('GET /api/profile error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/profile/:userId  (upsert)
app.put('/api/profile/:userId', async (req, res) => {
  try {
    await ensureProfile(req.params.userId);
    await pool.execute<ResultSetHeader>(
      'UPDATE profiles SET data = ? WHERE user_id = ?',
      [JSON.stringify(req.body), req.params.userId],
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/profile error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Medical Records API ──────────────────────────────────────────────────────

// GET /api/records/:userId
app.get('/api/records/:userId', async (req, res) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, user_id, title, category, date, week, trimester,
              facility, doctor, notes, status, image_attachment,
              tags, extracted_data, created_at
       FROM medical_records
       WHERE user_id = ?
       ORDER BY date DESC`,
      [req.params.userId],
    );
    const records = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      category: row.category,
      date: row.date,
      week: row.week,
      trimester: row.trimester,
      facility: row.facility,
      doctor: row.doctor,
      notes: row.notes,
      status: row.status,
      imageAttachment: row.image_attachment,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      extractedData: typeof row.extracted_data === 'string'
        ? JSON.parse(row.extracted_data) : row.extracted_data,
      createdAt: row.created_at,
    }));
    res.json(records);
  } catch (err: any) {
    console.error('GET /api/records error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/records
app.post('/api/records', async (req, res) => {
  try {
    const {
      id, userId, title, category, date, week, trimester,
      facility, doctor, notes, status, imageAttachment,
      tags, extractedData,
    } = req.body;

    await pool.execute<ResultSetHeader>(
      `INSERT INTO medical_records
        (id, user_id, title, category, date, week, trimester,
         facility, doctor, notes, status, image_attachment, tags, extracted_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        title,
        category,
        date,
        week ?? null,
        trimester ?? null,
        facility ?? null,
        doctor ?? null,
        notes ?? null,
        status ?? null,
        imageAttachment ?? null,
        tags ? JSON.stringify(tags) : null,
        extractedData ? JSON.stringify(extractedData) : null,
      ],
    );
    res.status(201).json({ success: true, id });
  } catch (err: any) {
    console.error('POST /api/records error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/records/:id
app.put('/api/records/:id', async (req, res) => {
  try {
    const {
      title, category, date, week, trimester,
      facility, doctor, notes, status, imageAttachment,
      tags, extractedData,
    } = req.body;

    await pool.execute<ResultSetHeader>(
      `UPDATE medical_records SET
        title = ?, category = ?, date = ?, week = ?, trimester = ?,
        facility = ?, doctor = ?, notes = ?, status = ?,
        image_attachment = ?, tags = ?, extracted_data = ?
       WHERE id = ?`,
      [
        title, category, date, week ?? null, trimester ?? null,
        facility ?? null, doctor ?? null, notes ?? null, status ?? null,
        imageAttachment ?? null,
        tags ? JSON.stringify(tags) : null,
        extractedData ? JSON.stringify(extractedData) : null,
        req.params.id,
      ],
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/records error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/records/:id
app.delete('/api/records/:id', async (req, res) => {
  try {
    await pool.execute<ResultSetHeader>(
      'DELETE FROM medical_records WHERE id = ?',
      [req.params.id],
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/records error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Appointments API ─────────────────────────────────────────────────────────

// GET /api/appointments/:userId
app.get('/api/appointments/:userId', async (req, res) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, user_id, title, date, time, hospital, doctor, notes,
              completed, type, reminder, image_attachment, created_at
       FROM appointments
       WHERE user_id = ?
       ORDER BY date ASC`,
      [req.params.userId],
    );
    const appointments = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      date: row.date,
      time: row.time,
      hospital: row.hospital,
      doctor: row.doctor,
      notes: row.notes,
      completed: !!row.completed,
      type: row.type,
      reminder: row.reminder,
      imageAttachment: row.image_attachment,
      createdAt: row.created_at,
    }));
    res.json(appointments);
  } catch (err: any) {
    console.error('GET /api/appointments error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const {
      id, userId, title, date, time, hospital, doctor,
      notes, completed, type, reminder, imageAttachment,
    } = req.body;

    await pool.execute<ResultSetHeader>(
      `INSERT INTO appointments
        (id, user_id, title, date, time, hospital, doctor, notes,
         completed, type, reminder, image_attachment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        title ?? null,
        date,
        time ?? null,
        hospital ?? null,
        doctor ?? null,
        notes ?? null,
        completed ?? false,
        type ?? 'Other',
        reminder ?? 'none',
        imageAttachment ?? null,
      ],
    );
    res.status(201).json({ success: true, id });
  } catch (err: any) {
    console.error('POST /api/appointments error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/appointments/:id
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const {
      title, date, time, hospital, doctor,
      notes, completed, type, reminder, imageAttachment,
    } = req.body;

    await pool.execute<ResultSetHeader>(
      `UPDATE appointments SET
        title = ?, date = ?, time = ?, hospital = ?, doctor = ?,
        notes = ?, completed = ?, type = ?, reminder = ?,
        image_attachment = ?
       WHERE id = ?`,
      [
        title ?? null,
        date ?? null,
        time ?? null,
        hospital ?? null,
        doctor ?? null,
        notes ?? null,
        completed ?? false,
        type ?? 'Other',
        reminder ?? 'none',
        imageAttachment ?? null,
        req.params.id,
      ],
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/appointments error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/appointments/:id
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await pool.execute<ResultSetHeader>(
      'DELETE FROM appointments WHERE id = ?',
      [req.params.id],
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/appointments error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() });
  } catch {
    res.json({ status: 'ok', database: 'disconnected', time: new Date().toISOString() });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware mounted.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving static production build from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
