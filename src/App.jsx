import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { DisguiseProvider, useDisguise } from './context/DisguiseContext';

import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import DisguiseScreen from './components/common/DisguiseScreen';

import HomeScreen from './components/citizen/HomeScreen';
import CrimeReportFlow from './components/citizen/CrimeReportFlow';
import MyReportsScreen from './components/citizen/MyReportsScreen';
import EmergencyContactsScreen from './components/citizen/EmergencyContactsScreen';
import SafetyResourcesScreen from './components/citizen/SafetyResourcesScreen';
import UserProfileScreen from './components/citizen/UserProfileScreen';
import PoliceDashboard from './components/police/PoliceDashboard';

function MainContent() {
  const { isPolice, isCitizen } = useAuth();
  const { isDisguised } = useDisguise();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedReportId, setSelectedReportId] = useState(null);

  // Layout presentation controls
  const [isMobileMockup, setIsMobileMockup] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Automatically switch tab when role changes
  useEffect(() => {
    if (isPolice) {
      setCurrentTab('police-dashboard');
      setIsMobileMockup(false); // Default to full screen for police CAD
    } else {
      if (currentTab === 'police-dashboard') {
        setCurrentTab('home');
      }
    }
  }, [isPolice]);

  // Sync dark mode class with HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // If disguise mode is active, render stealth calculator screen
  if (isDisguised) {
    return <DisguiseScreen />;
  }

  // Open specific report detail
  const handleOpenReportDetail = (reportId) => {
    setSelectedReportId(reportId);
    setCurrentTab('reports');
  };

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col ${isMobileMockup && !isPolice ? 'py-3 sm:py-8 px-2 sm:px-0' : ''}`}>
      
      {/* Container wrapper (phone mockup or full screen) */}
      <div className={`mx-auto w-full transition-all duration-300 ${
        isMobileMockup && !isPolice
          ? 'max-w-[400px] w-full bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/20 rounded-[32px] sm:rounded-[40px] border-[6px] sm:border-[8px] border-slate-900 dark:border-slate-800 overflow-hidden flex flex-col min-h-[780px] sm:min-h-[820px] relative ring-1 ring-slate-900/5'
          : 'max-w-7xl px-3 sm:px-6'
      }`}>

        {/* Smartphone top bezel speaker cutout (when in mobile frame) */}
        {isMobileMockup && !isPolice && (
          <div className="w-full pt-2.5 sm:pt-3 pb-1 sm:pb-1.5 bg-white dark:bg-slate-900 flex justify-center items-center z-50">
            <div className="w-24 sm:w-28 h-4 sm:h-5 bg-slate-900 dark:bg-slate-800 rounded-full flex items-center justify-center gap-1.5 sm:gap-2">
              <div className="w-8 sm:w-10 h-1 bg-slate-700 rounded-full" />
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-700" />
            </div>
          </div>
        )}

        {/* Header / Navbar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isMobileMockup={isMobileMockup}
          setIsMobileMockup={setIsMobileMockup}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* Main Body Content */}
        <main className={`flex-1 p-3 sm:p-5 ${!isPolice && currentTab !== 'report-flow' ? 'pb-20' : 'pb-6'}`}>
          
          {/* CITIZEN VIEWS */}
          {currentTab === 'home' && (
            <HomeScreen
              onStartReport={() => setCurrentTab('report-flow')}
              onViewReports={() => setCurrentTab('reports')}
              onViewContacts={() => setCurrentTab('contacts')}
              onViewSafetyInfo={() => setCurrentTab('safety')}
              onOpenReportDetail={handleOpenReportDetail}
            />
          )}

          {currentTab === 'report-flow' && (
            <CrimeReportFlow
              onCancel={() => setCurrentTab('home')}
              onReportSubmitted={(report) => {
                // Keep confirmation view active
              }}
              onViewReportDetail={handleOpenReportDetail}
            />
          )}

          {currentTab === 'reports' && (
            <MyReportsScreen
              onBack={() => {
                setSelectedReportId(null);
                setCurrentTab('home');
              }}
              selectedReportId={selectedReportId}
            />
          )}

          {currentTab === 'contacts' && (
            <EmergencyContactsScreen
              onBack={() => setCurrentTab('home')}
            />
          )}

          {currentTab === 'safety' && (
            <SafetyResourcesScreen
              onBack={() => setCurrentTab('home')}
            />
          )}

          {currentTab === 'profile' && (
            <UserProfileScreen
              onBack={() => setCurrentTab('home')}
            />
          )}

          {/* POLICE CAD VIEW */}
          {currentTab === 'police-dashboard' && (
            <PoliceDashboard />
          )}

        </main>

        {/* Bottom Navigation for Mobile Citizen Mode */}
        {!isPolice && currentTab !== 'report-flow' && (
          <BottomNav
            currentTab={currentTab}
            setCurrentTab={(tab) => {
              setSelectedReportId(null);
              setCurrentTab(tab);
            }}
            isMobileMockup={isMobileMockup}
          />
        )}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <DisguiseProvider>
          <MainContent />
        </DisguiseProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
