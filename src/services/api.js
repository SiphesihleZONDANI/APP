const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async login(email, password, role) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    if (!res.ok) throw new Error('Failed to sign in');
    return res.json();
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  async deleteAccount(userId) {
    const res = await fetch(`${API_BASE}/auth/delete-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  async getReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports?${query}`);
    return res.json();
  },

  async getReportById(id, officerName = null) {
    const query = officerName ? `?officer=${encodeURIComponent(officerName)}` : '';
    const res = await fetch(`${API_BASE}/reports/${id}${query}`);
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  },

  async submitReport(reportData) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit report');
    }
    return res.json();
  },

  async triggerQuickSOS(sosData) {
    const res = await fetch(`${API_BASE}/emergency/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sosData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to trigger SOS');
    }
    return res.json();
  },

  async updateReportStatus(id, status, officer, note) {
    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, officer, note })
    });
    return res.json();
  },

  async addOfficerNote(id, officer, note) {
    const res = await fetch(`${API_BASE}/reports/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officer, note })
    });
    return res.json();
  },

  async assignOfficer(id, assignmentData) {
    const res = await fetch(`${API_BASE}/reports/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData)
    });
    return res.json();
  },

  async dispatchPoliceUnit(reportId, unitId, dispatcher) {
    const res = await fetch(`${API_BASE}/police/dispatch-unit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, unitId, dispatcher })
    });
    return res.json();
  },

  async getPoliceStats() {
    const res = await fetch(`${API_BASE}/police/stats`);
    return res.json();
  },

  async getPoliceOfficers() {
    const res = await fetch(`${API_BASE}/police/officers`);
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/police/audit-logs`);
    return res.json();
  },

  async getContacts(userId) {
    const res = await fetch(`${API_BASE}/contacts?userId=${userId}`);
    return res.json();
  },

  async addContact(contactData) {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    return res.json();
  },

  async updateContact(id, contactData) {
    const res = await fetch(`${API_BASE}/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    return res.json();
  },

  async deleteContact(id) {
    const res = await fetch(`${API_BASE}/contacts/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async sendTestSms(contactId, senderName) {
    const res = await fetch(`${API_BASE}/contacts/test-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, senderName })
    });
    return res.json();
  },

  async uploadEvidence(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  }
};
