import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, Database, Network, FileSearch, Zap, Activity } from "lucide-react";

// Components
import Navbar from "./components/Navbar.jsx";
import ForensicCanvas from "./components/ForensicEye.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import IndexManagerPage from "./pages/IndexManagerPage.jsx";

// API Service
import { api } from "./services/api.jsx";

function App() {
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
      // Set alert level based on index size
      if (data.exists && data.total_vectors > 10000) {
        setAlertLevel(87);
      } else if (data.exists && data.total_vectors > 1000) {
        setAlertLevel(50);
      } else {
        setAlertLevel(20);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAnalyzing(false);
  };

  return (
    <Router>
      <div className="h-screen w-screen bg-navy text-slate-200 overflow-hidden font-sans flex flex-col relative">
        
        {/* Background 3D Engine */}
        <div className="absolute inset-0 opacity-30">
          <ForensicCanvas isAnalyzing={analyzing} alertLevel={alertLevel} />
        </div>

        {/* Grid Background */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" style={{ zIndex: 0 }}></div>

        {/* Global Command Header */}
        <Navbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          stats={stats}
          analyzing={analyzing}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 relative p-4 lg:p-6 overflow-hidden" style={{ zIndex: 10 }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HomePage
                      onStatsChange={loadStats}
                      setAnalyzing={setAnalyzing}
                      analyzing={analyzing}
                    />
                  </motion.div>
                }
              />
              <Route
                path="/search"
                element={
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SearchPage setAnalyzing={setAnalyzing} />
                  </motion.div>
                }
              />
              <Route
                path="/library"
                element={
                  <motion.div
                    key="library"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LibraryPage />
                  </motion.div>
                }
              />
              <Route
                path="/index"
                element={
                  <motion.div
                    key="index"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <IndexManagerPage onStatsChange={loadStats} />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
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
    </Router>
  );
}

export default App;
