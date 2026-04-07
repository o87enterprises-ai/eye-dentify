import React, { useState } from "react";
import { Search, Filter } from "lucide-react";

function SearchForm({ onSearch, loading }) {
  const [queryUrl, setQueryUrl] = useState("");
  const [topK, setTopK] = useState(10);
  const [threshold, setThreshold] = useState(0.5);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filters = ["ALL", "VERIFIED", "MANIPULATED", "AI_GENERATED", "UNDER_REVIEW"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryUrl.trim()) return;
    onSearch({ queryUrl: queryUrl.trim(), topK, threshold });
  };

  return (
    <div className="forensic-panel p-6 rounded-lg corner-brackets gold-glow">
      <div className="flex items-center gap-2 mb-6">
        <Search size={18} className="text-cyan" />
        <h2 className="text-cyan text-lg font-black tracking-widest uppercase">
          Forensic Database Query
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Query Input */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
            Query Source
          </label>
          <input
            type="text"
            className="w-full forensic-input rounded"
            placeholder="Paste video URL or evidence source..."
            value={queryUrl}
            onChange={(e) => setQueryUrl(e.target.value)}
            required
          />
        </div>

        {/* Filters */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
            <Filter size={12} />
            Analysis Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border transition-all ${
                  activeFilter === filter
                    ? "bg-cyan/20 border-cyan text-cyan shadow-[0_0_10px_rgba(0,209,255,0.3)]"
                    : "bg-steel border-slate-700 text-slate-500 hover:border-gold hover:text-gold"
                }`}
              >
                {filter === "VERIFIED" && "🟢 "}
                {filter === "MANIPULATED" && "🔴 "}
                {filter === "AI_GENERATED" && "🔵 "}
                {filter === "UNDER_REVIEW" && "🟡 "}
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
              Top K Results
            </label>
            <input
              type="number"
              className="w-full forensic-input rounded"
              min="1"
              max="100"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
              Similarity Threshold
            </label>
            <input
              type="range"
              className="w-full"
              min="0"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
            />
            <p className="text-[9px] text-cyan text-center mt-1 font-mono">
              {(threshold * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full forensic-btn py-4 rounded font-mono text-sm flex items-center justify-center gap-2"
          disabled={loading || !queryUrl.trim()}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-cyan border-t-transparent rounded-full animate-spin"></span>
              QUERYING DATABASE...
            </>
          ) : (
            <>
              <Search size={16} />
              EXECUTE QUERY
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default SearchForm;
