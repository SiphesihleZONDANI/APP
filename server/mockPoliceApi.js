/**
 * SafeHer Mock Police CAD (Computer Aided Dispatch) API Gateway
 * 
 * NOTE: This is a dedicated SIMULATION GATEWAY for prototyping and demonstration.
 * In a production deployment, this module connects to certified municipal PSAP / 911 / 112 
 * emergency dispatch interfaces (such as NG9-1-1 / ESI-net / CAD REST APIs).
 * 
 * Every payload clearly carries the `isSimulated: true` and simulation disclaimer flags.
 */

export const mockPoliceDispatcher = {
  activeUnits: [
    { unitId: "UNIT-402", officerName: "Officer Marcus Vance", badge: "#4082", sector: "Downtown / Metro Core", status: "ON_PATROL" },
    { unitId: "UNIT-207", officerName: "Sgt. Sarah Chen", badge: "#3190", sector: "Uptown / Transit District", status: "ON_PATROL" },
    { unitId: "UNIT-109", officerName: "Officer Dave Miller", badge: "#5514", sector: "Westside Waterfront", status: "BUSY" },
    { unitId: "UNIT-315", officerName: "Officer Elena Ramos", badge: "#4921", sector: "South University Campus", status: "AVAILABLE" }
  ],

  dispatchLogs: [],

  /**
   * Submit an incident report to the Mock Police CAD system
   */
  async submitReportToMockCAD(report) {
    const isCriticalSOS = report.incidentType === 'CRITICAL_SOS' || report.emergencyLevel === 'CRITICAL';
    const etaMinutes = isCriticalSOS ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 8) + 7;
    
    // Choose the best unit
    const assignedUnit = isCriticalSOS 
      ? this.activeUnits[0] // Priority unit
      : this.activeUnits.find(u => u.status !== 'BUSY') || this.activeUnits[0];

    const cadTicket = {
      cadTicketId: `CAD-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
      reportId: report.id,
      timestamp: new Date().toISOString(),
      isSimulated: true,
      simulationNotice: "MOCK POLICE API INTEGRATION — This is a simulated dispatch for prototype testing. No actual 911/police units are dispatched.",
      cadSystemName: "SafeHer Simulated PSAP Gateway v2.4 (Sandbox CAD)",
      dispatchPriority: isCriticalSOS ? "PRIORITY 1 - IMMEDIATE THREAT TO LIFE" : "PRIORITY 2 - HIGH URGENCY RESPONSE",
      assignedUnit: {
        unitId: assignedUnit.unitId,
        officer: assignedUnit.officerName,
        badge: assignedUnit.badge,
        sector: assignedUnit.sector,
        etaMinutes: `${etaMinutes} mins`
      },
      gpsDispatched: {
        lat: report.location?.lat,
        lng: report.location?.lng,
        address: report.location?.address || "Coordinates supplied via mobile GPS"
      },
      status: "DISPATCHED"
    };

    this.dispatchLogs.unshift(cadTicket);
    if (this.dispatchLogs.length > 50) this.dispatchLogs.pop();

    return cadTicket;
  },

  getDispatchLogs() {
    return this.dispatchLogs;
  },

  getAvailableOfficers() {
    return this.activeUnits.map(u => ({
      name: `${u.officerName} (${u.unitId} - Badge ${u.badge})`,
      unitId: u.unitId,
      officerName: u.officerName,
      badge: u.badge
    }));
  }
};
