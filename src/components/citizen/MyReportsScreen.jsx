import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MapComponent from '../common/MapComponent';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  MessageSquare
} from 'lucide-react';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  RECEIVED: { label: 'Received by CAD', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  ASSIGNED: { label: 'Officer Assigned', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  IN_PROGRESS: { label: 'In Progress (Active)', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse' },
  RESOLVED: { label: 'Resolved / Closed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' }
};

export default function MyReportsScreen({ onBack, selectedReportId = null }) {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeReport, setActiveReport] = useState(null);
  const [followUpNote, setFollowUpNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReports({ userId: currentUser?.id, role: 'CITIZEN' });
      setReports(data);
      if (selectedReportId) {
        const found = data.find(r => r.id === selectedReportId);
        if (found) setActiveReport(found);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentUser, selectedReportId]);

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpNote.trim() || !activeReport) return;

    setIsAddingNote(true);
    try {
      await api.addOfficerNote(activeReport.id, `${currentUser.name} (Citizen Update)`, followUpNote.trim());
      setFollowUpNote('');
      // Reload single report
      const updated = await api.getReportById(activeReport.id);
      setActiveReport(updated);
      fetchReports();
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return r.status !== 'RESOLVED';
    if (statusFilter === 'RESOLVED') return r.status === 'RESOLVED';
    return true;
  });

  // Report Detail View
  if (activeReport) {
    const statusMeta = STATUS_CONFIG[activeReport.status] || STATUS_CONFIG.SUBMITTED;
    const progressSteps = ['SUBMITTED', 'RECEIVED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
    const currentStepIndex = progressSteps.indexOf(activeReport.status);

    return (
      <div className="space-y-4 pb-12 animate-fadeIn">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveReport(null)}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Reports</span>
          </button>
          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
            {activeReport.id}
          </span>
          <div className="w-6" />
        </div>

        {/* Status Stepper Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {activeReport.incidentType.replace(/_/g, ' ')}
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                Case Status Overview
              </h2>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="relative flex items-center justify-between mt-4 px-2">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
            {progressSteps.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    isCurrent
                      ? 'bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-950'
                      : isPastOrCurrent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {isPastOrCurrent && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-1 capitalize hidden sm:block">
                    {step.toLowerCase().replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Officer / CAD Ticket Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Mock Police CAD Ticket:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {activeReport.cadTicketId || 'CAD-ACK-2026'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Assigned Lead Officer:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {activeReport.assignedOfficer?.name || 'Awaiting Squad Assignment'} {activeReport.assignedOfficer?.badge ? `(${activeReport.assignedOfficer.badge})` : ''}
            </span>
          </div>
          {activeReport.assignedOfficer?.unit && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Response Unit:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {activeReport.assignedOfficer.unit} (Patrol Sector)
              </span>
            </div>
          )}
        </div>

        {/* Incident Map & Address */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Incident Location</span>
          </h3>
          <MapComponent
            center={[activeReport.location?.lat || 47.6062, activeReport.location?.lng || -122.3321]}
            zoom={15}
            height="160px"
            interactive={false}
          />
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-2">
            {activeReport.location?.address}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Reported at: {new Date(activeReport.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Description & Evidence */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Incident Narrative
            </h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              {activeReport.description || 'No additional narrative was provided.'}
            </p>
          </div>

          {/* Suspect info if present */}
          {activeReport.suspectDescription?.gender && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Suspect Profile
              </h4>
              <div className="mt-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs space-y-1 text-slate-700 dark:text-slate-300">
                <p><strong>Identified:</strong> {activeReport.suspectDescription.gender} • {activeReport.suspectDescription.approximateAge || 'Age unknown'}</p>
                {activeReport.suspectDescription.clothing && <p><strong>Attire:</strong> {activeReport.suspectDescription.clothing}</p>}
                {activeReport.suspectDescription.vehicle && <p><strong>Vehicle:</strong> {activeReport.suspectDescription.vehicle}</p>}
                {activeReport.suspectDescription.directionOfTravel && <p><strong>Escape:</strong> {activeReport.suspectDescription.directionOfTravel}</p>}
              </div>
            </div>
          )}

          {/* Evidence photos */}
          {activeReport.evidence?.photos?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Attached Evidence
              </h4>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {activeReport.evidence.photos.map((p, i) => (
                  <div key={i} className="rounded-xl overflow-hidden aspect-video bg-black border border-slate-200 dark:border-slate-700">
                    <img src={p.url} alt={p.caption || 'Evidence'} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio memo if present */}
          {activeReport.evidence?.hasAudio && (
            <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-xs">
              <span className="font-bold text-rose-700 dark:text-rose-300 block mb-1">
                🎙️ Recorded Audio Evidence Clip
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                {activeReport.evidence.audioNoteText}
              </p>
            </div>
          )}
        </div>

        {/* Police Notes & Event Trail */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Official Case Activity & Notes ({activeReport.officerNotes?.length || 0})
          </h3>

          <div className="space-y-2 mb-3">
            {activeReport.officerNotes?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No officer notes recorded yet.</p>
            ) : (
              activeReport.officerNotes?.map((n, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{n.officer}</span>
                    <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                </div>
              ))
            )}
          </div>

          {/* Citizen can add follow-up statement */}
          <form onSubmit={handleAddFollowUp} className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Add Statement or Follow-up Information:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                placeholder="e.g. Suspect was seen returning or additional witness contacted..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={isAddingNote || !followUpNote.trim()}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold shrink-0"
              >
                Send
              </button>
            </div>
          </form>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          My Submitted Reports
        </h2>
        <button
          onClick={fetchReports}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
        {['ALL', 'ACTIVE', 'RESOLVED'].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === tab
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'ALL' ? 'All Reports' : tab === 'ACTIVE' ? 'Active / In Progress' : 'Resolved'}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-2.5">
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No reports found</p>
            <p className="text-xs text-slate-400 mt-1">Submitted incident reports will appear here with live tracking.</p>
          </div>
        ) : (
          filteredReports.map(report => {
            const statusMeta = STATUS_CONFIG[report.status] || STATUS_CONFIG.SUBMITTED;
            return (
              <div
                key={report.id}
                onClick={() => setActiveReport(report)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/50 rounded-2xl p-4 shadow-sm cursor-pointer transition active:scale-[0.99] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {report.incidentType.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMeta.color}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {report.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-slate-500 dark:text-slate-400">{report.id}</span>
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                    <span>Inspect Timeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
