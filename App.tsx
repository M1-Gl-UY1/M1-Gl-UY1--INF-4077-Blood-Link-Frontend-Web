import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/screens/AuthScreen';
import { Dashboard } from './components/screens/Dashboard';
import { Profile } from './components/screens/Profile';
import { MedicalFolder } from './components/screens/MedicalFolder';
import { AlertDetails } from './components/screens/AlertDetails';
import { RequestDetails } from './components/screens/RequestDetails';
import { HelpScreen } from './components/screens/HelpScreen';
import { firebaseService } from './services/firebaseService';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>(AppView.SPLASH);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if ([AppView.SPLASH, AppView.LOGIN, AppView.REGISTER_FORM, AppView.REGISTER_ROLE_SELECT].includes(currentView)) {
           setCurrentView(AppView.DASHBOARD);
        }
      } else {
        if ([AppView.DASHBOARD, AppView.PROFILE, AppView.MEDICAL_FOLDER, AppView.ALERT_DETAILS, AppView.REQUEST_DETAILS, AppView.HELP].includes(currentView)) {
            setCurrentView(AppView.SPLASH);
        }
      }
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await firebaseService.logout();
    setCurrentView(AppView.SPLASH);
  };

  const handleNavigateToDetail = (type: 'ALERT' | 'REQUEST', id: string) => {
    setSelectedResourceId(id);
    if (type === 'ALERT') setCurrentView(AppView.ALERT_DETAILS);
    if (type === 'REQUEST') setCurrentView(AppView.REQUEST_DETAILS);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen 
        view={currentView} 
        onNavigate={setCurrentView} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 bg-pattern">
      <Navbar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout} 
      />

      <main className="animate-fade-in">
        {currentView === AppView.DASHBOARD && (
            <Dashboard onNavigateToDetail={handleNavigateToDetail} />
        )}
        {currentView === AppView.PROFILE && <Profile />}
        {currentView === AppView.MEDICAL_FOLDER && <MedicalFolder />}
        {currentView === AppView.HELP && <HelpScreen />}
        
        {currentView === AppView.ALERT_DETAILS && selectedResourceId && (
            <AlertDetails alertId={selectedResourceId} onNavigate={setCurrentView} />
        )}
        
        {currentView === AppView.REQUEST_DETAILS && selectedResourceId && (
            <RequestDetails requestId={selectedResourceId} onNavigate={setCurrentView} />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;