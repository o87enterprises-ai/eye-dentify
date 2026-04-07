import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ChevronRight } from "lucide-react";
import SearchForm from "../components/SearchForm.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { api } from "../services/api.jsx";

function SearchPage({ setAnalyzing }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async ({ queryUrl, topK, threshold }) => {
    setLoading(true);
    setError(null);
    setResults(null);
    if (setAnalyzing) setAnalyzing(true);

    try {
      const searchResults = await api.searchByYoutube(queryUrl, topK, threshold);
      setResults(searchResults);
      if (setAnalyzing) setAnalyzing(false);
    } catch (err) {
      setError(err.message || "Search failed");
      if (setAnalyzing) setAnalyzing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
            <span className="text-cyan">INTELLIGENCE</span> QUERY SYSTEM
          </h2>
          <p className="text-slate-400 text-xs">
            Search the forensic database for visually similar evidence
          </p>
        </motion.div>

        {/* Search Form */}
        <SearchForm onSearch={handleSearch} loading={loading} />

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
                Query Failed
              </p>
              <p className="text-slate-300 text-xs">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between bg-steel border border-slate-800 p-4 rounded-lg">
              <div>
                <h3 className="text-gold text-sm font-black uppercase tracking-widest">
                  Query Results
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  {results.total_results} matches found above threshold
                </p>
              </div>
              {results.results.length === 0 && (
                <div className="text-right">
                  <p className="text-slate-500 text-xs">No matches found</p>
                  <p className="text-slate-600 text-[10px]">Try lowering the threshold</p>
                </div>
              )}
            </div>

            {/* Results List */}
            {results.results.length === 0 ? (
              <div className="bg-steel/50 border border-slate-800 p-8 rounded-lg text-center">
                <AlertCircle size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-2">No similar evidence found</p>
                <p className="text-slate-600 text-xs">
                  The queried video does not match any indexed content above the similarity threshold.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.results.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="evidence-tile p-4 rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-cyan/20 border-2 border-cyan flex items-center justify-center">
                          <span className="text-cyan font-black text-lg">#{item.rank}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm mb-1 truncate">
                          {item.title || item.youtube_id}
                        </h4>
                        <p className="text-slate-500 text-[10px] font-mono mb-3">
                          ID: {item.youtube_id}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-navy/50 p-2 rounded">
                            <p className="text-[9px] text-slate-500 uppercase">Matches</p>
                            <p className="text-cyan font-bold text-sm">{item.num_matches}</p>
                          </div>
                          <div className="bg-navy/50 p-2 rounded">
                            <p className="text-[9px] text-slate-500 uppercase">Avg Sim</p>
                            <p className="text-gold font-bold text-sm">
                              {(item.avg_similarity * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-navy/50 p-2 rounded">
                            <p className="text-[9px] text-slate-500 uppercase">Max Sim</p>
                            <p className="text-success font-bold text-sm">
                              {(item.max_similarity * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-navy rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan to-gold shadow-[0_0_10px_rgba(0,209,255,0.3)]"
                            style={{ width: `${item.avg_similarity * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Thumbnail */}
                      {item.thumbnail_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-40 h-24 object-cover rounded border border-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
