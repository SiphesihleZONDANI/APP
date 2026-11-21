/**
 * In-memory and persistent initial state for SafeHer
 */

export const users = [
  {
    id: "user-elena-101",
    name: "Elena Rostova",
    email: "elena@safeher.demo",
    phone: "+1 (555) 382-9912",
    password: "password123",
    role: "CITIZEN",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    medicalNotes: "Asthmatic (inhaler in backpack). Blood Type O+",
    emergencyAddress: "742 Evergreen Terrace, Apt 4B, Metro City",
    privacySettings: {
      shareLocationWithPolice: true,
      shareMedicalWithDispatch: true,
      anonymousReportingOption: false,
      retentionDays: 90
    }
  },
  {
    id: "user-police-marcus",
    name: "Officer Marcus Vance",
    email: "officer.vance@police.metro.gov",
    phone: "+1 (555) 911-4082",
    password: "police123",
    role: "POLICE_OFFICER",
    badgeNumber: "4082",
    department: "Metropolitan Police Dept - Central Precinct Division",
    rank: "Patrol Officer / CAD Dispatch Responder",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "user-police-sarah",
    name: "Sgt. Sarah Chen",
    email: "sgt.chen@police.metro.gov",
    phone: "+1 (555) 911-3190",
    role: "POLICE_OFFICER",
    badgeNumber: "3190",
    department: "Special Victims & Vulnerable Persons Unit",
    rank: "Detective Sergeant",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  }
];

export const emergencyContacts = [
  {
    id: "contact-1",
    userId: "user-elena-101",
    name: "Sophia Rostova",
    relationship: "Sister",
    phone: "+1 (555) 234-8891",
    email: "sophia.rostova@gmail.com",
    autoNotify: true,
    isPrimary: true
  },
  {
    id: "contact-2",
    userId: "user-elena-101",
    name: "Maya Patel",
    relationship: "Best Friend & Roommate",
    phone: "+1 (555) 873-1120",
    email: "maya.patel@design.io",
    autoNotify: true,
    isPrimary: false
  },
  {
    id: "contact-3",
    userId: "user-elena-101",
    name: "David Miller",
    relationship: "Partner",
    phone: "+1 (555) 901-4432",
    email: "d.miller@techcorp.com",
    autoNotify: false,
    isPrimary: false
  }
];

export const reports = [
  {
    id: "SH-2026-91823",
    userId: "user-elena-101",
    reporterName: "Elena Rostova",
    reporterPhone: "+1 (555) 382-9912",
    incidentType: "STALKING",
    emergencyLevel: "HIGH",
    status: "IN_PROGRESS",
    createdAt: "2026-09-24T13:45:00.000Z",
    updatedAt: "2026-09-24T14:15:00.000Z",
    location: {
      lat: 47.6097,
      lng: -122.3331,
      accuracy: 6.2,
      address: "615 Pike St, Convention District, Metro City",
      timestamp: "2026-09-24T13:44:30.000Z"
    },
    description: "An unfamiliar male in a dark gray hooded jacket followed me for 4 blocks from the subway exit into my office parking structure. He stood behind a concrete pillar observing me unlock my vehicle.",
    suspectDescription: {
      gender: "Male",
      approximateAge: "35-40",
      height: "5'10\" - 6'0\"",
      clothing: "Dark gray hoodie, black tactical cargo pants, red-accented running shoes",
      vehicle: "Silver sedan with tinted rear windows (partial plate 7KM...)",
      directionOfTravel: "Fled east toward 7th Ave on foot when I activated app"
    },
    evidence: {
      photos: [
        {
          id: "photo-1",
          url: "https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=600&auto=format&fit=crop&q=80",
          caption: "Parking garage pillar area where suspect was stationed"
        }
      ],
      audioUrl: null,
      audioDurationSeconds: 14,
      hasAudio: true,
      audioNoteText: "[Simulated Voice Memo]: 'He is lingering near the level 2 elevator bay. I am currently locked inside my vehicle waiting for assistance.'"
    },
    assignedOfficer: {
      name: "Officer Marcus Vance",
      badge: "#4082",
      unit: "UNIT-402",
      assignedAt: "2026-09-24T13:52:00.000Z"
    },
    officerNotes: [
      {
        officer: "Officer Marcus Vance (#4082)",
        timestamp: "2026-09-24T13:54:10.000Z",
        note: "Patrol Unit 402 arrived on scene. Building security contacted to pull 615 Pike St garage camera footage. Stationing cruiser at Pike & 7th."
      },
      {
        officer: "Officer Marcus Vance (#4082)",
        timestamp: "2026-09-24T14:15:00.000Z",
        note: "Reporting person confirmed safe in office suite. Reviewing parking garage entry gate access logs."
      }
    ],
    statusHistory: [
      { status: "SUBMITTED", timestamp: "2026-09-24T13:45:00.000Z", by: "Elena Rostova (Citizen)" },
      { status: "RECEIVED", timestamp: "2026-09-24T13:46:12.000Z", by: "Metro CAD Dispatch System" },
      { status: "UNDER_REVIEW", timestamp: "2026-09-24T13:48:30.000Z", by: "Dispatcher Desk #3" },
      { status: "ASSIGNED", timestamp: "2026-09-24T13:52:00.000Z", by: "CAD Auto-Routing (Unit 402)" },
      { status: "IN_PROGRESS", timestamp: "2026-09-24T13:54:10.000Z", by: "Officer Marcus Vance (#4082)" }
    ],
    cadTicketId: "CAD-SIM-849102",
    emergencyContactsNotified: [
      { name: "Sophia Rostova", phone: "+1 (555) 234-8891", status: "DELIVERED" },
      { name: "Maya Patel", phone: "+1 (555) 873-1120", status: "DELIVERED" }
    ],
    isSimulated: true
  },
  {
    id: "SH-2026-88412",
    userId: "user-elena-101",
    reporterName: "Elena Rostova",
    reporterPhone: "+1 (555) 382-9912",
    incidentType: "HARASSMENT",
    emergencyLevel: "MEDIUM",
    status: "UNDER_REVIEW",
    createdAt: "2026-09-23T19:10:00.000Z",
    updatedAt: "2026-09-23T19:30:00.000Z",
    location: {
      lat: 47.6145,
      lng: -122.3421,
      accuracy: 8.5,
      address: "2100 4th Ave, Belltown Transit Hub, Metro City",
      timestamp: "2026-09-23T19:09:40.000Z"
    },
    description: "Repeated verbal catcalling, intrusive physical intimidation and blocking sidewalk transit path outside the corner convenience shop.",
    suspectDescription: {
      gender: "Male",
      approximateAge: "25-30",
      height: "5'9\"",
      clothing: "Blue denim vest over black long sleeve, green baseball cap",
      vehicle: "None / Pedestrian",
      directionOfTravel: "Loitering near bus stop 44"
    },
    evidence: {
      photos: [],
      audioUrl: null,
      audioDurationSeconds: 0,
      hasAudio: false
    },
    assignedOfficer: null,
    officerNotes: [
      {
        officer: "Dispatcher Martinez (#2810)",
        timestamp: "2026-09-23T19:25:00.000Z",
        note: "Transit sector beat notified. Increased patrol sweep requested between 7pm - 10pm along 4th Ave corridor."
      }
    ],
    statusHistory: [
      { status: "SUBMITTED", timestamp: "2026-09-23T19:10:00.000Z", by: "Elena Rostova" },
      { status: "RECEIVED", timestamp: "2026-09-23T19:11:05.000Z", by: "Metro CAD Dispatch" },
      { status: "UNDER_REVIEW", timestamp: "2026-09-23T19:25:00.000Z", by: "Dispatcher Martinez" }
    ],
    cadTicketId: "CAD-SIM-719324",
    emergencyContactsNotified: [
      { name: "Sophia Rostova", phone: "+1 (555) 234-8891", status: "DELIVERED" }
    ],
    isSimulated: true
  },
  {
    id: "SH-2026-76490",
    userId: "user-elena-101",
    reporterName: "Elena Rostova",
    reporterPhone: "+1 (555) 382-9912",
    incidentType: "DOMESTIC_VIOLENCE",
    emergencyLevel: "CRITICAL",
    status: "RESOLVED",
    createdAt: "2026-09-18T22:15:00.000Z",
    updatedAt: "2026-09-19T02:40:00.000Z",
    location: {
      lat: 47.6040,
      lng: -122.3290,
      accuracy: 4.1,
      address: "1201 3rd Ave, Central Financial District, Metro City",
      timestamp: "2026-09-18T22:14:15.000Z"
    },
    description: "Violation of restraining order. Individual appeared at apartment entrance banging loudly on door, uttering verbal threats.",
    suspectDescription: {
      gender: "Male",
      approximateAge: "33",
      height: "6'1\"",
      clothing: "Black jacket, dark jeans",
      vehicle: "Black SUV",
      directionOfTravel: "Fled in vehicle when alarm sounded"
    },
    evidence: {
      photos: [
        {
          id: "photo-2",
          url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80",
          caption: "Doorbell camera capture of subject violating perimeter order"
        }
      ],
      audioUrl: null,
      audioDurationSeconds: 22,
      hasAudio: true,
      audioNoteText: "[Recorded Dispatch Call / Audio Memo]: 'Subject left premises after 3 minutes. I have order #PO-2026-4411 active.'"
    },
    assignedOfficer: {
      name: "Sgt. Sarah Chen",
      badge: "#3190",
      unit: "UNIT-207",
      assignedAt: "2026-09-18T22:18:00.000Z"
    },
    officerNotes: [
      {
        officer: "Sgt. Sarah Chen (#3190)",
        timestamp: "2026-09-18T22:24:00.000Z",
        note: "Unit 207 arrived. Perimeter secured. Subject not on scene. Restraining order verified active in state registry."
      },
      {
        officer: "Sgt. Sarah Chen (#3190)",
        timestamp: "2026-09-19T01:10:00.000Z",
        note: "Subject apprehended by auxiliary patrol near Highway 99 on-ramp. Transported to precinct for processing. Victim safety plan refreshed."
      },
      {
        officer: "Sgt. Sarah Chen (#3190)",
        timestamp: "2026-09-19T02:40:00.000Z",
        note: "Case closed as apprehended. Follow-up assigned to Victim Advocacy Services."
      }
    ],
    statusHistory: [
      { status: "SUBMITTED", timestamp: "2026-09-18T22:15:00.000Z", by: "Elena Rostova" },
      { status: "RECEIVED", timestamp: "2026-09-18T22:15:45.000Z", by: "Metro CAD Dispatch" },
      { status: "ASSIGNED", timestamp: "2026-09-18T22:18:00.000Z", by: "CAD Priority-1 Dispatch" },
      { status: "IN_PROGRESS", timestamp: "2026-09-18T22:24:00.000Z", by: "Sgt. Sarah Chen" },
      { status: "RESOLVED", timestamp: "2026-09-19T02:40:00.000Z", by: "Sgt. Sarah Chen" }
    ],
    cadTicketId: "CAD-SIM-410098",
    emergencyContactsNotified: [
      { name: "Sophia Rostova", phone: "+1 (555) 234-8891", status: "DELIVERED" },
      { name: "Maya Patel", phone: "+1 (555) 873-1120", status: "DELIVERED" }
    ],
    isSimulated: true
  },
  {
    id: "SH-2026-94001",
    userId: "user-anonymous",
    reporterName: "Anonymous Citizen",
    reporterPhone: "Confidential (Protected)",
    incidentType: "ASSAULT",
    emergencyLevel: "CRITICAL",
    status: "RECEIVED",
    createdAt: "2026-09-24T14:30:00.000Z",
    updatedAt: "2026-09-24T14:30:10.000Z",
    location: {
      lat: 47.6025,
      lng: -122.3315,
      accuracy: 5.0,
      address: "Pioneer Square Alley, 1st Ave S & S Main St, Metro City",
      timestamp: "2026-09-24T14:29:55.000Z"
    },
    description: "Physical struggle witnessed. A woman was grabbed by two individuals attempting to drag her into an unlit alleyway. Bystander shouted and attackers dispersed toward waterfront.",
    suspectDescription: {
      gender: "Two males",
      approximateAge: "20-25",
      height: "Both approx 5'11\"",
      clothing: "Black hoodies, one wearing yellow safety vest",
      vehicle: "None seen",
      directionOfTravel: "Ran west toward Alaskan Way"
    },
    evidence: {
      photos: [],
      audioUrl: null,
      audioDurationSeconds: 0,
      hasAudio: false
    },
    assignedOfficer: null,
    officerNotes: [],
    statusHistory: [
      { status: "SUBMITTED", timestamp: "2026-09-24T14:30:00.000Z", by: "Anonymous Reporting Mode" },
      { status: "RECEIVED", timestamp: "2026-09-24T14:30:10.000Z", by: "Metro CAD Dispatch System" }
    ],
    cadTicketId: "CAD-SIM-992104",
    emergencyContactsNotified: [],
    isSimulated: true
  }
];

export const auditLogs = [
  {
    id: "audit-1",
    timestamp: "2026-09-24T14:20:00.000Z",
    officer: "Officer Marcus Vance (#4082)",
    action: "VIEW_REPORT_DETAILS",
    reportId: "SH-2026-91823",
    ipAddress: "10.40.12.94",
    reason: "Dispatched patrol unit case evaluation"
  },
  {
    id: "audit-2",
    timestamp: "2026-09-24T13:54:10.000Z",
    officer: "Officer Marcus Vance (#4082)",
    action: "STATUS_CHANGE_TO_IN_PROGRESS",
    reportId: "SH-2026-91823",
    ipAddress: "10.40.12.94",
    reason: "Arrived at 615 Pike St garage"
  },
  {
    id: "audit-3",
    timestamp: "2026-09-23T19:25:00.000Z",
    officer: "Dispatcher Martinez (#2810)",
    action: "STATUS_CHANGE_TO_UNDER_REVIEW",
    reportId: "SH-2026-88412",
    ipAddress: "10.40.10.15",
    reason: "Transit beat assessment"
  },
  {
    id: "audit-4",
    timestamp: "2026-09-19T02:40:00.000Z",
    officer: "Sgt. Sarah Chen (#3190)",
    action: "RESOLVED_INCIDENT",
    reportId: "SH-2026-76490",
    ipAddress: "10.40.14.02",
    reason: "Subject apprehended and processed"
  }
];
