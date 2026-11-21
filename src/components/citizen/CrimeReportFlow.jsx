import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import MapComponent from '../common/MapComponent';
import AudioEvidenceRecorder from '../common/AudioEvidenceRecorder';
import CameraEvidencePicker from '../common/CameraEvidencePicker';
import { 
  ArrowLeft, 
  Send, 
  MapPin, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle, 
  ChevronRight, 
  Radio, 
  Users, 
  UserX,
  FileCheck,
  AlertTriangle,
  Info
} from 'lucide-react';

const INCIDENT_TYPES = [
  { id: 'ASSAULT', label: 'Assault', icon: '🥊', level: 'CRITICAL', color: 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300' },
  { id: 'SEXUAL_ASSAULT', label: 'Sexual Assault', icon: '⚠️', level: 'CRITICAL', color: 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' },
  { id: 'DOMESTIC_VIOLENCE', label: 'Domestic Violence', icon: '🏠', level: 'CRITICAL', color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300' },
  { id: 'HARASSMENT', label: 'Harassment', icon: '🛑', level: 'HIGH', color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
  { id: 'STALKING', label: 'Stalking', icon: '👁️', level: 'HIGH', color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' },
  { id: 'ROBBERY', label: 'Robbery', icon: '👜', level: 'HIGH', color: 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300' },
  { id: 'KIDNAPPING', label: 'Kidnapping', icon: '🚨', level: 'CRITICAL', color: 'border-red-700 bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200' },
  { id: 'THREATS', label: 'Threats', icon: '💬', level: 'HIGH', color: 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
  { id: 'MISSING_PERSON', label: 'Missing Person', icon: '🔍', level: 'HIGH', color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' },
  { id: 'OTHER_EMERGENCY', label: 'Other Emergency', icon: '⚡', level: 'HIGH', color: 'border-slate-500 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300' }
];

export default function CrimeReportFlow({ onCancel, onReportSubmitted, onViewReportDetail }) {
  const { coords, setManualLocation } = useLocation();
  const { currentUser } = useAuth();

  // Form state
  const [selectedIncident, setSelectedIncident] = useState('HARASSMENT');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [audioData, setAudioData] = useState(null);

  // Suspect Description fields
  const [showSuspectDetails, setShowSuspectDetails] = useState(false);
  const [suspectGender, setSuspectGender] = useState('');
  const [suspectAge, setSuspectAge] = useState('');
  const [suspectHeight, setSuspectHeight] = useState('');
  const [suspectClothing, setSuspectClothing] = useState('');
  const [suspectVehicle, setSuspectVehicle] = useState('');
  const [suspectEscapeDirection, setSuspectEscapeDirection] = useState('');

  // Contacts notification toggle
  const [notifyEmergencyContacts, setNotifyEmergencyContacts] = useState(true);

  // Submission & Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);

  const activeIncidentMeta = INCIDENT_TYPES.find(i => i.id === selectedIncident) || INCIDENT_TYPES[0];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const executeSendReport = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        userId: currentUser?.id,
        reporterName: currentUser?.name,
        reporterPhone: currentUser?.phone,
        incidentType: selectedIncident,
        emergencyLevel: activeIncidentMeta.level,
        location: coords,
        description,
        suspectDescription: {
          gender: suspectGender,
          approximateAge: suspectAge,
          height: suspectHeight,
          clothing: suspectClothing,
          vehicle: suspectVehicle,
          directionOfTravel: suspectEscapeDirection
        },
        evidence: {
          photos,
          audioUrl: audioData?.audioUrl || null,
          audioDurationSeconds: audioData?.duration || 0,
          hasAudio: !!audioData?.hasAudio,
          audioNoteText: audioData?.audioNoteText || ''
        },
        notifyEmergencyContacts
      };

      const response = await api.submitReport(payload);
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setSubmittedReport(response);
      if (onReportSubmitted) onReportSubmitted(response.report);
    } catch (err) {
      console.error('Failed to submit report:', err);
      setIsSubmitting(false);
      alert('Error submitting report. Please retry.');
    }
  };

  // If report submitted, show full confirmation view with Report ID
  if (submittedReport) {
    const rep = submittedReport.report;
    const cad = submittedReport.cadTicket;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl animate-fadeIn space-y-5">
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle className="w-9 h-9" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full">
            REPORT TRANSMITTED SUCCESSFULLY
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            Unique Report ID:
          </h2>
          <div className="font-mono text-xl font-extrabold text-rose-600 dark:text-rose-400 bg-slate-100 dark:bg-slate-800 py-1.5 px-4 rounded-xl inline-block mt-1 border border-slate-200 dark:border-slate-700">
            {rep.id}
          </div>
        </div>

        {/* CAD and Dispatch status box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-300">Mock Police CAD Gateway:</span>
            <span className="font-mono bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
              {cad?.cadTicketId || 'CAD-ACK-2026'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Assigned Response Unit:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {cad?.assignedUnit?.unitId} ({cad?.assignedUnit?.officer})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Estimated Patrol Arrival:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {cad?.assignedUnit?.etaMinutes || '4-6 mins'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Dispatched Location:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {rep.location?.address}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Emergency Contacts Notified:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {rep.emergencyContactsNotified?.length || 0} Contacts Sent SMS
            </span>
          </div>
        </div>

        {/* Transparent Mock Disclaimer */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>Notice:</strong> This report was generated in the SafeHer prototype simulation sandbox. No real-world 911 dispatch was placed. In actual emergencies, always call 911 or your local emergency number.
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => onViewReportDetail(rep.id)}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow transition flex items-center justify-center gap-1.5"
          >
            <span>Track Report Timeline</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
          >
            Return to Home Screen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          Emergency Incident Report
        </span>
        <div className="w-6" />
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        
        {/* Step 1: Incident Selection (10 categories) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Incident Classification</span>
              <span className="text-red-500">*</span>
            </h3>
            <span className="text-[10px] bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-semibold px-2 py-0.5 rounded-full">
              {activeIncidentMeta.level} PRIORITY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {INCIDENT_TYPES.map(inc => {
              const isSelected = selectedIncident === inc.id;
              return (
                <button
                  key={inc.id}
                  type="button"
                  onClick={() => setSelectedIncident(inc.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                    isSelected
                      ? `ring-2 ring-rose-500 ${inc.color} font-bold shadow-sm`
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                >
                  <span className="text-lg">{inc.icon}</span>
                  <div className="truncate">
                    <p className="text-xs truncate">{inc.label}</p>
                    <p className="text-[10px] opacity-75 font-normal">{inc.level}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Location Map Confirmation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>2. Verified GPS Coordinates</span>
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              GPS Lock ±{coords.accuracy}m
            </span>
          </div>

          <MapComponent
            center={[coords.lat, coords.lng]}
            zoom={15}
            height="170px"
            onLocationSelect={(lat, lng) => setManualLocation(lat, lng, `Calibrated Pin: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)}
            interactive={true}
          />

          <div className="mt-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">
              {coords.address}
            </p>
            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Step 3: Incident Details (Description) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            3. Short Description (Optional)
          </h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what occurred, any weapons observed, immediate danger, or current safe location..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
          />
        </div>

        {/* Step 4: Evidence Capture (Voice Audio & Camera) */}
        <div className="space-y-3">
          <AudioEvidenceRecorder 
            onAudioCaptured={(data) => setAudioData(data)} 
          />
          <CameraEvidencePicker 
            onPhotosUpdated={(list) => setPhotos(list)} 
          />
        </div>

        {/* Step 5: Suspect Description (Expandable) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Suspect Description (Optional)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Provide visible identifiers to assist responding officers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuspectDetails(prev => !prev)}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              {showSuspectDetails ? 'Hide' : '+ Add Details'}
            </button>
          </div>

          {showSuspectDetails && (
            <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Gender / Count</label>
                <input
                  type="text"
                  placeholder="e.g. Male, approx 1 person"
                  value={suspectGender}
                  onChange={(e) => setSuspectGender(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Approx. Age & Height</label>
                <input
                  type="text"
                  placeholder="e.g. 30-35 yrs, 5ft 11in"
                  value={suspectHeight}
                  onChange={(e) => setSuspectHeight(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Clothing / Distinct Marks</label>
                <input
                  type="text"
                  placeholder="e.g. Dark jacket, white cap, facial scar"
                  value={suspectClothing}
                  onChange={(e) => setSuspectClothing(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Vehicle / Escape Route</label>
                <input
                  type="text"
                  placeholder="e.g. Dark blue sedan, fled east towards subway"
                  value={suspectEscapeDirection}
                  onChange={(e) => setSuspectEscapeDirection(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 6: Notify Emergency Contacts Checkbox */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Notify Emergency Contacts</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Send automated SMS with live GPS tracking link</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifyEmergencyContacts}
            onChange={(e) => setNotifyEmergencyContacts(e.target.checked)}
            className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
          />
        </div>

        {/* 🚨 SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Send className="w-5 h-5" />
            <span>SEND REPORT TO POLICE</span>
          </button>
        </div>

      </form>

      {/* Confirmation Modal with Strict Simulation Disclaimer */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Emergency Submission
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You are about to transmit this incident report to the CAD Dispatch System.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p><strong>Incident:</strong> {activeIncidentMeta.label}</p>
              <p><strong>Location:</strong> {coords.address}</p>
              <p><strong>Evidence:</strong> {photos.length} photo(s), {audioData?.hasAudio ? 'Voice memo attached' : 'None'}</p>
              <p><strong>Contacts:</strong> {notifyEmergencyContacts ? 'Will receive alert SMS' : 'Alerts disabled'}</p>
            </div>

            {/* Mandatory Prototype Disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900 text-[10px] text-amber-800 dark:text-amber-200 leading-tight">
              <strong>Simulated Dispatch Notice:</strong> This prototype connects to the SafeHer Mock Police API. No actual emergency units will be deployed.
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSendReport}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow flex items-center justify-center gap-1 transition"
              >
                {isSubmitting ? (
                  <span>Transmitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
