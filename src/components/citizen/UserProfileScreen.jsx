import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Heart, 
  Lock, 
  CheckCircle, 
  MapPin, 
  Camera, 
  Mic, 
  Radio,
  LogOut
} from 'lucide-react';

export default function UserProfileScreen({ onBack }) {
  const { currentUser, updateProfile, switchDemoRole, logout } = useAuth();
  const { permissionStatus, refreshLocation } = useLocation();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [medicalNotes, setMedicalNotes] = useState(currentUser?.medicalNotes || '');
  const [emergencyAddress, setEmergencyAddress] = useState(currentUser?.emergencyAddress || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({
      name,
      phone,
      medicalNotes,
      emergencyAddress
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn text-xs">
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
          Profile & Security
        </h2>
        <div className="w-6" />
      </div>

      {/* User Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
        <img
          src={currentUser?.avatar}
          alt={currentUser?.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-rose-500 shadow"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {currentUser?.name}
            </h3>
            <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full">
              {currentUser?.role}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">
            {currentUser?.phone}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Citizen Account</span>
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5">
        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
          Personal & Emergency Medical Details
        </h3>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Legal Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mobile Phone (Emergency Verification)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Home / Default Emergency Address</label>
          <input
            type="text"
            value={emergencyAddress}
            onChange={(e) => setEmergencyAddress(e.target.value)}
            placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Medical & Responder Notes (Optional)
          </label>
          <textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Asthmatic (inhaler carried), Blood Type O+, Severe penicillin allergy..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs resize-none"
          />
          <p className="text-[10px] text-slate-400 mt-0.5">
            Shared with responding police/medical personnel only during an active high-urgency call.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center justify-center gap-1.5"
        >
          {isSaved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Changes Saved!</span>
            </>
          ) : (
            <span>Save Profile Updates</span>
          )}
        </button>
      </form>

      {/* Permissions & Hardware Access Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
          Device Hardware Permissions
        </h3>
        <p className="text-slate-500 text-[11px]">
          SafeHer requests explicit hardware access strictly for capturing evidence and coordinates during emergencies.
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">GPS / Geolocation Services</strong>
                <span className="text-[10px] text-slate-500">Live coordinates for CAD dispatch</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
              {permissionStatus === 'granted' ? 'GRANTED' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-blue-500" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Microphone Access</strong>
                <span className="text-[10px] text-slate-500">Emergency audio recording memos</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
              READY
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-500" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Camera & Photo Library</strong>
                <span className="text-[10px] text-slate-500">Suspect and scene evidence photos</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
              READY
            </span>
          </div>
        </div>
      </div>

      {/* Switch Demo Role / Logout */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
        <div>
          <strong className="text-slate-800 dark:text-slate-200 block">Switch to Police CAD Mode</strong>
          <span className="text-[10px] text-slate-500">Test the officer review & dispatch flow</span>
        </div>
        <button
          onClick={() => switchDemoRole('POLICE_OFFICER')}
          className="py-1.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800"
        >
          Switch Role
        </button>
      </div>

    </div>
  );
}
