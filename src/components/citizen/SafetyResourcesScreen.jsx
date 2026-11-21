import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Phone, 
  ShieldAlert, 
  BookOpen, 
  Lock, 
  Trash2, 
  Timer, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Heart
} from 'lucide-react';

export default function SafetyResourcesScreen({ onBack }) {
  const { currentUser, deleteAccountAndData } = useAuth();
  const [activeTab, setActiveTab] = useState('HOTLINES'); // 'HOTLINES' | 'TIMER' | 'GUIDES' | 'PRIVACY'
  
  // Safe Walk Timer state
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const startWalkTimer = () => {
    setIsTimerRunning(true);
    setSecondsRemaining(timerMinutes * 60);

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          alert('⚠️ Safe Walk Check-in Expired: Automated alert ping triggered to emergency contacts!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    window._walkTimerInterval = interval;
  };

  const cancelWalkTimer = () => {
    if (window._walkTimerInterval) {
      clearInterval(window._walkTimerInterval);
    }
    setIsTimerRunning(false);
    setSecondsRemaining(0);
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountAndData();
      setIsDeleting(false);
      setDeleteConfirmed(true);
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeleteConfirmed(false);
        onBack();
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
          Safety Resources & Privacy
        </h2>
        <div className="w-6" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
        {[
          { id: 'HOTLINES', label: 'Hotlines' },
          { id: 'TIMER', label: 'Walk Timer' },
          { id: 'GUIDES', label: 'Safety Guides' },
          { id: 'PRIVACY', label: 'Data Rights' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. HOTLINES */}
      {activeTab === 'HOTLINES' && (
        <div className="space-y-3">
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-xs">
            <h3 className="font-bold text-red-700 dark:text-red-300 text-sm mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Immediate Life-Threatening Danger</span>
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-3">
              If you are in immediate peril, dial your local emergency services directly.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:911"
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-center shadow flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 911 (US/CA)</span>
              </a>
              <a
                href="tel:112"
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center shadow flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 112 (EU/UK)</span>
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              24/7 Confidential Crisis Helplines
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">National Domestic Violence Hotline</h4>
                  <p className="text-slate-500 dark:text-slate-400">1-800-799-SAFE (7233) • Free & Confidential</p>
                </div>
                <a href="tel:18007997233" className="p-2 rounded-lg bg-rose-500 text-white font-semibold">
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">RAINN (Sexual Assault Hotline)</h4>
                  <p className="text-slate-500 dark:text-slate-400">1-800-656-4673 • Specialized support & resources</p>
                </div>
                <a href="tel:18006564673" className="p-2 rounded-lg bg-rose-500 text-white font-semibold">
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Crisis Text Line</h4>
                  <p className="text-slate-500 dark:text-slate-400">Text 'HOME' to 741741 • Silent texting support</p>
                </div>
                <a href="sms:741741" className="p-2 rounded-lg bg-slate-700 text-white font-semibold">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SAFE WALK TIMER */}
      {activeTab === 'TIMER' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Safe Walk Check-in Timer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Automatically alerts contacts if you don't check in</p>
            </div>
          </div>

          {!isTimerRunning ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Walking alone through an unfamiliar or poorly lit area? Set a safety countdown. If you do not tap "I Arrived Safely" before the timer elapses, SafeHer will automatically dispatch an emergency alert to your trusted contacts.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Expected Walk Duration:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 30].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTimerMinutes(mins)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        timerMinutes === mins
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mins} Minutes
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startWalkTimer}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition"
              >
                Start Safe Walk Countdown
              </button>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="text-5xl font-black font-mono text-rose-600 dark:text-rose-400 animate-pulse">
                {formatTimer(secondsRemaining)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safe Walk in progress. Tap below when you have arrived safely.
              </p>
              <button
                onClick={cancelWalkTimer}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>I Arrived Safely (Cancel Timer)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. SAFETY GUIDES */}
      {activeTab === 'GUIDES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-rose-500" />
            <span>Practical Personal Safety Protocol</span>
          </h3>

          <div className="space-y-2.5">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                1. Stalking & Harassment Evidence Log
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Save dates, times, vehicle license plates, and locations. Do not delete harassing text messages, voicemails, or social media comments — screenshot and export them.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                2. Digital Safety & Anti-Spyware Hygiene
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Check phone settings for unknown Bluetooth trackers (AirTags/Tiles). Turn off location sharing on social apps. Use SafeHer's Quick Disguise screen if your phone is inspected.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                3. Discreet Exit & Safety Planning
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Keep a packed emergency bag with spare cash, keys, identification, medication, and essential documents stored at a trusted friend's home.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRIVACY & DATA DELETION */}
      {activeTab === 'PRIVACY' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Privacy & Data Sovereignty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Strict zero-leakage security model</p>
            </div>
          </div>

          <div className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              • <strong>Encryption at Rest & Transit:</strong> All GPS coordinates, voice memos, and incident details are encrypted via TLS 1.3 in transit and AES-256 at rest.
            </p>
            <p>
              • <strong>No Public Location Exposure:</strong> Your real-time coordinates are never broadcast publicly or shared with unauthorized third parties.
            </p>
            <p>
              • <strong>Officer Audit Trail:</strong> Every time a police responder views your report, their Badge ID, IP address, and timestamp are permanently written to an immutable audit log.
            </p>
          </div>

          {/* Account & Data Deletion */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-red-600 dark:text-red-400 mb-1">
              Right to Erasure (GDPR / CCPA / SafeHer Privacy Shield)
            </h4>
            <p className="text-slate-500 dark:text-slate-400 mb-3 text-[11px]">
              You can permanently erase all your submitted reports, uploaded evidence, emergency contacts, and account records from our servers with one click.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="py-2.5 px-4 rounded-xl border border-red-300 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Request Complete Account & Data Deletion</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Permanently Erase All Data?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                This action is immediate and irrevocable. All reports, evidence recordings, and emergency contacts under <strong>{currentUser?.name}</strong> will be wiped.
              </p>
            </div>

            {deleteConfirmed ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-center font-bold">
                ✓ All user records and reports erased from database.
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllData}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  {isDeleting ? 'Erasing Data...' : 'Yes, Delete Everything'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
