import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Filter, AlertCircle } from "lucide-react";
import VideoCard from "../components/VideoCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { api } from "../services/api.jsx";

function LibraryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadVideos();
  }, [filterStatus, page]);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listVideos(page * limit, limit, filterStatus);
      setVideos(data);
    } catch (err) {
      setError(err.message || "Failed to load evidence");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("⚠️ DELETE THIS EVIDENCE? This action cannot be undone.")) return;
    try {
      await api.deleteVideo(videoId);
      loadVideos();
    } catch (err) {
      alert("Failed to delete evidence: " + err.message);
    }
  };

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
              <span className="text-gold">CASE</span> ARCHIVE
            </h2>
            <p className="text-slate-400 text-xs">
              Browse and manage all submitted evidence files
            </p>
          </div>
          <button
            className="flex items-center gap-2 bg-steel border border-slate-700 hover:border-cyan text-slate-300 hover:text-cyan px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
            onClick={loadVideos}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-danger/10 border border-danger p-4 rounded-lg flex items-start gap-3"
          >
            <AlertCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-danger text-sm font-bold uppercase tracking-wider mb-1">
                Load Failed
              </p>
              <p className="text-slate-300 text-xs">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-steel border border-slate-800 p-4 rounded-lg"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gold" />
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Filter by Status:
              </label>
            </div>
            <select
              className="bg-navy border border-slate-700 text-slate-300 px-3 py-2 rounded text-[10px] font-mono uppercase tracking-wider focus:border-gold outline-none"
              value={filterStatus || ""}
              onChange={(e) => {
                setFilterStatus(e.target.value || null);
                setPage(0);
              }}
            >
              <option value="">All Evidence</option>
              <option value="completed">Verified</option>
              <option value="pending">Pending</option>
              <option value="downloading">Downloading</option>
              <option value="extracting">Extracting</option>
              <option value="encoding">Encoding</option>
              <option value="indexing">Indexing</option>
              <option value="failed">Flagged</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 text-sm uppercase tracking-widest">Loading Evidence...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-steel/50 border border-slate-800 p-12 rounded-lg text-center">
            <AlertCircle size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm mb-2">No evidence files found</p>
            <p className="text-slate-600 text-xs">
              Submit a YouTube URL from the Home page to begin forensic analysis
            </p>
          </div>
        ) : (
          <>
            {/* Evidence Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <VideoCard video={video} onDelete={handleDelete} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-steel border border-slate-800 p-4 rounded-lg">
              <button
                className="px-4 py-2 bg-navy border border-slate-700 hover:border-cyan text-slate-300 hover:text-cyan rounded text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <span className="text-slate-400 text-xs font-mono">
                Page {page + 1}
              </span>
              <button
                className="px-4 py-2 bg-navy border border-slate-700 hover:border-cyan text-slate-300 hover:text-cyan rounded text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={videos.length < limit}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
