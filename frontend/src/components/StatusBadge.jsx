import React from "react";
import {
  CheckCircle,
  XCircle,
  Hourglass,
  Download,
  ImageIcon,
  Cpu,
  Database,
  AlertTriangle,
} from "lucide-react";

function StatusBadge({ status }) {
  const getBadgeClass = () => {
    switch (status) {
      case "completed":
        return "badge-verified";
      case "failed":
        return "badge-flagged";
      case "pending":
        return "badge-archived";
      case "downloading":
      case "extracting":
      case "encoding":
      case "indexing":
        return "badge-processing";
      case "running":
        return "badge-processing";
      default:
        return "badge-archived";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle size={12} />;
      case "failed":
        return <XCircle size={12} />;
      case "pending":
        return <Hourglass size={12} />;
      case "downloading":
        return <Download size={12} />;
      case "extracting":
        return <ImageIcon size={12} />;
      case "encoding":
        return <Cpu size={12} />;
      case "indexing":
        return <Database size={12} />;
      case "running":
        return <AlertTriangle size={12} />;
      default:
        return <Hourglass size={12} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "completed":
        return "VERIFIED";
      case "failed":
        return "FLAGGED";
      case "pending":
        return "PENDING";
      case "downloading":
        return "DOWNLOADING";
      case "extracting":
        return "EXTRACTING";
      case "encoding":
        return "ENCODING";
      case "indexing":
        return "INDEXING";
      case "running":
        return "PROCESSING";
      default:
        return status ? status.toUpperCase() : "UNKNOWN";
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${getBadgeClass()}`}>
      {getIcon()}
      {getStatusText()}
    </span>
  );
}

export default StatusBadge;
