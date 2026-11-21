import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

import { users, emergencyContacts, reports, auditLogs } from './data.js';
import { mockPoliceDispatcher } from './mockPoliceApi.js';
import { mockSmsService } from './mockSmsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage for uploaded evidence
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `evidence-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use('/uploads', express.static(uploadsDir));

// In-memory runtime state copied from initial data
let dbUsers = [...users];
let dbContacts = [...emergencyContacts];
let dbReports = [...reports];
let dbAuditLogs = [...auditLogs];

// Helper to log officer audit
function logAudit(officer, action, reportId, reason = '') {
  const audit = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    officer: officer || 'System / Anonymous',
    action,
    reportId,
    ipAddress: '10.40.12.94',
    reason
  };
  dbAuditLogs.unshift(audit);
  if (dbAuditLogs.length > 200) dbAuditLogs.pop();
  return audit;
}

// ==========================================
// SYSTEM & HEALTH
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'SafeHer API',
    version: '1.0.0',
    mockPoliceApiConnected: true,
    cadStatus: 'CONNECTED (SIMULATED GATEWAY)',
    serverTime: new Date().toISOString(),
    simulationNotice: 'SafeHer Prototype Sandbox: Real 911/police integration is simulated for safe testing.'
  });
});

// ==========================================
// AUTHENTICATION
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  
  // Find matching user
  let user = dbUsers.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  
  if (!user && role === 'POLICE_OFFICER') {
    user = dbUsers.find(u => u.role === 'POLICE_OFFICER');
  } else if (!user) {
    user = dbUsers.find(u => u.role === 'CITIZEN');
  }

  res.json({
    token: `safeher-token-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      badgeNumber: user.badgeNumber || null,
      department: user.department || null,
      rank: user.rank || null,
      avatar: user.avatar,
      medicalNotes: user.medicalNotes || '',
      emergencyAddress: user.emergencyAddress || '',
      privacySettings: user.privacySettings || {}
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, medicalNotes } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone number are required.' });
  }

  const existing = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone,
    password: password || 'defaultpass',
    role: 'CITIZEN',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    medicalNotes: medicalNotes || '',
    emergencyAddress: '',
    privacySettings: {
      shareLocationWithPolice: true,
      shareMedicalWithDispatch: true,
      anonymousReportingOption: false,
      retentionDays: 90
    }
  };

  dbUsers.push(newUser);

  // Add default demo emergency contact
  dbContacts.push({
    id: `contact-${Date.now()}`,
    userId: newUser.id,
    name: 'Primary Trusted Contact',
    relationship: 'Family Member',
    phone: '+1 (555) 019-2834',
    email: 'trusted@family.com',
    autoNotify: true,
    isPrimary: true
  });

  res.status(201).json({
    token: `safeher-token-${newUser.id}`,
    user: newUser
  });
});

app.put('/api/auth/profile', (req, res) => {
  const { userId, name, phone, medicalNotes, emergencyAddress, privacySettings } = req.body;
  const user = dbUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (medicalNotes !== undefined) user.medicalNotes = medicalNotes;
  if (emergencyAddress !== undefined) user.emergencyAddress = emergencyAddress;
  if (privacySettings) user.privacySettings = { ...user.privacySettings, ...privacySettings };

  res.json({ success: true, user });
});

// Privacy Account Deletion
app.post('/api/auth/delete-account', (req, res) => {
  const { userId } = req.body;
  dbUsers = dbUsers.filter(u => u.id !== userId);
  dbReports = dbReports.filter(r => r.userId !== userId);
  dbContacts = dbContacts.filter(c => c.userId !== userId);

  res.json({
    success: true,
    message: 'All personal data, active contacts, and report logs have been permanently erased under data privacy rights.'
  });
});

// ==========================================
// EMERGENCY CONTACTS
// ==========================================
app.get('/api/contacts', (req, res) => {
  const userId = req.query.userId || 'user-elena-101';
  const contacts = dbContacts.filter(c => c.userId === userId);
  res.json(contacts);
});

app.post('/api/contacts', (req, res) => {
  const { userId, name, relationship, phone, email, autoNotify } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Contact name and phone number are required.' });
  }

  const newContact = {
    id: `contact-${Date.now()}`,
    userId: userId || 'user-elena-101',
    name,
    relationship: relationship || 'Friend',
    phone,
    email: email || '',
    autoNotify: autoNotify !== undefined ? autoNotify : true,
    isPrimary: false
  };

  dbContacts.push(newContact);
  res.status(201).json(newContact);
});

app.put('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const contact = dbContacts.find(c => c.id === id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  const { name, relationship, phone, email, autoNotify, isPrimary } = req.body;
  if (name) contact.name = name;
  if (relationship) contact.relationship = relationship;
  if (phone) contact.phone = phone;
  if (email !== undefined) contact.email = email;
  if (autoNotify !== undefined) contact.autoNotify = autoNotify;
  if (isPrimary !== undefined) contact.isPrimary = isPrimary;

  res.json(contact);
});

app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  dbContacts = dbContacts.filter(c => c.id !== id);
  res.json({ success: true, message: 'Contact removed' });
});

app.post('/api/contacts/test-sms', (req, res) => {
  const { contactId, senderName } = req.body;
  const contact = dbContacts.find(c => c.id === contactId);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  const smsResult = mockSmsService.sendTestSms(contact, senderName || 'Elena Rostova');
  res.json({ success: true, smsResult });
});

// ==========================================
// CRIME & INCIDENT REPORTS
// ==========================================
app.get('/api/reports', (req, res) => {
  const { userId, role, status, incidentType, emergencyLevel, search } = req.query;

  let filtered = [...dbReports];

  // If citizen, only view their own
  if (role === 'CITIZEN' && userId) {
    filtered = filtered.filter(r => r.userId === userId);
  }

  // Filter conditions for police dashboard
  if (status && status !== 'ALL') {
    filtered = filtered.filter(r => r.status === status);
  }
  if (incidentType && incidentType !== 'ALL') {
    filtered = filtered.filter(r => r.incidentType === incidentType);
  }
  if (emergencyLevel && emergencyLevel !== 'ALL') {
    filtered = filtered.filter(r => r.emergencyLevel === emergencyLevel);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.id.toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.location?.address || '').toLowerCase().includes(q) ||
      (r.reporterName || '').toLowerCase().includes(q)
    );
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(filtered);
});

app.get('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const report = dbReports.find(r => r.id === id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  // Log police officer view if officer ID is provided
  if (req.query.officer) {
    logAudit(req.query.officer, 'VIEW_REPORT_DETAILS', id, 'Officer opened incident report view');
  }

  res.json(report);
});

/**
 * Normal Emergency & Crime Report Submission
 */
app.post('/api/reports', async (req, res) => {
  const {
    userId,
    reporterName,
    reporterPhone,
    incidentType,
    emergencyLevel = 'HIGH',
    location,
    description,
    suspectDescription,
    evidence,
    notifyEmergencyContacts = true
  } = req.body;

  if (!incidentType) {
    return res.status(400).json({ error: 'Incident type is required.' });
  }

  const reportId = `SH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const newReport = {
    id: reportId,
    userId: userId || 'user-elena-101',
    reporterName: reporterName || 'Elena Rostova',
    reporterPhone: reporterPhone || '+1 (555) 382-9912',
    incidentType,
    emergencyLevel,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    location: location || {
      lat: 47.6062,
      lng: -122.3321,
      accuracy: 5.0,
      address: 'Downtown Metro Area (GPS coordinates verified)',
      timestamp: new Date().toISOString()
    },
    description: description || '',
    suspectDescription: suspectDescription || {
      gender: '',
      approximateAge: '',
      height: '',
      clothing: '',
      vehicle: '',
      directionOfTravel: ''
    },
    evidence: evidence || {
      photos: [],
      audioUrl: null,
      audioDurationSeconds: 0,
      hasAudio: false
    },
    assignedOfficer: null,
    officerNotes: [],
    statusHistory: [
      {
        status: 'SUBMITTED',
        timestamp: new Date().toISOString(),
        by: reporterName ? `${reporterName} (Citizen)` : 'Citizen'
      }
    ],
    cadTicketId: null,
    emergencyContactsNotified: [],
    isSimulated: true
  };

  // Submit to Mock Police CAD API Gateway
  const cadTicket = await mockPoliceDispatcher.submitReportToMockCAD(newReport);
  newReport.cadTicketId = cadTicket.cadTicketId;
  newReport.status = 'RECEIVED';
  newReport.statusHistory.push({
    status: 'RECEIVED',
    timestamp: new Date().toISOString(),
    by: 'Metro CAD Dispatch System (Simulated Gateway)'
  });

  // Notify Emergency Contacts if enabled
  let contactAlerts = [];
  if (notifyEmergencyContacts) {
    const userContacts = dbContacts.filter(c => c.userId === newReport.userId);
    contactAlerts = await mockSmsService.broadcastEmergencyAlert(newReport, userContacts, newReport.reporterName);
    newReport.emergencyContactsNotified = contactAlerts.map(c => ({
      name: c.recipientName,
      phone: c.recipientPhone,
      status: c.deliveryStatus
    }));
  }

  // Prepend to database
  dbReports.unshift(newReport);

  // Return full response with simulation confirmation
  res.status(201).json({
    success: true,
    report: newReport,
    cadTicket,
    contactAlerts,
    simulationNotice: 'MOCK POLICE CAD INTEGRATION: Report processed via SafeHer simulation endpoint. Real-world dispatch was NOT dialed.'
  });
});

/**
 * 🚨 QUICK SOS 1-TAP EMERGENCY TRIGGER
 */
app.post('/api/emergency/sos', async (req, res) => {
  const { userId, reporterName, reporterPhone, location, quickNote } = req.body;

  const reportId = `SH-${new Date().getFullYear()}-SOS${Math.floor(1000 + Math.random() * 9000)}`;

  const sosReport = {
    id: reportId,
    userId: userId || 'user-elena-101',
    reporterName: reporterName || 'Elena Rostova',
    reporterPhone: reporterPhone || '+1 (555) 382-9912',
    incidentType: 'CRITICAL_SOS',
    emergencyLevel: 'CRITICAL',
    status: 'ASSIGNED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    location: location || {
      lat: 47.6062,
      lng: -122.3321,
      accuracy: 3.5,
      address: 'Current Live GPS Location (Pulsing SOS Lock)',
      timestamp: new Date().toISOString()
    },
    description: quickNote || '🚨 IMMEDIATE EMERGENCY SOS TRIGGERED BY USER. Immediate police dispatch requested.',
    suspectDescription: {
      gender: 'Unknown / Immediate Danger',
      approximateAge: '',
      height: '',
      clothing: '',
      vehicle: '',
      directionOfTravel: ''
    },
    evidence: {
      photos: [],
      audioUrl: null,
      audioDurationSeconds: 0,
      hasAudio: false
    },
    assignedOfficer: {
      name: 'Officer Marcus Vance',
      badge: '#4082',
      unit: 'UNIT-402',
      assignedAt: new Date().toISOString()
    },
    officerNotes: [
      {
        officer: 'CAD Priority-1 Auto Dispatch',
        timestamp: new Date().toISOString(),
        note: '🚨 Priority-1 SOS ping received. Unit 402 dispatched with sirens. ETA 3 minutes.'
      }
    ],
    statusHistory: [
      { status: 'SUBMITTED', timestamp: new Date().toISOString(), by: 'Quick SOS Trigger' },
      { status: 'RECEIVED', timestamp: new Date().toISOString(), by: 'Metro CAD Priority Queue' },
      { status: 'ASSIGNED', timestamp: new Date().toISOString(), by: 'Unit 402 Auto-Assigned' }
    ],
    cadTicketId: null,
    emergencyContactsNotified: [],
    isSimulated: true
  };

  // Submit to Mock CAD
  const cadTicket = await mockPoliceDispatcher.submitReportToMockCAD(sosReport);
  sosReport.cadTicketId = cadTicket.cadTicketId;

  // Broadcast to all trusted contacts immediately
  const userContacts = dbContacts.filter(c => c.userId === sosReport.userId);
  const contactAlerts = await mockSmsService.broadcastEmergencyAlert(sosReport, userContacts, sosReport.reporterName);
  sosReport.emergencyContactsNotified = contactAlerts.map(c => ({
    name: c.recipientName,
    phone: c.recipientPhone,
    status: c.deliveryStatus
  }));

  dbReports.unshift(sosReport);

  res.status(201).json({
    success: true,
    report: sosReport,
    cadTicket,
    contactAlerts,
    simulationNotice: 'SIMULATION NOTICE: SafeHer Mock CAD received emergency ping. In production this dispatches local PSAP.'
  });
});

// Update Report Status (Police)
app.patch('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, officer, note } = req.body;
  const report = dbReports.find(r => r.id === id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const validStatuses = ['SUBMITTED', 'RECEIVED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid report status.' });
  }

  report.status = status;
  report.updatedAt = new Date().toISOString();
  report.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    by: officer || 'Police Dispatcher'
  });

  if (note) {
    report.officerNotes.push({
      officer: officer || 'Police Officer',
      timestamp: new Date().toISOString(),
      note
    });
  }

  logAudit(officer, `STATUS_CHANGE_TO_${status}`, id, note || `Status updated to ${status}`);

  res.json({ success: true, report });
});

// Add Officer Note
app.post('/api/reports/:id/notes', (req, res) => {
  const { id } = req.params;
  const { officer, note } = req.body;
  const report = dbReports.find(r => r.id === id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (!note) return res.status(400).json({ error: 'Note content is required.' });

  const noteEntry = {
    officer: officer || 'Officer Marcus Vance (#4082)',
    timestamp: new Date().toISOString(),
    note
  };

  report.officerNotes.push(noteEntry);
  report.updatedAt = new Date().toISOString();

  logAudit(officer, 'ADDED_OFFICER_NOTE', id, note.substring(0, 50));

  res.json({ success: true, note: noteEntry, report });
});

// Assign Officer
app.post('/api/reports/:id/assign', (req, res) => {
  const { id } = req.params;
  const { officerName, badge, unit, dispatcher } = req.body;
  const report = dbReports.find(r => r.id === id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  report.assignedOfficer = {
    name: officerName || 'Officer Marcus Vance',
    badge: badge || '#4082',
    unit: unit || 'UNIT-402',
    assignedAt: new Date().toISOString()
  };

  if (report.status === 'SUBMITTED' || report.status === 'RECEIVED' || report.status === 'UNDER_REVIEW') {
    report.status = 'ASSIGNED';
    report.statusHistory.push({
      status: 'ASSIGNED',
      timestamp: new Date().toISOString(),
      by: `${dispatcher || 'CAD Dispatcher'} assigned to ${officerName}`
    });
  }

  logAudit(dispatcher, 'ASSIGNED_CASE_TO_OFFICER', id, `Assigned to ${officerName} (${badge})`);

  res.json({ success: true, report });
});

// Quick Dispatch Patrol Unit
app.post('/api/police/dispatch-unit', (req, res) => {
  const { reportId, unitId, dispatcher } = req.body;
  const report = dbReports.find(r => r.id === reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const unit = mockPoliceDispatcher.activeUnits.find(u => u.unitId === unitId) || mockPoliceDispatcher.activeUnits[0];

  report.assignedOfficer = {
    name: unit.officerName,
    badge: unit.badge,
    unit: unit.unitId,
    assignedAt: new Date().toISOString()
  };
  report.status = 'IN_PROGRESS';
  report.statusHistory.push({
    status: 'IN_PROGRESS',
    timestamp: new Date().toISOString(),
    by: `Patrol Unit Dispatched: ${unit.unitId} (${unit.officerName})`
  });
  report.officerNotes.push({
    officer: dispatcher || 'CAD Dispatcher',
    timestamp: new Date().toISOString(),
    note: `Patrol cruiser ${unit.unitId} dispatched with siren code 3. En route to incident coordinates.`
  });

  logAudit(dispatcher, 'DISPATCHED_PATROL_CAR', reportId, `Dispatched ${unit.unitId} to scene`);

  res.json({
    success: true,
    report,
    unit,
    eta: '3-5 minutes',
    simulationNotice: 'Simulated unit dispatch recorded in SafeHer CAD.'
  });
});

// Police Available Officers
app.get('/api/police/officers', (req, res) => {
  res.json(mockPoliceDispatcher.getAvailableOfficers());
});

// Police Dashboard KPIs
app.get('/api/police/stats', (req, res) => {
  const total = dbReports.length;
  const activeSOS = dbReports.filter(r => (r.incidentType === 'CRITICAL_SOS' || r.emergencyLevel === 'CRITICAL') && r.status !== 'RESOLVED').length;
  const pendingReview = dbReports.filter(r => r.status === 'RECEIVED' || r.status === 'UNDER_REVIEW').length;
  const inProgress = dbReports.filter(r => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length;
  const resolved = dbReports.filter(r => r.status === 'RESOLVED').length;

  res.json({
    total,
    activeSOS,
    pendingReview,
    inProgress,
    resolved,
    avgResponseMinutes: 3.8,
    activeUnitsCount: mockPoliceDispatcher.activeUnits.length,
    activeUnits: mockPoliceDispatcher.activeUnits,
    recentAuditCount: dbAuditLogs.length
  });
});

// Police Audit Logs
app.get('/api/police/audit-logs', (req, res) => {
  res.json(dbAuditLogs.slice(0, 50));
});

// File Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// Serve static frontend assets from dist if built
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🛡️ SafeHer Server running on http://localhost:${PORT}`);
  console.log(`📡 Mock Police CAD Gateway: ACTIVE (Simulation Sandbox)`);
});

