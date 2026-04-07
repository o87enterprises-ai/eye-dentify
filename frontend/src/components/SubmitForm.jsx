import React, { useState } from "react";
import { Upload, Link2, Zap } from "lucide-react";

function EvidenceSubmit({ onSubmit, loading }) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [analysisType, setAnalysisType] = useState("full");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    onSubmit({ youtubeUrl: youtubeUrl.trim(), analysisType });
  };

  return (
    <div className="forensic-panel p-6 rounded-lg corner-brackets gold-glow">
      <div className="flex items-center gap-2 mb-4">
        <Upload size={18} className="text-gold" />
        <h2 className="text-gold text-lg font-black tracking-widest uppercase">
          Evidence Intake System
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* URL Input */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
            Evidence Source URL
          </label>
          <div className="relative">
            <Link2
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50"
            />
            <input
              type="text"
              className="w-full forensic-input pl-10 rounded"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
            />
          </div>
          <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-tighter">
            Supports: youtube.com/watch, youtu.be, youtube.com/shorts
          </p>
        </div>

        {/* Analysis Type */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
            Forensic Analysis Protocol
          </label>
          <select
            className="w-full forensic-input rounded cursor-pointer"
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
          >
            <option value="full">FULL SPECTRUM (Reverse Search + AI Detection + Metadata)</option>
            <option value="search">REVERSE SEARCH ONLY</option>
            <option value="ai">AI/CGI DETECTION ONLY</option>
            <option value="gps">GPS/METADATA EXTRACTION ONLY</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full forensic-btn py-4 rounded font-mono text-sm flex items-center justify-center gap-2"
          disabled={loading || !youtubeUrl.trim()}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></span>
              INITIATING FORENSIC ANALYSIS...
            </>
          ) : (
            <>
              <Zap size={16} />
              INITIATE ANALYSIS
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default EvidenceSubmit;
