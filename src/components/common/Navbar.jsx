import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDisguise } from '../../context/DisguiseContext';
import { Shield, Eye, Smartphone, Monitor, Moon, Sun, Radio, UserCheck } from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  isMobileMockup, 
  setIsMobileMockup, 
  isDarkMode, 
  setIsDarkMode 
}) {
  const { currentUser, isPolice, switchDemoRole } = useAuth();
  const { activateDisguise } = useDisguise();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
        
        {/* Brand Logo & Live Beacon */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab('home')}>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Shield className="w-5 h-5 fill-white/20 stroke-[2.2]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="System Online" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">SafeHer</h1>
              <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.2 rounded uppercase">
                {isPolice ? 'Police CAD' : 'SOS'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {isPolice ? 'Metropolitan Emergency Dispatch System' : 'Women\'s Safety & Crime Reporting'}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Quick Disguise Button (Stealth Camouflage) */}
          {!isPolice && (
            <button
              onClick={() => activateDisguise('calculator')}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              title="Stealth Mode: Instantly disguise app as a Calculator"
            >
              <Eye className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Quick Exit</span>
            </button>
          )}

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                switchDemoRole('CITIZEN');
                setCurrentTab('home');
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                !isPolice
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => {
                switchDemoRole('POLICE_OFFICER');
                setCurrentTab('police-dashboard');
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1 ${
                isPolice
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Police</span>
            </button>
          </div>

          {/* Mobile Bezel Toggle (for demo presentation) */}
          <button
            onClick={() => setIsMobileMockup(prev => !prev)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition hidden sm:flex"
            title={isMobileMockup ? "Expand to Full Desktop View" : "View inside Mobile Phone Frame"}
          >
            {isMobileMockup ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(prev => !prev)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Avatar badge */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
