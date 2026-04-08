import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, MapPin, Zap, AlertTriangle, Database, LogOut, User, Crown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import SubmitForm from "../../components/SubmitForm.jsx";
import RewardedAdModal from "../../components/RewardedAdModal.jsx";
import { api } from "../../services/api.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useDailyLimit } from "../../hooks/useDailyLimit.js";

function DashboardPage({ onStatsChange, setAnalyzing, analyzing }) {
  const [loading, setLoading] = useState(false);
  const [submittedVideo, setSubmittedVideo] = useState(null);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const { showAdModal, handleAdComplete, closeAdModal, requestAnalysis } = useDailyLimit();
  const navigate = useNavigate();

  const handleSubmit = async ({ youtubeUrl, analysisType }) => {
    setLoading(true);
    setError(null);
    setSubmittedVideo(null);
    setAnalyzing(true);

    try {
      // Check daily limit first
      const result = await requestAnalysis(
        async (videoId, type) => {
          return api.submitVideo(youtubeUrl, type);
        },
        youtubeUrl,
        analysisType
      );

      if (result) {
        setSubmittedVideo(result);
        onStatsChange();
      }

      setTimeout(() => {
        setAnalyzing(false);
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to submit video");
      setAnalyzing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Bar: User Info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-steel/50 border border-slate-800 rounded-lg p-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center">
              <User size={14} className="text-cyan" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">{user?.email}</p>
              <p className="text-[10px] text-slate-500">
                Daily analyses: {user?.daily_analysis_count || 0}/1
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/premium">
              <button className="flex items-center gap-1 text-gold hover:text-yellow-400 text-xs font-bold uppercase tracking-wider transition-colors">
                <Crown size={14} />
                <span className="hidden sm:inline">Upgrade</span>
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-slate-500 hover:text-danger text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-gold bg-steel mb-4 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white mb-2 tracking-tight">
            Forensic Analysis Dashboard
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Submit digital evidence for forensic analysis. Powered by AI-driven visual similarity matching and deepfake detection.
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-danger/10 border border-danger p-4 rounded-lg flex items-start gap-3"
          >
            <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-danger text-sm font-bold uppercase tracking-wider mb-1">
                Analysis Failed
              </p>
              <p className="text-slate-300 text-xs">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Success Alert */}
        {submittedVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success/10 border border-success p-4 rounded-lg flex items-start gap-3"
          >
            <Shield size={18} className="text-success flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-success text-sm font-bold uppercase tracking-wider mb-1">
                Evidence Submitted Successfully
              </p>
              <p className="text-slate-300 text-xs mb-1">
                <span className="text-slate-500">Title:</span> {submittedVideo.title}
              </p>
              <p className="text-slate-300 text-xs">
                <span className="text-slate-500">Status:</span>{" "}
                <span className="text-cyan">{submittedVideo.status.toUpperCase()}</span>
              </p>
              <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-tighter">
                Processing in background. Check Case Archive for updates.
              </p>
            </div>
          </motion.div>
        )}

        {/* Submit Form */}
        <SubmitForm onSubmit={handleSubmit} loading={loading} />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card glass-card--cyan p-5 rounded-lg group"
          >
            <Search size={28} className="text-cyan mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">
              Reverse Search
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Find visually similar evidence using AI-powered feature matching across the indexed database.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card glass-card--gold p-5 rounded-lg group"
          >
            <Shield size={28} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">
              AI Detection
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Detect AI-generated or manipulated content using advanced heuristic analysis and pattern recognition.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card glass-card--success p-5 rounded-lg group"
          >
            <MapPin size={28} className="text-success mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">
              Metadata Extraction
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Extract GPS coordinates, timestamps, and technical metadata from digital evidence files.
            </p>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-steel/50 border border-slate-800 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-[10px] text-success font-mono uppercase">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={12} className="text-cyan" />
              <span className="text-[10px] text-cyan font-mono">FAISS Index Active</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            ResNet50 • OpenCV • yt-dlp
          </div>
        </motion.div>

        {/* Rewarded Ad Modal */}
        <RewardedAdModal
          isOpen={showAdModal}
          onClose={closeAdModal}
          onComplete={handleAdComplete}
        />
      </div>
    </div>
  );
}

export default DashboardPage;
