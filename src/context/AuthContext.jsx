import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('safeher_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default to demo citizen Elena Rostova
    return {
      id: "user-elena-101",
      name: "Elena Rostova",
      email: "elena@safeher.demo",
      phone: "+1 (555) 382-9912",
      role: "CITIZEN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      medicalNotes: "Asthmatic (inhaler in backpack). Blood Type O+",
      emergencyAddress: "742 Evergreen Terrace, Apt 4B, Metro City",
      privacySettings: {
        shareLocationWithPolice: true,
        shareMedicalWithDispatch: true,
        anonymousReportingOption: false,
        retentionDays: 90
      }
    };
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('safeher_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('safeher_user');
    }
  }, [currentUser]);

  const switchDemoRole = async (targetRole) => {
    try {
      const email = targetRole === 'POLICE_OFFICER' ? 'officer.vance@police.metro.gov' : 'elena@safeher.demo';
      const password = targetRole === 'POLICE_OFFICER' ? 'police123' : 'password123';
      const data = await api.login(email, password, targetRole);
      setCurrentUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Failed to switch demo role:', err);
    }
  };

  const login = async (email, password, role) => {
    const data = await api.login(email, password, role);
    setCurrentUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    setCurrentUser(data.user);
    return data.user;
  };

  const logout = () => {
    // Revert to demo citizen for easy prototype navigation
    switchDemoRole('CITIZEN');
  };

  const updateProfile = async (updatedData) => {
    const res = await api.updateProfile({ ...updatedData, userId: currentUser.id });
    if (res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const deleteAccountAndData = async () => {
    const res = await api.deleteAccount(currentUser.id);
    switchDemoRole('CITIZEN');
    return res;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isPolice: currentUser?.role === 'POLICE_OFFICER',
      isCitizen: currentUser?.role === 'CITIZEN',
      switchDemoRole,
      login,
      register,
      logout,
      updateProfile,
      deleteAccountAndData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
