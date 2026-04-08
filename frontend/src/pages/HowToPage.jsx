import React from "react";
import { motion } from "framer-motion";
import { Upload, Search, Database, Play, Shield, CheckCircle, ArrowRight } from "lucide-react";

function HowToPage() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Submit Evidence",
      description: "Paste a YouTube URL into the Evidence Intake System. Our platform supports standard videos, shorts, and direct video links.",
      color: "cyan",
    },
    {
      number: "02",
      icon: Shield,
      title: "Select Analysis Type",
      description: "Choose from Full Spectrum analysis, Reverse Search only, AI/CGI Detection, or GPS/Metadata Extraction based on your needs.",
      color: "gold",
    },
    {
      number: "03",
      icon: Play,
      title: "Process & Analyze",
      description: "Our AI engine extracts frames, encodes features using ResNet50, and runs forensic analysis in the background via Celery workers.",
      color: "success",
    },
    {
      number: "04",
      icon: Search,
      title: "Review Results",
      description: "View AI detection probability, verdict stamps, and similar evidence matches from our FAISS-powered vector search index.",
      color: "danger",
    },
    {
      number: "05",
      icon: Database,
      title: "Manage Cases",
      description: "Access your Case Archive to browse all submitted evidence, filter by status, and track forensic analysis history.",
      color: "cyan",
    },
  ];

  const tips = [
    "Free tier includes 1 analysis per day. Watch a rewarded ad to unlock additional analyses.",
    "Results are more accurate with higher quality source videos.",
    "The similarity threshold can be adjusted for broader or narrower search results.",
    "Premium users get unlimited analyses, 4K support, and priority processing.",
  ];

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
            How to Use <span className="text-cyan">Eye-Dentify</span>
          </h2>
          <p className="text-slate-400 text-sm">
            A step-by-step guide to forensic video analysis
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const colorMap = {
              cyan: "glass-card--cyan",
              gold: "glass-card--gold",
              success: "glass-card--success",
              danger: "glass-card--danger",
            };
            const iconColorMap = {
              cyan: "text-cyan",
              gold: "text-gold",
              success: "text-success",
              danger: "text-danger",
            };

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={`glass-card ${colorMap[step.color]} p-6 flex items-start gap-5`}>
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl bg-navy/50 flex items-center justify-center ${iconColorMap[step.color]}`}>
                      <span className="text-lg font-black">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={18} className={iconColorMap[step.color]} />
                      <h3 className="text-white font-bold text-base uppercase tracking-wider">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {idx < steps.length - 1 && (
                    <div className="flex-shrink-0 text-slate-600 self-center hidden sm:block">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pro Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card glass-card--gold p-6"
        >
          <h3 className="text-gold text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle size={16} />
            Pro Tips
          </h3>
          <ul className="space-y-3">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-gold mt-1">•</span>
                <span className="text-slate-300 text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-4"
        >
          <p className="text-slate-500 text-xs">
            Ready to start? Go to the{" "}
            <a href="/app" className="text-cyan hover:text-gold transition-colors font-bold">
              Dashboard
            </a>{" "}
            to submit your first evidence.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default HowToPage;
