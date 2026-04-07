import React from "react";
import { ExternalLink, Trash2, Clock, User, Image, Calendar } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

function VideoCard({ video, onDelete }) {
  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  const generateCaseID = (id) => {
    const shortID = id.substring(0, 8).toUpperCase();
    return `CASE-${shortID}`;
  };

  return (
    <div className="evidence-tile rounded-lg overflow-hidden">
      {/* Thumbnail */}
      {video.thumbnail_url && (
        <div className="relative h-44 overflow-hidden group">
          <img
            src={video.thumbnail_url}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={video.title}
          />
          {/* Scan overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none animate-scan"></div>
          
          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-gold/70"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gold/70"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gold/70"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-gold/70"></div>

          {/* Case ID */}
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded">
            <p className="text-[8px] text-gold font-mono font-bold tracking-wider">
              {generateCaseID(video.id)}
            </p>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 space-y-2">
        <h6 className="text-sm font-bold text-white truncate" title={video.title}>
          {video.title || "Untitled Evidence"}
        </h6>

        <div className="space-y-1 text-[10px] text-slate-400 font-mono">
          <p className="flex items-center gap-1">
            <User size={10} className="text-slate-500" />
            {video.channel || "Unknown"}
          </p>
          <p className="flex items-center gap-1">
            <Clock size={10} className="text-slate-500" />
            {formatDuration(video.duration)}
          </p>
          <p className="flex items-center gap-1">
            <Image size={10} className="text-slate-500" />
            {video.frames_count} frames · {video.features_count} features
          </p>
          <p className="flex items-center gap-1">
            <Calendar size={10} className="text-slate-500" />
            {formatDate(video.created_at)}
          </p>
        </div>

        {/* Status & Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <StatusBadge status={video.status} />
          {onDelete && video.status === "completed" && (
            <button
              className="text-slate-500 hover:text-danger transition-colors"
              onClick={() => onDelete(video.id)}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <a
          href={video.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-steel hover:bg-steel/80 border border-slate-700 hover:border-cyan text-cyan text-[10px] font-bold uppercase tracking-widest transition-all rounded"
        >
          <ExternalLink size={12} />
          View on YouTube
        </a>
      </div>
    </div>
  );
}

export default VideoCard;
