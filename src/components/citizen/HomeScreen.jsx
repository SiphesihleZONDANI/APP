import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import MapComponent from '../common/MapComponent';
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  FileText, 
  Info, 
  ShieldAlert, 
  CheckCircle, 
  ChevronRight, 
  RefreshCw, 
  Zap, 
  HeartHandshake, 
  ShieldCheck,
  Radio,
  Clock
} from 'lucide-react';

export default function HomeScreen({ 
  onStartReport, 
  onViewReports, 
  onViewContacts, 
  onViewSafetyInfo,
  onOpenReportDetail
}) {
  const { coords, isLocating, permissionStatus, refreshLocation, setManualLocation } = useLocation();
  const { currentUser } = useAuth();

  // Quick SOS state
  const [sosCountdown, setSosCountdown] = useState(null);
  const [sosResult, setSosResult] = useState(null);
  const [isSubmittingSos, setIsSubmittingSos] = useState(false);
  const [showManualLocationModal, setShowManualLocationModal] = useState(false);
  const [manualAddressInput, setManualAddressInput] = useState(coords?.address || '');
  const [imSafeSent, setImSafeSent] = useState(false);

  // Quick SOS activation with 3s cancel window
  const triggerQuickSOS = () => {
    let count = 3;
    setSosCountdown(count);

    const timer = setInterval(async () => {
      count -= 1;
      if (count > 0) {
        setSosCountdown(count);
      } else {
        clearInterval(timer);
        setSosCountdown(null);
        executeSosDispatch();
      }
    }, 1000);

    // Save timer ref to cancel
    window._sosTimer = timer;
  };

  const cancelQuickSOS = () => {
    if (window._sosTimer) {
      clearInterval(window._sosTimer);
      window._sosTimer = null;
    }
    setSosCountdown(null);
  };

  const executeSosDispatch = async () => {
    setIsSubmittingSos(true);
    try {
      const res = await api.triggerQuickSOS({
        userId: currentUser?.id,
        reporterName: currentUser?.name,
        reporterPhone: currentUser?.phone,
        location: coords,
        quickNote: "🚨 IMMEDIATE EMERGENCY SOS: 1-Tap Trigger from SafeHer home screen."
      });
      setSosResult(res);
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    } finally {
      setIsSubmittingSos(false);
    }
  };

  const handleSendImSafe = async () => {
    setImSafeSent(true);
    setTimeout(() => setImSafeSent(false), 4000);
  };

  const handleManualLocationSave = (e) => {
    e.preventDefault();
    if (manualAddressInput.trim()) {
      setManualLocation(coords.lat, coords.lng, manualAddressInput.trim());
      setShowManualLocationModal(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      
      {/* Simulation Notice Disclaimer Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 shadow-sm">
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 shrink-0">
          <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 text-[11px] leading-relaxed pt-0.5">
          <strong className="font-semibold">Demo Mode:</strong> Reports go to a simulated Police CAD. Contacts get simulated SMS. Real emergency services are <em>not</em> contacted.
        </div>
      </div>

      {/* SOS Active Countdown Overlay */}
      {sosCountdown !== null && (
        <div className="fixed inset-0 z-50 bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="w-24 h-24 rounded-full bg-red-600 border-4 border-white animate-ping-slow flex items-center justify-center mb-6">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">TRIGGERING EMERGENCY SOS</h2>
          <p className="text-sm text-red-200 mt-2 max-w-sm">
            Broadcasting live GPS location to emergency responders and notifying trusted contacts in:
          </p>
          <div className="text-7xl font-black my-4 font-mono">{sosCountdown}</div>
          <button
            onClick={cancelQuickSOS}
            className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-red-700 font-bold text-base shadow-2xl transition active:scale-95"
          >
            CANCEL SOS
          </button>
        </div>
      )}

      {/* SOS Result Banner */}
      {sosResult && (
        <div className="bg-red-50 dark:bg-red-950/50 border-2 border-red-500 rounded-2xl p-4 text-slate-900 dark:text-white shadow-lg relative animate-pulse-fast">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <Radio className="w-4 h-4" />
              <span>EMERGENCY SOS DISPATCH ACTIVE</span>
            </span>
            <span className="text-[11px] font-mono bg-red-600 text-white px-2 py-0.5 rounded font-bold">
              {sosResult.report?.id}
            </span>
          </div>
          <p className="text-sm font-semibold mb-2">
            Patrol Unit Dispatched: {sosResult.cadTicket?.assignedUnit?.unitId} ({sosResult.cadTicket?.assignedUnit?.officer})
          </p>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p>📍 Location: {sosResult.report?.location?.address}</p>
            <p>⏱️ Estimated Unit Arrival: <strong className="text-red-600 dark:text-red-400">{sosResult.cadTicket?.assignedUnit?.etaMinutes}</strong></p>
            <p>📲 Emergency Contacts Notified: {sosResult.contactAlerts?.length || 2} contacts sent live tracker SMS</p>
          </div>
          <button
            onClick={() => {
              onOpenReportDetail(sosResult.report?.id);
              setSosResult(null);
            }}
            className="mt-3 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition"
          >
            <span>View Live Dispatch Timeline</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 🚨 1. PRIMARY: REPORT CRIME BUTTON (Largest and Most Prominent) */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 rounded-3xl blur opacity-60 group-hover:opacity-90 transition duration-500" />
        <button
          onClick={onStartReport}
          className="relative w-full py-6 sm:py-7 px-6 rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:via-rose-500 hover:to-rose-600 text-white shadow-xl shadow-rose-900/20 transition duration-200 active:scale-[0.98] flex flex-col items-center justify-center text-center overflow-hidden"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center mb-3 shadow-inner">
            <ShieldAlert className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-wide drop-shadow-sm">
            🚨 REPORT CRIME
          </span>
          <span className="text-xs sm:text-sm font-medium text-rose-100 mt-1 max-w-xs drop-shadow">
            Instant GPS Lock • Police Dispatch • Contact Alert
          </span>
        </button>
      </div>

      {/* ⚡ QUICK SOS 1-TAP BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg border border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">Quick SOS</h3>
            <p className="text-[11px] text-slate-300">1-touch silent alarm & instant dispatch</p>
          </div>
        </div>
        <button
          onClick={triggerQuickSOS}
          disabled={isSubmittingSos}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-red-900/30 transition active:scale-95 flex items-center gap-1.5"
        >
          <span>Activate SOS</span>
        </button>
      </div>

      {/* 📍 2. MY LOCATION CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/60 dark:to-pink-950/40 text-rose-600 dark:text-rose-400 shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Location</h2>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  {permissionStatus === 'granted' ? 'High Accuracy GPS Active' : 'GPS Coordinates Calibrated'}
                </span>
                <span className="text-slate-400">• ±{coords?.accuracy || 4.8}m</span>
              </div>
            </div>
          </div>
          <button
            onClick={refreshLocation}
            disabled={isLocating}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh GPS"
          >
            <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Mini Map */}
        <div className="mb-3">
          <MapComponent
            center={[coords.lat, coords.lng]}
            zoom={15}
            height="150px"
            accuracyRadius={coords.accuracy * 4}
            interactive={false}
          />
        </div>

        {/* Current Address & Manual Override */}
        <div className="flex items-start justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
              {coords?.address}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} • Captured {new Date(coords.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => setShowManualLocationModal(true)}
            className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-medium shrink-0 pt-0.5"
          >
            Edit Address
          </button>
        </div>
      </div>

      {/* 📞 3. EMERGENCY CONTACTS CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Contacts</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">2 trusted contacts will receive instant SMS</p>
            </div>
          </div>
          <button
            onClick={onViewContacts}
            className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Contacts preview */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">Sophia (Sister)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="SMS Alert Enabled" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">+1 (555) 234-8891</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">Maya (Best Friend)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="SMS Alert Enabled" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">+1 (555) 873-1120</p>
          </div>
        </div>

        {/* Quick Check-in Button */}
        <button
          onClick={handleSendImSafe}
          className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            imSafeSent
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
          }`}
        >
          {imSafeSent ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Simulated "I'm Safe" Ping Sent to Contacts!</span>
            </>
          ) : (
            <>
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
              <span>Send Quick "I'm Safe" Check-in to Contacts</span>
            </>
          )}
        </button>
      </div>

      {/* 📋 4. MY REPORTS CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Reports</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Track active police case status</p>
            </div>
          </div>
          <button
            onClick={onViewReports}
            className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Latest Active Report Snippet */}
        <div 
          onClick={() => onOpenReportDetail('SH-2026-91823')}
          className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              STALKING INCIDENT
            </span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>IN PROGRESS</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
            615 Pike St garage • Assigned to Officer Marcus Vance (#4082)
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono">SH-2026-91823</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">Inspect Status &rarr;</span>
          </div>
        </div>
      </div>

      {/* ℹ️ 5. SAFETY INFORMATION & EMERGENCY HELPLINES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Safety Information & Helplines</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Confidential 24/7 crisis support</p>
            </div>
          </div>
          <button
            onClick={onViewSafetyInfo}
            className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Guides</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick dial pills */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a
            href="tel:911"
            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-between font-semibold"
          >
            <span>🚨 Emergency (911)</span>
            <Phone className="w-3.5 h-3.5" />
          </a>
          <a
            href="tel:18007997233"
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-between font-semibold"
          >
            <span>Domestic Violence</span>
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Manual Location Override Modal */}
      {showManualLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Manual Location Address
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter your current street address or notable landmark if GPS permission is disabled.
            </p>
            <form onSubmit={handleManualLocationSave} className="space-y-4">
              <input
                type="text"
                value={manualAddressInput}
                onChange={(e) => setManualAddressInput(e.target.value)}
                placeholder="e.g. 5th Ave & Pine St, inside coffee shop"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualLocationModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
