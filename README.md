# 🌸 FLOWER - Maternal Health Record App

**One place for all your pregnancy records ready for any hospital anytime.**

FLOWER is a digital maternal health application for pregnant women in Cambodia, providing emergency access to medical records during labor and hospital visits.

## 🎯 Features

### For Mothers
- ✅ Digital pregnancy profile with medical history
- ✅ Weekly checkup tracking (weight, BP, symptoms, fetal kicks)
- ✅ Medical document upload (ultrasounds, lab results, prescriptions)
- ✅ Emergency health profile with QR code + 6-digit PIN access
- 🔄 Offline support (coming soon)
- 🌐 Khmer language support (coming soon)

### For Doctors
- ✅ Patient search and management
- ✅ View complete patient medical history
- ✅ Add clinical notes with high-risk flags
- ✅ Emergency profile access via QR code

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation & Run

#### Option 1: Using the startup script (Recommended)
```bash
# Make the script executable
chmod +x start.sh

# Run the app
./start.sh
```

#### Option 2: Manual startup
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Terminal 1 - Start backend (port 3001)
cd server
npm run dev

# Terminal 2 - Start frontend (port 5173)
npm run dev
```

### Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 📱 User Accounts

### Register New Account
1. Open http://localhost:5173/register
2. Select role (Mother or Doctor)
3. Enter phone number and 4-digit PIN
4. For mothers: Enter name and due date (required)

### Demo Accounts (After registration)
Create your own accounts using the registration page.

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Express.js** - API server
- **SQLite (sql.js)** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## 📂 Project Structure

```
flower/
├── src/                    # Frontend React app
│   ├── api/               # API client
│   ├── components/        # Reusable components
│   ├── context/           # React contexts (Auth, Language, Offline)
│   ├── pages/             # Page components
│   │   ├── auth/         # Login, Register
│   │   ├── mother/       # Mother dashboard, profile, checkups
│   │   └── doctor/       # Doctor dashboard, patient views
│   └── locales/           # Khmer translations
├── server/                # Backend Express API
│   ├── routes/           # API endpoints
│   │   ├── auth.js       # Registration, login
│   │   ├── mothers.js    # Mother profile & checkups
│   │   ├── doctors.js    # Doctor patient management
│   │   ├── uploads.js    # File uploads
│   │   └── emergency.js  # Emergency QR/PIN access
│   ├── middleware/       # JWT authentication
│   ├── database.js       # SQLite database setup
│   └── uploads/          # Uploaded medical documents
└── start.sh              # Startup script

```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with phone + PIN
- `GET /api/auth/me` - Get current user profile

### Mothers
- `GET /api/mothers/profile` - Get mother profile
- `POST /api/mothers/profile` - Create/update profile
- `GET /api/mothers/checkups` - List checkups
- `POST /api/mothers/checkups` - Add checkup
- `GET /api/mothers/notes` - Get doctor notes
- `GET /api/mothers/uploads` - Get uploaded documents

### Doctors
- `GET /api/doctors/patients` - List all patients
- `GET /api/doctors/patients/search?q=phone` - Search patients
- `GET /api/doctors/patients/:id` - Get patient details
- `POST /api/doctors/patients/:id/notes` - Add clinical note
- `PUT /api/doctors/notes/:id/urgent` - Toggle urgent flag

### Emergency Access
- `POST /api/emergency/generate` - Generate QR + PIN
- `GET /api/emergency/verify-pin?pin=123456` - Verify PIN
- `GET /api/emergency/:code` - Get emergency profile (public)
- `GET /api/emergency/my/codes` - List own access codes
- `DELETE /api/emergency/deactivate/:code` - Deactivate code

### File Upload
- `POST /api/uploads` - Upload medical document
- `GET /api/uploads/:id` - Get upload info

## 🔐 Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens (30-day expiry)
- Role-based access control
- Emergency access logging with facility tracking
- File upload validation (type, size limits)

## 🌐 Language Support

The app supports Khmer (Cambodia) with English/French medical terminology (standard practice in Cambodian healthcare).

## 📊 Database Schema

### Tables
- `users` - Both mother and doctor accounts
- `mother_profiles` - Maternal health data
- `weekly_checkups` - Weekly symptom and vitals tracking
- `doctor_notes` - Clinical notes
- `uploads` - Medical documents
- `emergency_access_logs` - QR/PIN access tracking
- `doctor_patient_links` - Doctor-patient relationships

## 🎨 Design Theme

- **Primary Color**: Sage Green (#2D7A4F)
- **Accent**: Warm Rose/Pink
- **Typography**: Noto Sans Khmer (for Khmer text)
- **Aesthetic**: Calming maternal healthcare theme

## 🚧 Development Status

### ✅ Completed (35%)
- Backend API (all endpoints)
- Database schema
- Authentication system
- Registration & Login UI
- API client setup

### 🔄 In Progress
- Mother profile UI
- Weekly checkup UI
- Document upload UI
- Emergency profile card

### 📋 Todo
- Doctor dashboard UI
- Offline support
- Full Khmer translations
- Subscription/plans page
- UI polish & theming
- Testing & demo data

## 📄 License

This is a prototype/demo application for maternal health services in Cambodia.

## 🤝 Contributing

This project is in active development. Contributions welcome!

---

Made with ❤️ for maternal health in Cambodia
# FlowErs
