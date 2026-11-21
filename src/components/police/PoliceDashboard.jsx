import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MapComponent from '../common/MapComponent';
import { 
  Shield, 
  Radio, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  UserCheck, 
  PhoneCall, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  Car, 
  Users, 
  Eye, 
  History, 
  Lock, 
  Volume2, 
  Camera, 
  Send,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';

const STATUS_OPTIONS = [
  'ALL',
  'SUBMITTED',
  'RECEIVED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED'
];

export default function PoliceDashboard() {
  const { currentUser, isPolice } = useAuth();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Report for Inspection
  const [selectedReport, setSelectedReport] = useState(null);
  const [newOfficerNote, setNewOfficerNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDispatchingUnit, setIsDispatchingUnit] = useState(false);

  // Modals
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState('DIALING');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reportsData, statsData, officersData, auditData] = await Promise.all([
        api.getReports({ role: 'POLICE_OFFICER' }),
        api.getPoliceStats(),
        api.getPoliceOfficers(),
        api.getAuditLogs()
      ]);
      setReports(reportsData);
      setStats(statsData);
      setOfficers(officersData);
      setAuditLogs(auditData);

      // Keep selected report updated
      if (selectedReport) {
        const refreshed = reportsData.find(r => r.id === selectedReport.id);
        if (refreshed) setSelectedReport(refreshed);
      } else if (reportsData.length > 0) {
        setSelectedReport(reportsData[0]);
      }
    } catch (err) {
      console.error('Failed to load police dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectReport = async (report) => {
    setSelectedReport(report);
    // Log view action on backend
    try {
      await api.getReportById(report.id, `${currentUser.name} (${currentUser.badgeNumber || 'Officer'})`);
    } catch (e) { /* ignore */ }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedReport) return;
    setIsUpdatingStatus(true);
    try {
      await api.updateReportStatus(
        selectedReport.id,
        newStatus,
        `${currentUser.name} (${currentUser.badgeNumber ? '#' + currentUser.badgeNumber : 'PD'})`,
        `Officer set status to ${newStatus}`
      );
      await loadData();
    } catch (err) {
      console.error('Failed to change status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignOfficer = async (officerObj) => {
    if (!selectedReport) return;
    try {
      await api.assignOfficer(selectedReport.id, {
        officerName: officerObj.officerName,
        badge: officerObj.badge,
        unit: officerObj.unitId,
        dispatcher: currentUser.name
      });
      await loadData();
    } catch (err) {
      console.error('Failed to assign officer:', err);
    }
  };

  const handleDispatchPatrolCar = async () => {
    if (!selectedReport) return;
    setIsDispatchingUnit(true);
    try {
      await api.dispatchPoliceUnit(selectedReport.id, 'UNIT-402', currentUser.name);
      await loadData();
    } catch (err) {
      console.error('Failed to dispatch unit:', err);
    } finally {
      setIsDispatchingUnit(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newOfficerNote.trim() || !selectedReport) return;

    try {
      await api.addOfficerNote(
        selectedReport.id,
        `${currentUser.name} (#${currentUser.badgeNumber || '4082'})`,
        newOfficerNote.trim()
      );
      setNewOfficerNote('');
      await loadData();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleStartCall = () => {
    setShowCallModal(true);
    setCallStatus('DIALING');
    setTimeout(() => setCallStatus('CONNECTED'), 2500);
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && r.emergencyLevel !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        r.id.toLowerCase().includes(q) ||
        r.incidentType.toLowerCase().includes(q) ||
        (r.location?.address || '').toLowerCase().includes(q) ||
        (r.reporterName || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Map markers for all active reports
  const mapMarkers = filteredReports.map(r => ({
    lat: r.location?.lat || 47.6062,
    lng: r.location?.lng || -122.3321,
    title: `${r.id} - ${r.incidentType}`,
    description: `${r.location?.address} (${r.status})`,
    priority: r.emergencyLevel,
    type: 'INCIDENT',
    onClick: () => handleSelectReport(r)
  }));

  // Add active patrol units markers
  if (stats?.activeUnits) {
    mapMarkers.push(
      { lat: 47.6110, lng: -122.3360, title: 'Patrol Unit 402', type: 'POLICE' },
      { lat: 47.6040, lng: -122.3280, title: 'Patrol Unit 207', type: 'POLICE' }
    );
  }

  // Security gate: Verify officer role
  if (!isPolice) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto my-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Restricted Law Enforcement Portal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This Computer Aided Dispatch interface requires authorized Police Officer or Dispatch credentials.
        </p>
        <p className="text-xs font-semibold text-rose-600">
          Please use the top-right role switcher to switch to 'Police' (Officer Marcus Vance).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Top Police CAD Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">POLICE CAD DISPATCH CONSOLE</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded uppercase">
                Live CAD Active
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{currentUser.department}</span>
              <span>•</span>
              <span className="text-rose-400 font-semibold">{currentUser.name} (Badge {currentUser.badgeNumber})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowAuditModal(true)}
            className="flex-1 md:flex-none py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Critical SOS Active
          </span>
          <div className="text-2xl font-black text-red-700 dark:text-red-300 mt-1">
            {stats?.activeSOS || 1}
          </div>
          <p className="text-[10px] text-red-500 mt-0.5">Priority 1 Dispatches</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Pending Triage
          </span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {stats?.pendingReview || 2}
          </div>
          <p className="text-[10px] text-amber-500 mt-0.5">Awaiting squad review</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Units En Route
          </span>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {stats?.inProgress || 2}
          </div>
          <p className="text-[10px] text-blue-500 mt-0.5">Active patrols responding</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Avg CAD Response
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {stats?.avgResponseMinutes || 3.8}m
          </div>
          <p className="text-[10px] text-emerald-500 mt-0.5">From alert to on-scene</p>
        </div>
      </div>

      {/* Main Grid: Left Column (Map & Feed), Right Column (Detail Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (5 Cols on Desktop) */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Dispatch Map Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Metropolitan Incident Radar</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {filteredReports.length} Active Pins • 2 Patrol Cars
              </span>
            </div>
            <MapComponent
              center={[selectedReport?.location?.lat || 47.6062, selectedReport?.location?.lng || -122.3321]}
              zoom={13}
              height="200px"
              markers={mapMarkers}
              interactive={true}
            />
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, crime type, victim, or street..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-medium"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-medium"
              >
                <option value="ALL">All Urgencies</option>
                <option value="CRITICAL">Critical Danger</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium</option>
              </select>
            </div>
          </div>

          {/* Incident Feed List */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredReports.map(report => {
              const isSelected = selectedReport?.id === report.id;
              const isCrit = report.emergencyLevel === 'CRITICAL' || report.incidentType === 'CRITICAL_SOS';

              return (
                <div
                  key={report.id}
                  onClick={() => handleSelectReport(report)}
                  className={`p-3 rounded-2xl border transition cursor-pointer text-xs ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 shadow-md ring-1 ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {isCrit && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {report.incidentType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isCrit ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {report.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mb-1.5">
                    {report.location?.address}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">{report.id}</span>
                    <span>{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Incident Detail Inspector (7 Cols on Desktop) */}
        <div className="lg:col-span-7">
          {selectedReport ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              
              {/* Header with Case ID and Status dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-rose-600 dark:text-rose-400">
                      {selectedReport.id}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 font-mono px-2 py-0.5 rounded text-slate-500">
                      CAD: {selectedReport.cadTicketId || 'SIM-ACK-911'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                    {selectedReport.incidentType.replace(/_/g, ' ')} Incident
                  </h3>
                </div>

                {/* Status Update Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-slate-500">Status:</label>
                  <select
                    value={selectedReport.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="RECEIVED">RECEIVED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>

              {/* Quick Officer Dispatch & Contact Action Bar */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDispatchPatrolCar}
                    disabled={isDispatchingUnit || selectedReport.status === 'RESOLVED'}
                    className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Car className="w-4 h-4" />
                    <span>{isDispatchingUnit ? 'Dispatching...' : 'Dispatch Patrol Unit'}</span>
                  </button>

                  <button
                    onClick={handleStartCall}
                    className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-500" />
                    <span>Call Victim</span>
                  </button>
                </div>

                {/* Assigned Squad badge */}
                <div className="text-right text-xs">
                  <span className="text-[10px] text-slate-400 block">Assigned Unit:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {selectedReport.assignedOfficer?.unit || 'No unit assigned yet'}
                  </strong>
                </div>
              </div>

              {/* Victim Contact & Location Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Reporting Person Info */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reporting Person
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedReport.reporterName || 'Confidential Citizen'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono">
                    Phone: {selectedReport.reporterPhone || 'Protected'}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Identity Verified via SafeHer App
                  </p>
                </div>

                {/* Location & Coordinates */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Dispatched GPS Location
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                    {selectedReport.location?.address}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    {selectedReport.location?.lat.toFixed(5)}, {selectedReport.location?.lng.toFixed(5)} (±{selectedReport.location?.accuracy || 4.5}m)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Fix time: {new Date(selectedReport.location?.timestamp || selectedReport.createdAt).toLocaleTimeString()}
                  </p>
                </div>

              </div>

              {/* Narrative & Evidence Viewer */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Incident Narrative & Statements
                </span>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedReport.description || 'No additional narrative text provided by reporting party.'}
                </p>

                {/* Suspect info */}
                {selectedReport.suspectDescription?.gender && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1">
                    <span className="font-bold text-amber-800 dark:text-amber-300">
                      🚨 Suspect Identifiers & Vehicle
                    </span>
                    <p className="text-amber-900 dark:text-amber-200">
                      {selectedReport.suspectDescription.gender}, approx {selectedReport.suspectDescription.approximateAge || 'unknown age'} ({selectedReport.suspectDescription.height || 'unknown height'}).
                    </p>
                    {selectedReport.suspectDescription.clothing && (
                      <p className="text-amber-900 dark:text-amber-200">
                        <strong>Clothing:</strong> {selectedReport.suspectDescription.clothing}
                      </p>
                    )}
                    {selectedReport.suspectDescription.vehicle && (
                      <p className="text-amber-900 dark:text-amber-200">
                        <strong>Vehicle:</strong> {selectedReport.suspectDescription.vehicle}
                      </p>
                    )}
                    {selectedReport.suspectDescription.directionOfTravel && (
                      <p className="text-amber-900 dark:text-amber-200">
                        <strong>Escape Direction:</strong> {selectedReport.suspectDescription.directionOfTravel}
                      </p>
                    )}
                  </div>
                )}

                {/* Audio Evidence Recording Player */}
                {selectedReport.evidence?.hasAudio && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4" />
                        <span>Recorded Audio Evidence ({selectedReport.evidence.audioDurationSeconds || 12}s)</span>
                      </span>
                      <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold px-2 py-0.5 rounded">
                        Encrypted
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                      {selectedReport.evidence.audioNoteText}
                    </p>
                  </div>
                )}

                {/* Photos */}
                {selectedReport.evidence?.photos?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Crime Scene Evidence Photos ({selectedReport.evidence.photos.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedReport.evidence.photos.map((p, i) => (
                        <div key={i} className="rounded-xl overflow-hidden aspect-video bg-black border border-slate-200 dark:border-slate-700">
                          <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Case Assignment */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Assign Case to Patrol Officer:
                </span>
                <select
                  onChange={(e) => {
                    const chosen = officers.find(o => o.officerName === e.target.value);
                    if (chosen) handleAssignOfficer(chosen);
                  }}
                  value={selectedReport.assignedOfficer?.name || ''}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                >
                  <option value="">-- Select Officer --</option>
                  {officers.map(o => (
                    <option key={o.badge} value={o.officerName}>{o.name}</option>
                  ))}
                </select>
              </div>

              {/* Officer Activity Log & Internal Notes */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Internal Officer Notes & CAD Dispatches ({selectedReport.officerNotes?.length || 0})
                </span>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedReport.officerNotes?.map((n, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <strong className="text-slate-700 dark:text-slate-300">{n.officer}</strong>
                        <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newOfficerNote}
                    onChange={(e) => setNewOfficerNote(e.target.value)}
                    placeholder="Enter dispatch notes, scene findings, or perimeter updates..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={!newOfficerNote.trim()}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold shrink-0"
                  >
                    Add Note
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              Select an incident from the feed to view full police CAD dispatch details.
            </div>
          )}
        </div>

      </div>

      {/* Police Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Internal Police Audit & Access Trail
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              All views, status modifications, case assignments, and patrol car dispatches are logged with officer badge, IP address, and timestamp under statutory data protection compliance.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {auditLogs.map(log => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <strong className="text-slate-700 dark:text-slate-300">{log.officer}</strong>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-rose-600 dark:text-rose-400">{log.action}</span>
                    <span className="font-mono text-[10px] text-slate-400">{log.reportId}</span>
                  </div>
                  {log.reason && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">
                      "{log.reason}"
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAuditModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold"
            >
              Close Audit Log
            </button>
          </div>
        </div>
      )}

      {/* Simulated Call Modal */}
      {showCallModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-800 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto animate-pulse">
              <PhoneCall className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                {callStatus === 'DIALING' ? 'DIALING SECURE CAD LINE...' : 'CALL CONNECTED'}
              </span>
              <h3 className="text-lg font-bold mt-1">
                {selectedReport.reporterName}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {selectedReport.reporterPhone}
              </p>
            </div>

            <div className="bg-slate-800 p-3 rounded-2xl text-[11px] text-slate-300">
              {callStatus === 'DIALING' ? (
                <p>Initiating encrypted VoIP CAD link to reporting party's device...</p>
              ) : (
                <p className="text-emerald-400 font-semibold">
                  🎙️ Connected: "Hello Officer, thank you for calling. I am currently in the building lobby."
                </p>
              )}
            </div>

            <button
              onClick={() => setShowCallModal(false)}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
            >
              End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
