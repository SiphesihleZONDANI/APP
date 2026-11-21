# 🛡️ SafeHer — Rapid Emergency & Crime Reporting Mobile App for Women

**SafeHer** is a modern, secure, and accessible mobile-first application engineered to empower women to quickly report crimes, threats, harassment, domestic abuse, stalking, and life-threatening emergencies to police CAD dispatch and trusted emergency contacts with minimal steps under extreme stress.

---

## 🌟 Key Highlights & Capabilities

### 1. 🚨 Rapid Crime Reporting Flow (Sub-60s Submission)
- **Instant GPS Lock:** Auto-locates the user with high-accuracy HTML5 Geolocation, reverse-geocodes street addresses, and offers interactive Leaflet map pin adjustment or manual entry fallback.
- **10 Core Incident Classifications:**
  1. Assault
  2. Sexual assault
  3. Domestic violence
  4. Harassment
  5. Stalking
  6. Robbery
  7. Kidnapping
  8. Threats
  9. Missing person
  10. Other emergency
- **Multi-Modal Evidence Capture:**
  - Real-time voice memo audio recorder with waveform visualizer and preset test distress memos.
  - Photo and video attachment with live previews and realistic crime scene presets.
  - Structured suspect profiler (gender, approximate age, height, clothing, vehicle plate, escape direction).
- **Auto-SMS Notification Blast:** Automatically notifies configured family and trusted partners with live GPS tracking links.
- **Unique Report ID:** Every submission generates a unique tracking token (e.g., `SH-2026-91823`).

### 2. ⚡ 1-Tap Quick SOS Feature
- Prominent one-touch emergency trigger directly on the home screen.
- Optional 3-second safety cancellation window with sound and countdown.
- Auto-locks GPS coordinates, creates a Priority-1 emergency CAD ticket, and immediately blasts SMS alerts to all active trusted contacts.
- Live progress feedback clearly displays what actions were successfully executed.

### 3. 🚓 Police / Administrator CAD Dashboard (`/police`)
- Role-based secure dispatch console designed for law enforcement personnel and emergency dispatchers.
- **Incident Radar Map:** Leaflet map rendering all city reports color-coded by urgency (Red = Critical SOS, Orange = High, Yellow = Under Review, Green = Resolved), plus active patrol cars.
- **Incident Inspector:** Full incident narrative, suspect profiling, audio playback, attached photos, and victim medical notes.
- **One-Click Unit Dispatch:** Dispatches patrol units (e.g., Unit 402 - Officer Marcus Vance) with automated sirens and estimated response times (ETA).
- **Officer Case Assignment & Status Progression:** Full lifecycle management (`SUBMITTED` → `RECEIVED` → `UNDER_REVIEW` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`).
- **Internal Case Notes & Audit Trail:** Officer internal notes log and a complete immutable audit trail recording every badge ID, IP address, and timestamp.
- **Simulated Victim Callback:** Encrypted CAD VoIP dialer simulation.

### 4. 🤫 Discreet Stealth / Camouflage Mode ("Quick Exit")
- In situations involving domestic abuse or stalking where an assailant might inspect the victim's phone, one tap on the discreet disguise icon instantly masks the app as a functional standard **Calculator** or **Weather** screen.
- Secret PIN code (`7777 =` or `911 =`) or tapping the unmask label immediately restores the SafeHer interface.

### 5. 📞 Emergency Contacts Management
- Manage trusted family, partners, and friends.
- Toggle automatic emergency notification broadcasts per contact.
- **"Send Test SMS" Simulator:** Allows users to test carrier SMS delivery and inspect the exact message received.
- **"I'm Safe" Quick Check-in:** Sends an instant reassuring ping to contacts with one touch.

### 6. ℹ️ Safety Resources, Safe Walk Timer & Data Sovereignty
- 24/7 direct dial links to 911, 112, National Domestic Violence Hotline (1-800-799-SAFE), RAINN (1-800-656-4673), and Crisis Text Line.
- **Safe Walk Timer:** Countdown timer that prompts the user upon arrival; if not confirmed, automatically alerts trusted contacts.
- **Right to Erasure (GDPR / Privacy Shield):** 1-click option to permanently purge all user records, reports, evidence, and contacts from the system.

---

## 🏛️ Architecture & Tech Stack

```
SafeHer
 ├── server/
 │    ├── index.js            # Express API Server (Auth, Reports, CAD, Contacts, Audit, Uploads)
 │    ├── mockPoliceApi.js    # Dedicated Mock Police CAD Dispatch Gateway (Sandbox environment)
 │    ├── mockSmsService.js   # Carrier SMS Notification Dispatch Simulator
 │    └── data.js             # Initial state database with realistic demo accounts & crime reports
 ├── src/
 │    ├── components/
 │    │    ├── citizen/       # HomeScreen, CrimeReportFlow, MyReportsScreen, EmergencyContactsScreen, etc.
 │    │    ├── police/        # PoliceDashboard CAD command center
 │    │    └── common/        # MapComponent, DisguiseScreen, AudioRecorder, CameraPicker, Navbar, BottomNav
 │    ├── context/            # AuthContext, LocationContext, DisguiseContext
 │    ├── services/           # API Client
 │    ├── App.jsx             # Main application container with mobile frame & dark mode toggle
 │    └── index.css           # Tailwind CSS & animations
 ├── vite.config.js           # Vite configuration with proxy to backend
 └── package.json
```

---

## 🔒 Security & Privacy Practices

- **Zero Public Exposure:** Victim locations are never exposed publicly.
- **Explicit Hardware Permissions:** Camera, microphone, and GPS permissions require explicit consent.
- **Encryption Simulation:** All payloads simulate TLS 1.3 in transit and AES-256 at rest.
- **Audit Logging:** Every report view or status update by an officer is logged with badge, IP, timestamp, and justification.
- **Transparent Simulation Notice:** Clearly labelled as a mock police integration so users are not misled during testing.

---

## 👥 Demo Accounts

You can seamlessly switch accounts using the role switcher in the top navigation bar:

1. **Citizen User:**
   - **Name:** Elena Rostova
   - **Email:** `elena@safeher.demo`
   - **Phone:** `+1 (555) 382-9912`
   - **Role:** Citizen

2. **Police Officer / CAD Dispatcher:**
   - **Name:** Officer Marcus Vance
   - **Badge:** `#4082`
   - **Department:** Metropolitan Police Dept - Central Precinct
   - **Role:** Police Officer

---

## 🚀 Running the App

### Option A: Unified Server (Frontend + Backend on Port 3001)
```bash
cd c:\Users\Admin\OneDrive\Apps\safeher
node server/index.js
```
Open your browser to: **`http://localhost:3001`**

### Option B: Vite Dev Mode with Hot Reload
```bash
# Terminal 1: Backend
node server/index.js

# Terminal 2: Frontend
npm run dev
```
Open your browser to: **`http://localhost:5173`**
