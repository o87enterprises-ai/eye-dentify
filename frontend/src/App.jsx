import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, Database, Network, Zap, Activity } from "lucide-react";

// Context
import { AuthProvider } from "./contexts/AuthContext.jsx";

// Components
import Navbar from "./components/Navbar.jsx";
import ForensicCanvas from "./components/ForensicEye.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegisterPage from "./pages/Auth/RegisterPage.jsx";
import VerifyPendingPage from "./pages/Auth/VerifyPendingPage.jsx";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import IndexManagerPage from "./pages/IndexManagerPage.jsx";
import HowToPage from "./pages/HowToPage.jsx";
import PremiumPage from "./pages/PremiumPage.jsx";

// API Service
import { api } from "./services/api.jsx";

function AppContent() {
  const [activeTab, setActiveTab] = useState("HOME");
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState(null);
  const [alertLevel, setAlertLevel] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getIndexStats();
      setStats(data);
      if (data.exists && data.total_vectors > 10000) {
        setAlertLevel(87);
      } else if (data.exists && data.total_vectors > 1000) {
        setAlertLevel(50);
      } else {
        setAlertLevel(20);
      }
    } catch {
      // Index may not exist yet
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAnalyzing(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-navy text-slate-200 font-sans relative">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-pending" element={<VerifyPendingPage />} />
            <Route path="/premium" element={<PremiumPage />} />

            {/* Protected App Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    analyzing={analyzing}
                    stats={stats}
                    alertLevel={alertLevel}
                    loadStats={loadStats}
                  />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DashboardPage
                    onStatsChange={loadStats}
                    setAnalyzing={setAnalyzing}
                    analyzing={analyzing}
                  />
                </motion.div>
              } />
              <Route path="search" element={
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SearchPage setAnalyzing={setAnalyzing} />
                </motion.div>
              } />
              <Route path="library" element={
                <motion.div
                  key="library"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LibraryPage />
                </motion.div>
              } />
              <Route path="index" element={
                <motion.div
                  key="index"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <IndexManagerPage onStatsChange={loadStats} />
                </motion.div>
              } />
              <Route path="how-to" element={
                <motion.div
                  key="how-to"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <HowToPage />
                </motion.div>
              } />
            </Route>

            {/* Redirect old routes */}
            <Route path="/search" element={<Navigate to="/app/search" replace />} />
            <Route path="/library" element={<Navigate to="/app/library" replace />} />
            <Route path="/index" element={<Navigate to="/app/index" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

function AppShell({ activeTab, onTabChange, analyzing, stats, alertLevel, loadStats }) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative">
      {/* Background 3D Engine */}
      <div className="absolute inset-0 opacity-20">
        <ForensicCanvas isAnalyzing={analyzing} alertLevel={alertLevel} />
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" style={{ zIndex: 0 }}></div>

      {/* Global Command Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={onTabChange}
        stats={stats}
        analyzing={analyzing}
      />

      {/* Dynamic Page Content */}
      <main className="flex-1 relative p-4 lg:p-6 overflow-hidden" style={{ zIndex: 10 }}>
        <Routes>
          <Route index element={
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DashboardPage
                onStatsChange={loadStats}
                setAnalyzing={() => {}}
                analyzing={analyzing}
              />
            </motion.div>
          } />
          <Route path="search" element={
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SearchPage setAnalyzing={() => {}} />
            </motion.div>
          } />
          <Route path="library" element={
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LibraryPage />
            </motion.div>
          } />
          <Route path="index" element={
            <motion.div
              key="index"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <IndexManagerPage onStatsChange={loadStats} />
            </motion.div>
          } />
          <Route path="how-to" element={
            <motion.div
              key="how-to"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HowToPage />
            </motion.div>
          } />
        </Routes>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-8 border-t border-slate-800 bg-black/80 flex items-center justify-between px-6 text-[9px] font-bold text-slate-600 tracking-widest uppercase" style={{ zIndex: 100 }}>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1">
            <Activity size={10} className="text-cyan" />
            {stats && stats.exists ? "INDEX ONLINE" : "INDEX OFFLINE"}
          </span>
          <span>
            {stats && stats.exists ? `${stats.total_videos} VIDEO${stats.total_videos !== 1 ? 'S' : ''}` : "NO DATA"}
          </span>
        </div>
        <div className="text-gold italic">
          Integrity • Insight • Identification — © 2026 087 Software Development
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
