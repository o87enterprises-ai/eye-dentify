import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, RefreshCw, Trash2, AlertTriangle, CheckCircle, HardDrive, Layers, Activity } from "lucide-react";
import { api } from "../services/api.jsx";

function IndexManagerPage({ onStatsChange }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getIndexStats();
      setStats(data);
      onStatsChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRebuild = async () => {
    if (!window.confirm("⚠️ REBUILD THE ENTIRE FORENSIC INDEX? This may take a while for large datasets.")) return;

    setActionLoading("rebuild");
    setError(null);
    setSuccess(null);

    try {
      const result = await api.rebuildIndex();
      setSuccess(`Index rebuild initiated (task: ${result.task_id})`);
      onStatsChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("⚠️ CRITICAL WARNING: This will permanently delete the entire forensic index. All search data will be lost. Continue?")) return;

    setActionLoading("reset");
    setError(null);
    setSuccess(null);

    try {
      await api.resetIndex();
      setSuccess("Index successfully reset");
      setStats(null);
      onStatsChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-sm uppercase tracking-widest">Loading Index Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
            <span className="text-cyan">FORENSIC</span> INDEX SYSTEM
          </h2>
          <p className="text-slate-400 text-xs">
            Manage the FAISS vector search index and monitor database statistics
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
            <div>
              <p className="text-danger text-sm font-bold uppercase tracking-wider mb-1">
                Operation Failed
              </p>
              <p className="text-slate-300 text-xs">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Success Alert */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success/10 border border-success p-4 rounded-lg flex items-start gap-3"
          >
            <CheckCircle size={18} className="text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-success text-sm font-bold uppercase tracking-wider mb-1">
                Operation Successful
              </p>
              <p className="text-slate-300 text-xs">{success}</p>
            </div>
          </motion.div>
        )}

        {/* Index Statistics */}
        {stats && stats.exists ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="forensic-panel p-5 rounded-lg text-center">
              <Database size={28} className="text-cyan mx-auto mb-3" />
              <div className="text-3xl font-black text-cyan mb-1">
                {stats.total_vectors.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Total Vectors</p>
            </div>

            <div className="forensic-panel p-5 rounded-lg text-center">
              <HardDrive size={28} className="text-gold mx-auto mb-3" />
              <div className="text-3xl font-black text-gold mb-1">{stats.total_videos}</div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Videos Indexed</p>
            </div>

            <div className="forensic-panel p-5 rounded-lg text-center">
              <Layers size={28} className="text-success mx-auto mb-3" />
              <div className="text-3xl font-black text-success mb-1">{stats.feature_dim}</div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Feature Dim</p>
            </div>

            <div className="forensic-panel p-5 rounded-lg text-center">
              <Activity size={28} className="text-danger mx-auto mb-3" />
              <div className="text-3xl font-black text-danger mb-1">
                {stats.file_size_mb.toFixed(0)} MB
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Index Size</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-danger/10 border border-danger p-8 rounded-lg text-center"
          >
            <AlertTriangle size={48} className="text-danger mx-auto mb-4" />
            <p className="text-danger text-sm font-bold uppercase tracking-widest mb-2">
              No Forensic Index Found
            </p>
            <p className="text-slate-400 text-xs">
              Build an index by submitting videos for analysis from the Home page
            </p>
          </motion.div>
        )}

        {/* Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="forensic-panel p-6 rounded-lg"
        >
          <h3 className="text-gold text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <RefreshCw size={16} />
            Index Operations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rebuild Button */}
            <button
              className="forensic-btn py-4 rounded flex items-center justify-center gap-2"
              onClick={handleRebuild}
              disabled={actionLoading !== null}
            >
              {actionLoading === "rebuild" ? (
                <>
                  <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></span>
                  REBUILDING INDEX...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  REBUILD INDEX
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              className="forensic-btn py-4 rounded flex items-center justify-center gap-2 border-danger text-danger hover:bg-danger hover:text-white"
              onClick={handleReset}
              disabled={actionLoading !== null}
            >
              {actionLoading === "reset" ? (
                <>
                  <span className="w-4 h-4 border-2 border-danger border-t-transparent rounded-full animate-spin"></span>
                  RESETTING INDEX...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  RESET INDEX
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-navy/50 border border-slate-800 rounded">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <span className="text-gold font-bold">REBUILD:</span> Recreates the index from all existing feature files. Use after adding videos manually or recovering from backup.
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
              <span className="text-danger font-bold">RESET:</span> Permanently deletes the entire forensic index. All search data will be lost. This action cannot be undone.
            </p>
          </div>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-steel/50 border border-slate-800 rounded-lg p-4"
        >
          <h4 className="text-cyan text-[10px] font-black uppercase tracking-widest mb-3">
            System Architecture
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-navy/50 p-3 rounded">
              <p className="text-[9px] text-slate-500 uppercase mb-1">ML Engine</p>
              <p className="text-xs text-cyan font-mono">ResNet50</p>
            </div>
            <div className="bg-navy/50 p-3 rounded">
              <p className="text-[9px] text-slate-500 uppercase mb-1">Vector Search</p>
              <p className="text-xs text-gold font-mono">FAISS</p>
            </div>
            <div className="bg-navy/50 p-3 rounded">
              <p className="text-[9px] text-slate-500 uppercase mb-1">Framework</p>
              <p className="text-xs text-success font-mono">PyTorch</p>
            </div>
            <div className="bg-navy/50 p-3 rounded">
              <p className="text-[9px] text-slate-500 uppercase mb-1">Task Queue</p>
              <p className="text-xs text-danger font-mono">Celery</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default IndexManagerPage;
