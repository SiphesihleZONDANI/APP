/**
 * SafeHer Mock Emergency SMS & Alert Notification Service
 * 
 * NOTE: Simulates carrier SMS (Twilio / AWS SNS / Sinch) dispatch to trusted family/contacts.
 * All messages are tagged with simulation metadata and kept in an active outbox for inspection.
 */

export const mockSmsService = {
  outbox: [],

  /**
   * Broadcast emergency alert SMS to selected emergency contacts
   */
  async broadcastEmergencyAlert(report, contacts, senderName = "Elena Rostova") {
    const isSOS = report.incidentType === 'CRITICAL_SOS' || report.emergencyLevel === 'CRITICAL';
    const reportUrl = `https://safeher.app/track/${report.id}`;
    
    const results = [];

    for (const contact of contacts) {
      if (!contact.autoNotify && !isSOS) {
        continue;
      }

      const messageBody = isSOS
        ? `🚨 EMERGENCY ALERT from ${senderName} via SafeHer! I have activated emergency SOS. My GPS location: ${report.location?.address || 'Lat: ' + report.location?.lat + ', Lng: ' + report.location?.lng}. Live GPS tracker: ${reportUrl}. Police CAD has been alerted. Please check on me immediately!`
        : `⚠️ SafeHer Alert from ${senderName}: I submitted an incident report (${report.incidentType.replace('_', ' ')}). My location: ${report.location?.address || 'Lat: ' + report.location?.lat}. Status: ${report.status}. View report: ${reportUrl}`;

      const smsRecord = {
        messageId: `SMS-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        reportId: report.id,
        recipientName: contact.name,
        recipientPhone: contact.phone,
        relationship: contact.relationship,
        messageBody,
        timestamp: new Date().toISOString(),
        deliveryStatus: "DELIVERED",
        isSimulated: true,
        simulationNotice: "Simulated SMS notification sent via SafeHer Sandbox Gateway."
      };

      this.outbox.unshift(smsRecord);
      results.push(smsRecord);
    }

    if (this.outbox.length > 100) this.outbox.pop();

    return results;
  },

  getOutbox() {
    return this.outbox;
  },

  sendTestSms(contact, senderName = "Elena Rostova") {
    const testRecord = {
      messageId: `SMS-TEST-${Math.floor(100000 + Math.random() * 900000)}`,
      recipientName: contact.name,
      recipientPhone: contact.phone,
      relationship: contact.relationship,
      messageBody: `🛡️ SafeHer System Test: Hi ${contact.name}, this is a verification from SafeHer. ${senderName} has added you as an emergency contact. If an incident or SOS is triggered, you will receive real-time location alerts here. No emergency action is required at this time.`,
      timestamp: new Date().toISOString(),
      deliveryStatus: "DELIVERED",
      isSimulated: true,
      simulationNotice: "Simulated SMS test notification."
    };

    this.outbox.unshift(testRecord);
    return testRecord;
  }
};
