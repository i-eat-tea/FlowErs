var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = parseInt(process.env.PORT || "3000", 10);
var JWT_SECRET = process.env.JWT_SECRET || "flower-maternal-health-secret-key-2026";
app.use(import_express.default.json({ limit: "50mb" }));
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  import_jsonwebtoken.default.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}
function generateToken(user) {
  return import_jsonwebtoken.default.sign(user, JWT_SECRET, { expiresIn: "7d" });
}
function generateId(prefix = "usr") {
  return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
}
var pool = import_promise.default.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306", 10),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "flowers_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});
async function ensureProfile(userId) {
  await pool.execute(
    `INSERT IGNORE INTO profiles (user_id, data) VALUES (?, '{"personal":{"name":"","dob":"","age":0,"phone":""},"pregnancy":{"edd":"","gravida":0,"para":0},"medical":{"bloodType":"","allergies":"","existingConditions":"","currentMedications":"","emergencyContactName":"","emergencyContactRelation":"","emergencyContactPhone":""}}')`,
    [userId]
  );
}
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, role = "mother", fullName = "", phone = "" } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters" });
    }
    const validRoles = ["mother", "doctor", "hospital_admin", "family"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const salt = await import_bcryptjs.default.genSalt(10);
    const passwordHash = await import_bcryptjs.default.hash(password, salt);
    const userId = generateId();
    await pool.execute(
      "INSERT INTO users (id, email, password_hash, role, subscription_tier, subscription_status) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, email.toLowerCase().trim(), passwordHash, role, "free", "pending"]
    );
    if (role === "mother") {
      const motherProfileId = "moth-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
      await pool.execute(
        "INSERT INTO mother_profiles (id, user_id, full_name, phone, language_pref) VALUES (?, ?, ?, ?, ?)",
        [motherProfileId, userId, fullName, phone, "kh"]
      );
    }
    const token = generateToken({ id: userId, email: email.toLowerCase().trim(), role });
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        role,
        fullName,
        subscriptionTier: "free",
        subscriptionStatus: "pending"
      }
    });
  } catch (err) {
    console.error("POST /api/auth/register error:", err.message);
    res.status(500).json({ error: "Registration failed due to a server error" });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const [users] = await pool.execute(
      "SELECT id, email, password_hash, role, subscription_tier, subscription_status FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = users[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await import_bcryptjs.default.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    let profileData = {};
    if (user.role === "mother") {
      const [motherRows] = await pool.execute(
        "SELECT id, full_name, phone, language_pref FROM mother_profiles WHERE user_id = ?",
        [user.id]
      );
      if (motherRows.length > 0) {
        profileData = {
          motherProfileId: motherRows[0].id,
          fullName: motherRows[0].full_name,
          phone: motherRows[0].phone,
          languagePref: motherRows[0].language_pref
        };
      }
    } else if (user.role === "doctor") {
      const [docRows] = await pool.execute(
        "SELECT id, specialty, facility_name FROM doctor_profiles WHERE user_id = ?",
        [user.id]
      );
      if (docRows.length > 0) {
        profileData = {
          doctorProfileId: docRows[0].id,
          specialty: docRows[0].specialty,
          facilityName: docRows[0].facility_name
        };
      }
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscription_tier || "free",
        subscriptionStatus: user.subscription_status || "pending",
        ...profileData
      }
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err.message);
    res.status(500).json({ error: "Login failed due to a server error" });
  }
});
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const [users] = await pool.execute(
      "SELECT id, email, role, created_at FROM users WHERE id = ?",
      [userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = users[0];
    let profileData = {};
    if (user.role === "mother") {
      const [motherRows] = await pool.execute(
        "SELECT * FROM mother_profiles WHERE user_id = ?",
        [user.id]
      );
      if (motherRows.length > 0) {
        profileData = { motherProfile: motherRows[0] };
      }
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        ...profileData
      }
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT data FROM profiles WHERE user_id = ?",
      [req.params.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(rows[0].data);
  } catch (err) {
    console.error("GET /api/profile error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
app.put("/api/profile/:userId", async (req, res) => {
  try {
    await ensureProfile(req.params.userId);
    await pool.execute(
      "UPDATE profiles SET data = ? WHERE user_id = ?",
      [JSON.stringify(req.body), req.params.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/profile error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/mother-profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [motherRows] = await pool.execute(
      "SELECT * FROM mother_profiles WHERE user_id = ?",
      [userId]
    );
    if (motherRows.length === 0) {
      return res.status(404).json({ error: "Mother profile not found" });
    }
    const mp = motherRows[0];
    const [pregRows] = await pool.execute(
      "SELECT * FROM pregnancy_profiles WHERE mother_profile_id = ?",
      [mp.id]
    );
    const [medRows] = await pool.execute(
      "SELECT * FROM mother_medical_info WHERE mother_profile_id = ?",
      [mp.id]
    );
    const [ecRows] = await pool.execute(
      "SELECT * FROM emergency_contacts WHERE mother_profile_id = ? ORDER BY is_primary DESC",
      [mp.id]
    );
    const preg = pregRows.length > 0 ? pregRows[0] : null;
    const med = medRows.length > 0 ? medRows[0] : null;
    res.json({
      motherProfile: {
        id: mp.id,
        userId: mp.user_id,
        fullName: mp.full_name,
        dateOfBirth: mp.date_of_birth,
        phone: mp.phone,
        heightCm: mp.height_cm ? Number(mp.height_cm) : null,
        prePregnancyWeightKg: mp.pre_pregnancy_weight_kg ? Number(mp.pre_pregnancy_weight_kg) : null,
        languagePref: mp.language_pref
      },
      pregnancyProfile: preg ? {
        id: preg.id,
        motherProfileId: preg.mother_profile_id,
        edd: preg.edd,
        lmp: preg.lmp,
        gravida: preg.gravida,
        para: preg.para,
        currentWeek: preg.current_week,
        trimester: preg.trimester
      } : null,
      medicalInfo: med ? {
        id: med.id,
        motherProfileId: med.mother_profile_id,
        bloodType: med.blood_type,
        allergies: med.allergies,
        existingConditions: med.existing_conditions,
        currentMedications: med.current_medications
      } : null,
      emergencyContacts: ecRows.map((ec) => ({
        id: ec.id,
        motherProfileId: ec.mother_profile_id,
        name: ec.name,
        phone: ec.phone,
        relation: ec.relation,
        isPrimary: !!ec.is_primary
      }))
    });
  } catch (err) {
    console.error("GET /api/mother-profile error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
app.put("/api/mother-profile/:userId/setup", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { weeks, height, weight, gravida, para, bloodType } = req.body;
    const today = /* @__PURE__ */ new Date();
    const daysRemaining = (40 - weeks) * 7;
    const eddDate = new Date(today.getTime() + daysRemaining * 24 * 60 * 60 * 1e3);
    const eddString = eddDate.toISOString().split("T")[0];
    let trimester = 1;
    if (weeks >= 13 && weeks <= 27) trimester = 2;
    if (weeks >= 28) trimester = 3;
    const [motherRows] = await pool.execute(
      "SELECT id FROM mother_profiles WHERE user_id = ?",
      [userId]
    );
    if (motherRows.length === 0) {
      return res.status(404).json({ error: "Mother profile not found. Register first." });
    }
    const motherProfileId = motherRows[0].id;
    await pool.execute(
      "UPDATE mother_profiles SET height_cm = ?, pre_pregnancy_weight_kg = ? WHERE id = ?",
      [height || null, weight || null, motherProfileId]
    );
    const [existingPreg] = await pool.execute(
      "SELECT id FROM pregnancy_profiles WHERE mother_profile_id = ?",
      [motherProfileId]
    );
    if (existingPreg.length > 0) {
      await pool.execute(
        `UPDATE pregnancy_profiles SET edd = ?, gravida = ?, para = ?, current_week = ?, trimester = ?
         WHERE mother_profile_id = ?`,
        [eddString, gravida, para, weeks, trimester, motherProfileId]
      );
    } else {
      const pregId = generateId("preg");
      await pool.execute(
        `INSERT INTO pregnancy_profiles (id, mother_profile_id, edd, gravida, para, current_week, trimester)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [pregId, motherProfileId, eddString, gravida, para, weeks, trimester]
      );
    }
    const [existingMed] = await pool.execute(
      "SELECT id FROM mother_medical_info WHERE mother_profile_id = ?",
      [motherProfileId]
    );
    if (existingMed.length > 0) {
      await pool.execute(
        "UPDATE mother_medical_info SET blood_type = ? WHERE mother_profile_id = ?",
        [bloodType || null, motherProfileId]
      );
    } else {
      const medId = generateId("med");
      await pool.execute(
        `INSERT INTO mother_medical_info (id, mother_profile_id, blood_type)
         VALUES (?, ?, ?)`,
        [medId, motherProfileId, bloodType || null]
      );
    }
    res.json({
      success: true,
      message: "Pregnancy setup saved",
      data: {
        edd: eddString,
        currentWeek: weeks,
        trimester,
        gravida,
        para,
        bloodType,
        heightCm: height,
        weightKg: weight
      }
    });
  } catch (err) {
    console.error("PUT /api/mother-profile/setup error:", err.message);
    res.status(500).json({ error: "Failed to save pregnancy setup" });
  }
});
app.put("/api/mother-profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      fullName,
      dateOfBirth,
      phone,
      heightCm,
      weightKg,
      languagePref,
      bloodType,
      allergies,
      existingConditions,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      // Pregnancy fields
      edd,
      gravida,
      para
    } = req.body;
    const [motherRows] = await pool.execute(
      "SELECT id FROM mother_profiles WHERE user_id = ?",
      [userId]
    );
    if (motherRows.length === 0) {
      return res.status(404).json({ error: "Mother profile not found" });
    }
    const motherProfileId = motherRows[0].id;
    await pool.execute(
      `UPDATE mother_profiles SET
        full_name = COALESCE(?, full_name),
        date_of_birth = COALESCE(?, date_of_birth),
        phone = COALESCE(?, phone),
        height_cm = COALESCE(?, height_cm),
        pre_pregnancy_weight_kg = COALESCE(?, pre_pregnancy_weight_kg),
        language_pref = COALESCE(?, language_pref)
       WHERE id = ?`,
      [
        fullName ?? null,
        dateOfBirth ?? null,
        phone ?? null,
        heightCm ?? null,
        weightKg ?? null,
        languagePref ?? null,
        motherProfileId
      ]
    );
    if (bloodType !== void 0 || allergies !== void 0 || existingConditions !== void 0 || currentMedications !== void 0) {
      const [existingMed] = await pool.execute(
        "SELECT id FROM mother_medical_info WHERE mother_profile_id = ?",
        [motherProfileId]
      );
      if (existingMed.length > 0) {
        await pool.execute(
          `UPDATE mother_medical_info SET
            blood_type = COALESCE(?, blood_type),
            allergies = COALESCE(?, allergies),
            existing_conditions = COALESCE(?, existing_conditions),
            current_medications = COALESCE(?, current_medications)
           WHERE mother_profile_id = ?`,
          [
            bloodType ?? null,
            allergies ?? null,
            existingConditions ?? null,
            currentMedications ?? null,
            motherProfileId
          ]
        );
      } else {
        const medId = generateId("med");
        await pool.execute(
          `INSERT INTO mother_medical_info (id, mother_profile_id, blood_type, allergies, existing_conditions, current_medications)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            medId,
            motherProfileId,
            bloodType ?? null,
            allergies ?? null,
            existingConditions ?? null,
            currentMedications ?? null
          ]
        );
      }
    }
    if (edd !== void 0 || gravida !== void 0 || para !== void 0) {
      const [existingPreg] = await pool.execute(
        "SELECT id FROM pregnancy_profiles WHERE mother_profile_id = ?",
        [motherProfileId]
      );
      if (existingPreg.length > 0) {
        await pool.execute(
          `UPDATE pregnancy_profiles SET
            edd = COALESCE(?, edd),
            gravida = COALESCE(?, gravida),
            para = COALESCE(?, para)
           WHERE mother_profile_id = ?`,
          [
            edd ?? null,
            gravida ?? null,
            para ?? null,
            motherProfileId
          ]
        );
      }
    }
    if (emergencyContactName || emergencyContactPhone) {
      const [existingEC] = await pool.execute(
        "SELECT id FROM emergency_contacts WHERE mother_profile_id = ? AND is_primary = TRUE",
        [motherProfileId]
      );
      if (existingEC.length > 0) {
        await pool.execute(
          `UPDATE emergency_contacts SET
            name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            relation = COALESCE(?, relation)
           WHERE id = ?`,
          [
            emergencyContactName ?? null,
            emergencyContactPhone ?? null,
            emergencyContactRelation ?? null,
            existingEC[0].id
          ]
        );
      } else {
        const ecId = generateId("ec");
        await pool.execute(
          `INSERT INTO emergency_contacts (id, mother_profile_id, name, phone, relation, is_primary)
           VALUES (?, ?, ?, ?, ?, TRUE)`,
          [
            ecId,
            motherProfileId,
            emergencyContactName ?? null,
            emergencyContactPhone ?? null,
            emergencyContactRelation ?? null
          ]
        );
      }
    }
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error("PUT /api/mother-profile error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
app.get("/api/records/:userId", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, user_id, mother_profile_id, title, category, date, week, trimester,
              facility, doctor, notes, status, image_attachment,
              tags, extracted_data, created_at
       FROM medical_records
       WHERE user_id = ?
       ORDER BY date DESC`,
      [req.params.userId]
    );
    const records = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      motherProfileId: row.mother_profile_id,
      title: row.title,
      category: row.category,
      date: row.date,
      examDate: row.date,
      week: row.week,
      trimester: row.trimester,
      facility: row.facility,
      doctor: row.doctor,
      notes: row.notes,
      status: row.status,
      imageAttachment: row.image_attachment,
      imageUrl: row.image_attachment,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
      extractedData: typeof row.extracted_data === "string" ? JSON.parse(row.extracted_data) : row.extracted_data,
      createdAt: row.created_at
    }));
    res.json(records);
  } catch (err) {
    console.error("GET /api/records error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/records/:userId/:recordId", async (req, res) => {
  try {
    const { userId, recordId } = req.params;
    const [rows] = await pool.execute(
      `SELECT id, user_id, mother_profile_id, title, category, date, week, trimester,
              facility, doctor, notes, status, image_attachment,
              tags, extracted_data, created_at
       FROM medical_records
       WHERE id = ? AND user_id = ?`,
      [recordId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    const row = rows[0];
    const record = {
      id: row.id,
      userId: row.user_id,
      motherProfileId: row.mother_profile_id,
      title: row.title,
      category: row.category,
      date: row.date,
      examDate: row.date,
      week: row.week,
      trimester: row.trimester,
      facility: row.facility,
      doctor: row.doctor,
      notes: row.notes,
      status: row.status,
      imageAttachment: row.image_attachment,
      imageUrl: row.image_attachment,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
      extractedData: typeof row.extracted_data === "string" ? JSON.parse(row.extracted_data) : row.extracted_data,
      createdAt: row.created_at
    };
    res.json(record);
  } catch (err) {
    console.error("GET /api/records/:userId/:recordId error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
app.post("/api/records", async (req, res) => {
  try {
    const {
      id,
      userId,
      title,
      category,
      date,
      week,
      trimester,
      facility,
      doctor,
      notes,
      status,
      imageAttachment,
      tags,
      extractedData
    } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }
    const validCategories = ["ultrasound", "lab_test", "prescription", "vaccine", "doctor_note", "other"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (week && (week < 1 || week > 42)) {
      return res.status(400).json({ error: "Week must be between 1 and 42" });
    }
    let finalTrimester = trimester;
    if (week && !trimester) {
      finalTrimester = week <= 12 ? 1 : week <= 27 ? 2 : 3;
    }
    let motherProfileId = null;
    if (userId) {
      const [motherRows] = await pool.execute(
        "SELECT id FROM mother_profiles WHERE user_id = ?",
        [userId]
      );
      if (motherRows.length > 0) {
        motherProfileId = motherRows[0].id;
      }
    }
    await pool.execute(
      `INSERT INTO medical_records
        (id, user_id, mother_profile_id, title, category, date, week, trimester,
         facility, doctor, notes, status, image_attachment, tags, extracted_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        motherProfileId,
        title.trim(),
        category,
        date || null,
        week ?? null,
        finalTrimester ?? null,
        facility ?? null,
        doctor ?? null,
        notes ?? null,
        status ?? "Normal",
        imageAttachment ?? null,
        tags ? JSON.stringify(tags) : null,
        extractedData ? JSON.stringify(extractedData) : null
      ]
    );
    res.status(201).json({ success: true, id, motherProfileId });
  } catch (err) {
    console.error("POST /api/records error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
app.put("/api/records/:id", async (req, res) => {
  try {
    const {
      title,
      category,
      date,
      week,
      trimester,
      facility,
      doctor,
      notes,
      status,
      imageAttachment,
      tags,
      extractedData
    } = req.body;
    if (category) {
      const validCategories = ["ultrasound", "lab_test", "prescription", "vaccine", "doctor_note", "other"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }
    }
    if (week !== void 0 && week !== null && (week < 1 || week > 42)) {
      return res.status(400).json({ error: "Week must be between 1 and 42" });
    }
    let finalTrimester = trimester;
    if (week && trimester === void 0) {
      finalTrimester = week <= 12 ? 1 : week <= 27 ? 2 : 3;
    }
    await pool.execute(
      `UPDATE medical_records SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        date = COALESCE(?, date),
        week = COALESCE(?, week),
        trimester = COALESCE(?, trimester),
        facility = COALESCE(?, facility),
        doctor = COALESCE(?, doctor),
        notes = COALESCE(?, notes),
        status = COALESCE(?, status),
        image_attachment = COALESCE(?, image_attachment),
        tags = COALESCE(?, tags),
        extracted_data = COALESCE(?, extracted_data)
       WHERE id = ?`,
      [
        title ?? null,
        category ?? null,
        date ?? null,
        week ?? null,
        finalTrimester ?? null,
        facility ?? null,
        doctor ?? null,
        notes ?? null,
        status ?? null,
        imageAttachment ?? null,
        tags ? JSON.stringify(tags) : null,
        extractedData ? JSON.stringify(extractedData) : null,
        req.params.id
      ]
    );
    res.json({ success: true, message: "Record updated successfully" });
  } catch (err) {
    console.error("PUT /api/records error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
app.delete("/api/records/:id", async (req, res) => {
  try {
    await pool.execute(
      "DELETE FROM medical_records WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/records error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/appointments/:userId", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM appointments WHERE user_id = ?`,
      [req.params.userId]
    );
    const appointments = rows.map((row) => {
      const rawDate = row.date !== void 0 ? row.date : row.appt_date;
      const rawTime = row.time !== void 0 ? row.time : row.appt_time;
      const rawImage = row.image_attachment !== void 0 ? row.image_attachment : row.imageAttachment;
      let formattedDate = "";
      if (rawDate instanceof Date) {
        const y = rawDate.getFullYear();
        const m = String(rawDate.getMonth() + 1).padStart(2, "0");
        const d = String(rawDate.getDate()).padStart(2, "0");
        formattedDate = `${y}-${m}-${d}`;
      } else if (typeof rawDate === "string") {
        formattedDate = rawDate.split("T")[0];
      } else if (rawDate) {
        formattedDate = String(rawDate);
      }
      let formattedTime = "";
      if (typeof rawTime === "string") {
        formattedTime = rawTime.slice(0, 5);
      } else if (rawTime) {
        formattedTime = String(rawTime);
      }
      return {
        id: row.id,
        userId: row.user_id || row.userId,
        motherProfileId: row.mother_profile_id || row.motherProfileId,
        title: row.title || "",
        date: formattedDate,
        time: formattedTime,
        apptDate: formattedDate,
        // Compatibility alias
        apptTime: formattedTime,
        // Compatibility alias
        hospital: row.hospital || "",
        doctor: row.doctor || "",
        notes: row.notes || "",
        completed: !!row.completed,
        type: row.type || "Other",
        reminder: row.reminder || "none",
        imageAttachment: rawImage || null,
        createdAt: row.created_at || null
      };
    });
    appointments.sort((a, b) => {
      return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    });
    res.json(appointments);
  } catch (err) {
    console.error("GET /api/appointments error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.get("/api/appointments/:userId/:appointmentId", async (req, res) => {
  try {
    const { userId, appointmentId } = req.params;
    const [rows] = await pool.execute(
      `SELECT * FROM appointments WHERE id = ? AND user_id = ?`,
      [appointmentId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    const row = rows[0];
    const rawDate = row.date !== void 0 ? row.date : row.appt_date;
    const rawTime = row.time !== void 0 ? row.time : row.appt_time;
    const rawImage = row.image_attachment !== void 0 ? row.image_attachment : row.imageAttachment;
    let formattedDate = "";
    if (rawDate instanceof Date) {
      const y = rawDate.getFullYear();
      const m = String(rawDate.getMonth() + 1).padStart(2, "0");
      const d = String(rawDate.getDate()).padStart(2, "0");
      formattedDate = `${y}-${m}-${d}`;
    } else if (typeof rawDate === "string") {
      formattedDate = rawDate.split("T")[0];
    } else if (rawDate) {
      formattedDate = String(rawDate);
    }
    let formattedTime = "";
    if (typeof rawTime === "string") {
      formattedTime = rawTime.slice(0, 5);
    } else if (rawTime) {
      formattedTime = String(rawTime);
    }
    const appointment = {
      id: row.id,
      userId: row.user_id || row.userId,
      motherProfileId: row.mother_profile_id || row.motherProfileId,
      title: row.title || "",
      date: formattedDate,
      time: formattedTime,
      apptDate: formattedDate,
      apptTime: formattedTime,
      hospital: row.hospital || "",
      doctor: row.doctor || "",
      notes: row.notes || "",
      completed: !!row.completed,
      type: row.type || "Other",
      reminder: row.reminder || "none",
      imageAttachment: rawImage || null,
      createdAt: row.created_at || null
    };
    res.json(appointment);
  } catch (err) {
    console.error("GET /api/appointments/:userId/:appointmentId error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.post("/api/appointments", async (req, res) => {
  try {
    const {
      id,
      userId,
      title,
      date,
      apptDate,
      time,
      apptTime,
      hospital,
      doctor,
      notes,
      completed,
      type,
      reminder,
      imageAttachment,
      image_attachment
    } = req.body;
    const rawDate = date || apptDate;
    const rawTime = time || apptTime;
    const rawImage = imageAttachment !== void 0 ? imageAttachment : image_attachment;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!rawDate) {
      return res.status(400).json({ error: "Date is required" });
    }
    const validTypes = ["ANC", "Ultrasound", "Blood Test", "Vaccine", "Specialist", "Other"];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid appointment type" });
    }
    const validReminders = ["1_week", "3_days", "1_day", "same_day", "custom", "none"];
    if (reminder && !validReminders.includes(reminder)) {
      return res.status(400).json({ error: "Invalid reminder option" });
    }
    let motherProfileId = null;
    if (userId) {
      const [motherRows] = await pool.execute(
        "SELECT id FROM mother_profiles WHERE user_id = ?",
        [userId]
      );
      if (motherRows.length > 0) {
        motherProfileId = motherRows[0].id;
      }
    }
    const apptId = id || generateId("appt");
    const finalDate = typeof rawDate === "string" ? rawDate.split("T")[0] : rawDate;
    const finalTime = rawTime ? typeof rawTime === "string" ? rawTime.slice(0, 5) : rawTime : null;
    await pool.execute(
      `INSERT INTO appointments
        (id, user_id, mother_profile_id, title, date, time, hospital, doctor, notes,
         completed, type, reminder, image_attachment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        apptId,
        userId,
        motherProfileId,
        title ? title.trim() : null,
        finalDate,
        finalTime,
        hospital ? hospital.trim() : null,
        doctor ? doctor.trim() : null,
        notes ? notes.trim() : null,
        completed ?? false,
        type ?? "Other",
        reminder ?? "none",
        rawImage ?? null
      ]
    );
    res.status(201).json({ success: true, id: apptId, motherProfileId });
  } catch (err) {
    console.error("POST /api/appointments error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.put("/api/appointments/:id", async (req, res) => {
  try {
    const {
      title,
      date,
      apptDate,
      time,
      apptTime,
      hospital,
      doctor,
      notes,
      completed,
      type,
      reminder,
      imageAttachment,
      image_attachment
    } = req.body;
    if (type) {
      const validTypes = ["ANC", "Ultrasound", "Blood Test", "Vaccine", "Specialist", "Other"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid appointment type" });
      }
    }
    if (reminder) {
      const validReminders = ["1_week", "3_days", "1_day", "same_day", "custom", "none"];
      if (!validReminders.includes(reminder)) {
        return res.status(400).json({ error: "Invalid reminder option" });
      }
    }
    const rawDate = date !== void 0 ? date : apptDate;
    const rawTime = time !== void 0 ? time : apptTime;
    const rawImage = imageAttachment !== void 0 ? imageAttachment : image_attachment;
    const parsedDate = rawDate !== void 0 ? rawDate ? typeof rawDate === "string" ? rawDate.split("T")[0] : rawDate : null : void 0;
    const parsedTime = rawTime !== void 0 ? rawTime ? typeof rawTime === "string" ? rawTime.slice(0, 5) : rawTime : null : void 0;
    await pool.execute(
      `UPDATE appointments SET
        title = COALESCE(?, title),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        hospital = COALESCE(?, hospital),
        doctor = COALESCE(?, doctor),
        notes = COALESCE(?, notes),
        completed = COALESCE(?, completed),
        type = COALESCE(?, type),
        reminder = COALESCE(?, reminder),
        image_attachment = COALESCE(?, image_attachment)
       WHERE id = ?`,
      [
        title !== void 0 ? title ? title.trim() : null : null,
        parsedDate !== void 0 ? parsedDate : null,
        parsedTime !== void 0 ? parsedTime : null,
        hospital !== void 0 ? hospital ? hospital.trim() : null : null,
        doctor !== void 0 ? doctor ? doctor.trim() : null : null,
        notes !== void 0 ? notes ? notes.trim() : null : null,
        completed !== void 0 ? completed : null,
        type ?? null,
        reminder ?? null,
        rawImage !== void 0 ? rawImage : null,
        req.params.id
      ]
    );
    res.json({ success: true, message: "Appointment updated successfully" });
  } catch (err) {
    console.error("PUT /api/appointments error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.delete("/api/appointments/:id", async (req, res) => {
  try {
    await pool.execute(
      "DELETE FROM appointments WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/appointments error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.get("/api/doctor/patients", async (req, res) => {
  try {
    const [motherRows] = await pool.execute(
      `SELECT id, user_id, full_name, date_of_birth, phone, height_cm, pre_pregnancy_weight_kg, language_pref
       FROM mother_profiles
       ORDER BY full_name ASC`
    );
    if (motherRows.length === 0) {
      return res.json([]);
    }
    const [pregnancyRows] = await pool.execute(
      `SELECT id, mother_profile_id, edd, lmp, gravida, para, current_week, trimester
       FROM pregnancy_profiles`
    );
    const pregnancyMap = new Map(pregnancyRows.map((p) => [p.mother_profile_id, p]));
    const [medicalRows] = await pool.execute(
      `SELECT id, mother_profile_id, blood_type, allergies, existing_conditions, current_medications
       FROM mother_medical_info`
    );
    const medicalMap = new Map(medicalRows.map((m) => [m.mother_profile_id, m]));
    const [contactRows] = await pool.execute(
      `SELECT id, mother_profile_id, name, phone, relation, is_primary
       FROM emergency_contacts`
    );
    const contactMap = /* @__PURE__ */ new Map();
    for (const c of contactRows) {
      if (!contactMap.has(c.mother_profile_id)) {
        contactMap.set(c.mother_profile_id, []);
      }
      contactMap.get(c.mother_profile_id).push({
        id: c.id,
        motherProfileId: c.mother_profile_id,
        name: c.name,
        phone: c.phone,
        relation: c.relation,
        isPrimary: !!c.is_primary
      });
    }
    const [recordRows] = await pool.execute(
      `SELECT id, user_id, mother_profile_id, date, created_at FROM medical_records`
    );
    const [apptRows] = await pool.execute(
      `SELECT id, user_id, mother_profile_id, date, time, completed FROM appointments`
    );
    const sharingMap = /* @__PURE__ */ new Map();
    try {
      const [shareRows] = await pool.execute(
        `SELECT id, mother_profile_id, doctor_profile_id, granted_at, expires_at, record_types_granted
         FROM sharing_permissions`
      );
      for (const s of shareRows) {
        sharingMap.set(s.mother_profile_id, s);
      }
    } catch {
    }
    const patients = motherRows.map((m) => {
      const p = pregnancyMap.get(m.id);
      const med = medicalMap.get(m.id);
      const contacts = contactMap.get(m.id) || [];
      const userRecords = recordRows.filter((r) => r.mother_profile_id === m.id || r.user_id === m.user_id);
      const userAppts = apptRows.filter((a) => a.mother_profile_id === m.id || a.user_id === m.user_id);
      let currentWeek = p?.current_week || 4;
      let trimester = p?.trimester || 1;
      let eddStr = "";
      if (p?.edd) {
        eddStr = p.edd instanceof Date ? p.edd.toISOString().split("T")[0] : String(p.edd).split("T")[0];
        const eddDate = new Date(eddStr);
        if (!isNaN(eddDate.getTime())) {
          const diffDays = Math.ceil((eddDate.getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24));
          const daysElapsed = 280 - (diffDays > 0 ? diffDays : 0);
          currentWeek = Math.max(4, Math.min(Math.floor(daysElapsed / 7), 40));
          if (currentWeek >= 13 && currentWeek <= 27) trimester = 2;
          else if (currentWeek >= 28) trimester = 3;
          else trimester = 1;
        }
      }
      let lastRecordDate = void 0;
      if (userRecords.length > 0) {
        const sorted = [...userRecords].sort((a, b) => String(b.date || b.created_at || "").localeCompare(String(a.date || a.created_at || "")));
        const rawDate = sorted[0].date || sorted[0].created_at;
        if (rawDate) {
          lastRecordDate = rawDate instanceof Date ? rawDate.toISOString().split("T")[0] : String(rawDate).split("T")[0];
        }
      }
      let nextAppointmentDate = void 0;
      const upcoming = userAppts.filter((a) => !a.completed);
      if (upcoming.length > 0) {
        const sorted = [...upcoming].sort((a, b) => String(a.date).localeCompare(String(b.date)));
        const rawDate = sorted[0].date;
        if (rawDate) {
          nextAppointmentDate = rawDate instanceof Date ? rawDate.toISOString().split("T")[0] : String(rawDate).split("T")[0];
        }
      }
      const sp = sharingMap.get(m.id);
      return {
        motherProfile: {
          id: m.id,
          userId: m.user_id,
          fullName: m.full_name || "Mother",
          dateOfBirth: m.date_of_birth ? m.date_of_birth instanceof Date ? m.date_of_birth.toISOString().split("T")[0] : String(m.date_of_birth).split("T")[0] : "",
          phone: m.phone || "",
          heightCm: m.height_cm ? parseFloat(m.height_cm) : void 0,
          weightKg: m.pre_pregnancy_weight_kg ? parseFloat(m.pre_pregnancy_weight_kg) : void 0,
          languagePref: m.language_pref || "kh"
        },
        pregnancyProfile: {
          id: p?.id || `preg-${m.id}`,
          motherProfileId: m.id,
          edd: eddStr || "2026-11-20",
          lmp: p?.lmp ? String(p.lmp).split("T")[0] : void 0,
          gravida: p?.gravida || 1,
          para: p?.para || 0,
          currentWeek,
          trimester
        },
        medicalInfo: {
          id: med?.id || `med-${m.id}`,
          motherProfileId: m.id,
          bloodType: med?.blood_type || "",
          allergies: med?.allergies || "",
          existingConditions: med?.existing_conditions || "",
          currentMedications: med?.current_medications || ""
        },
        emergencyContacts: contacts,
        sharingPermission: {
          id: sp?.id || `share-${m.id}`,
          motherProfileId: m.id,
          doctorProfileId: sp?.doctor_profile_id || "doctor-001",
          grantedAt: sp?.granted_at ? sp.granted_at instanceof Date ? sp.granted_at.toISOString() : String(sp.granted_at) : (/* @__PURE__ */ new Date()).toISOString(),
          expiresAt: sp?.expires_at ? sp.expires_at instanceof Date ? sp.expires_at.toISOString() : String(sp.expires_at) : void 0,
          recordTypesGranted: sp?.record_types_granted && typeof sp.record_types_granted === "string" ? JSON.parse(sp.record_types_granted) : sp?.record_types_granted || ["ultrasound", "lab_test", "prescription", "vaccine", "doctor_note"]
        },
        recordCount: userRecords.length,
        lastRecordDate,
        nextAppointmentDate
      };
    });
    res.json(patients);
  } catch (err) {
    console.error("GET /api/doctor/patients error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.get("/api/doctor/patient/:motherProfileId/records", async (req, res) => {
  try {
    const { motherProfileId } = req.params;
    const [motherRows] = await pool.execute(
      "SELECT id, user_id FROM mother_profiles WHERE id = ?",
      [motherProfileId]
    );
    const userId = motherRows.length > 0 ? motherRows[0].user_id : null;
    const [rows] = await pool.execute(
      `SELECT id, user_id, mother_profile_id, title, category, date, week, trimester,
              facility, doctor, notes, status, image_attachment,
              tags, extracted_data, created_at
       FROM medical_records
       WHERE mother_profile_id = ? OR (user_id = ? AND user_id IS NOT NULL)
       ORDER BY date DESC`,
      [motherProfileId, userId]
    );
    const records = rows.map((row) => {
      let formattedDate = "";
      if (row.date instanceof Date) {
        formattedDate = row.date.toISOString().split("T")[0];
      } else if (row.date) {
        formattedDate = String(row.date).split("T")[0];
      }
      return {
        id: row.id,
        userId: row.user_id,
        motherProfileId: row.mother_profile_id,
        title: row.title,
        category: row.category,
        date: formattedDate,
        examDate: formattedDate,
        week: row.week,
        trimester: row.trimester,
        facility: row.facility,
        doctor: row.doctor,
        notes: row.notes,
        status: row.status,
        imageAttachment: row.image_attachment,
        imageUrl: row.image_attachment,
        tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
        extractedData: typeof row.extracted_data === "string" ? JSON.parse(row.extracted_data) : row.extracted_data,
        createdAt: row.created_at
      };
    });
    res.json(records);
  } catch (err) {
    console.error("GET /api/doctor/patient/:motherProfileId/records error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.get("/api/doctor/patient/:motherProfileId/appointments", async (req, res) => {
  try {
    const { motherProfileId } = req.params;
    const [motherRows] = await pool.execute(
      "SELECT id, user_id FROM mother_profiles WHERE id = ?",
      [motherProfileId]
    );
    const userId = motherRows.length > 0 ? motherRows[0].user_id : null;
    const [rows] = await pool.execute(
      `SELECT * FROM appointments
       WHERE mother_profile_id = ? OR (user_id = ? AND user_id IS NOT NULL)`,
      [motherProfileId, userId]
    );
    const appointments = rows.map((row) => {
      const rawDate = row.date !== void 0 ? row.date : row.appt_date;
      const rawTime = row.time !== void 0 ? row.time : row.appt_time;
      const rawImage = row.image_attachment !== void 0 ? row.image_attachment : row.imageAttachment;
      let formattedDate = "";
      if (rawDate instanceof Date) {
        formattedDate = `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, "0")}-${String(rawDate.getDate()).padStart(2, "0")}`;
      } else if (rawDate) {
        formattedDate = String(rawDate).split("T")[0];
      }
      let formattedTime = "";
      if (typeof rawTime === "string") {
        formattedTime = rawTime.slice(0, 5);
      } else if (rawTime) {
        formattedTime = String(rawTime);
      }
      return {
        id: row.id,
        userId: row.user_id || row.userId,
        motherProfileId: row.mother_profile_id || row.motherProfileId,
        title: row.title || "",
        date: formattedDate,
        time: formattedTime,
        apptDate: formattedDate,
        apptTime: formattedTime,
        hospital: row.hospital || "",
        doctor: row.doctor || "",
        notes: row.notes || "",
        completed: !!row.completed,
        type: row.type || "Other",
        reminder: row.reminder || "none",
        imageAttachment: rawImage || null,
        createdAt: row.created_at || null
      };
    });
    appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    res.json(appointments);
  } catch (err) {
    console.error("GET /api/doctor/patient/:motherProfileId/appointments error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.post("/api/doctor/records/:recordId/notes", async (req, res) => {
  try {
    const { recordId } = req.params;
    const { note, doctorName } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ error: "Note text is required" });
    }
    const [rows] = await pool.execute(
      "SELECT notes FROM medical_records WHERE id = ?",
      [recordId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    const existingNotes = rows[0].notes || "";
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const drHeader = doctorName ? `Dr. ${doctorName}` : "Attending Healthcare Provider";
    const noteEntry = `

\u{1F4DD} [Clinical Note by ${drHeader} - ${timestamp}]:
${note.trim()}`;
    const updatedNotes = (existingNotes + noteEntry).trim();
    await pool.execute(
      "UPDATE medical_records SET notes = ? WHERE id = ?",
      [updatedNotes, recordId]
    );
    res.json({ success: true, notes: updatedNotes });
  } catch (err) {
    console.error("POST /api/doctor/records/:recordId/notes error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});
app.get("/api/family-members/:motherProfileId", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM family_members WHERE mother_profile_id = ?", [req.params.motherProfileId]);
    res.json(rows.map((r) => ({ id: r.id, motherProfileId: r.mother_profile_id, name: r.name, phone: r.phone, relation: r.relation, canEdit: !!r.can_edit })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/family-members", async (req, res) => {
  try {
    const { motherProfileId, name, phone, relation, canEdit } = req.body;
    const id = "fam-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
    await pool.execute("INSERT INTO family_members (id, mother_profile_id, name, phone, relation, can_edit) VALUES (?, ?, ?, ?, ?, ?)", [id, motherProfileId, name, phone, relation || "Partner", !!canEdit]);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/family-members/:id", async (req, res) => {
  try {
    const { name, phone, relation, canEdit } = req.body;
    await pool.execute("UPDATE family_members SET name = COALESCE(?, name), phone = COALESCE(?, phone), relation = COALESCE(?, relation), can_edit = COALESCE(?, can_edit) WHERE id = ?", [name || null, phone || null, relation || null, canEdit !== void 0 ? !!canEdit : null, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/family-members/:id", async (req, res) => {
  try {
    await pool.execute("DELETE FROM family_members WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({ status: "ok", database: "connected", time: (/* @__PURE__ */ new Date()).toISOString() });
  } catch {
    res.json({ status: "ok", database: "disconnected", time: (/* @__PURE__ */ new Date()).toISOString() });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    console.log("Serving static production build from dist.");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
