import React from 'react';
import { Home, FileText, Users, Info, User, ShieldAlert } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab, isMobileMockup = true }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'safety', label: 'Safety', icon: Info },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className={`${isMobileMockup ? 'absolute rounded-b-[26px] sm:rounded-b-[34px]' : 'fixed'} bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors`}>
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1 sm:px-2 safe-area-bottom">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 sm:px-3 rounded-2xl transition duration-150 active:scale-95 ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.id === 'reports' && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
