import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DailySchedule from './pages/DailySchedule';
import Planner21Days from './pages/Planner21Days';
import Analytics from './pages/Analytics';
import CGPAPredictor from './pages/CGPAPredictor';
import TaskManager from './pages/TaskManager';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Settings from './pages/Settings';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import { useNotifications } from './hooks/useNotifications';
import { Menu, X } from 'lucide-react';

function AppContent() {
  const { loading, user, isGuest, onboardingComplete } = useAuth();
  const { userSettings } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const userName = (userSettings?.name || user?.name || 'SHIVA').toUpperCase();
  
  console.log('[AppContent] Render state:', { 
    loading, 
    userEmail: user?.email, 
    isGuest, 
    onboardingComplete,
    hasUser: !!user 
  });
  
  useNotifications();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-red-500 font-bebas text-2xl animate-pulse tracking-widest">
          INITIALIZING BATTLE DASHBOARD...
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthPage />;
  }

  if (!onboardingComplete) {
    return <OnboardingPage />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-red-500/30 selection:text-red-200">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-40">
        <h1 className="text-xl font-bebas tracking-wider text-white">
          <span className="text-red-500">{userName}'S</span> BATTLE
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''} lg:pl-64 min-h-screen pt-16 lg:pt-0`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<DailySchedule />} />
            <Route path="/planner" element={<Planner21Days />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/cgpa" element={<CGPAPredictor />} />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:id" element={<SubjectDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1a1a1f',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px'
            }
          }} />
          <AppContent />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

