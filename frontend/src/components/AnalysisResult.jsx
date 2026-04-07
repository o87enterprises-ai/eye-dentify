import React from "react";
import { Shield, AlertTriangle, CheckCircle, FileText } from "lucide-react";

function AnalysisResult({ result }) {
  if (!result) return null;

  const getVerdictColor = (probability) => {
    if (probability > 0.7) return "border-danger text-danger bg-danger/10";
    if (probability > 0.4) return "border-gold text-gold bg-gold/10";
    return "border-success text-success bg-success/10";
  };

  const getVerdictText = (probability) => {
    if (probability > 0.7) return "⚠️ MANIPULATED MEDIA DETECTED";
    if (probability > 0.4) return "⚡ SUSPICIOUS - MANUAL REVIEW REQUIRED";
    return "✅ VERIFIED AUTHENTIC";
  };

  const getConfidenceColor = (probability) => {
    if (probability > 0.7) return "text-danger";
    if (probability > 0.4) return "text-gold";
    return "text-success";
  };

  return (
    <div className="forensic-panel p-6 rounded-lg corner-brackets gold-glow space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <Shield size={20} className="text-gold" />
        <h2 className="text-gold text-lg font-black tracking-widest uppercase">
          Forensic Analysis Result
        </h2>
      </div>

      {/* AI Detection */}
      {result.ai_detection && (
        <div className="space-y-4">
          {/* Confidence Score */}
          <div className="text-center">
            <div className={`text-6xl font-black ${getConfidenceColor(result.ai_detection.ai_probability)} mb-2`}>
              {(result.ai_detection.ai_probability * 100).toFixed(1)}%
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              AI Generation Probability
            </p>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-navy rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                result.ai_detection.ai_probability > 0.7
                  ? "bg-danger shadow-[0_0_15px_rgba(255,59,59,0.5)]"
                  : result.ai_detection.ai_probability > 0.4
                  ? "bg-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                  : "bg-success shadow-[0_0_15px_rgba(0,255,156,0.5)]"
              }`}
              style={{ width: `${result.ai_detection.ai_probability * 100}%` }}
            ></div>
          </div>

          {/* Verdict Stamp */}
          <div className={`verdict-stamp p-4 text-center rounded ${getVerdictColor(result.ai_detection.ai_probability)}`}>
            <p className="text-sm font-black uppercase tracking-widest mb-1">
              Forensic Conclusion
            </p>
            <p className="text-lg font-black">
              {getVerdictText(result.ai_detection.ai_probability)}
            </p>
          </div>

          {/* Details */}
          <div className="bg-navy/50 p-4 rounded border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
              Analysis Details
            </p>
            <div className="space-y-2 text-[11px] text-slate-300 font-mono">
              <p>
                <span className="text-slate-500">Frames Analyzed:</span>{" "}
                <span className="text-cyan">{result.ai_detection.frames_analyzed}</span>
              </p>
              <p>
                <span className="text-slate-500">Verdict:</span>{" "}
                <span className={getConfidenceColor(result.ai_detection.ai_probability)}>
                  {result.ai_detection.interpretation}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {result.search && result.search.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-cyan text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} />
            Similar Evidence Found: {result.search.length}
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {result.search.slice(0, 10).map((item, idx) => (
              <div
                key={idx}
                className="bg-navy/50 border border-slate-800 p-3 rounded hover:border-cyan transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[9px] text-gold font-mono font-bold">
                      RANK #{item.rank}
                    </span>
                    <p className="text-xs text-white font-bold mt-1">{item.video_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-cyan font-mono">
                      AVG: {(item.avg_similarity * 100).toFixed(1)}%
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      MAX: {(item.max_similarity * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 mb-2">
                  {item.num_matches} matching frames
                </p>
                <div className="h-2 bg-steel rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan/60 shadow-[0_0_10px_rgba(0,209,255,0.3)]"
                    style={{ width: `${item.avg_similarity * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {result.metadata && (
        <div className="space-y-3">
          <h3 className="text-gold text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <CheckCircle size={14} />
            Extracted Metadata
          </h3>

          <div className="bg-navy/50 border border-slate-800 rounded overflow-hidden">
            <table className="w-full text-[11px] font-mono">
              <tbody>
                {Object.entries(result.metadata).map(([key, value]) => (
                  <tr key={key} className="border-b border-slate-800 last:border-0">
                    <td className="p-3 text-slate-500 uppercase tracking-wider w-40">
                      {key}
                    </td>
                    <td className="p-3 text-cyan">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;
