import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, AlertCircle, RefreshCw } from "lucide-react";

function VerifyPendingPage() {
  const location = useLocation();
  const email = location.state?.email || "your email";

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card glass-card--cyan p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-cyan/20 border-2 border-cyan flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-cyan" />
          </div>

          <h2 className="text-xl font-black text-white mb-2">
            Verify Your Email
          </h2>

          <p className="text-slate-400 text-sm mb-6">
            We&apos;ve sent a verification link to{" "}
            <span className="text-cyan font-mono">{email}</span>
          </p>

          <div className="bg-navy/50 border border-slate-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-gold flex-shrink-0 mt-0.5" />
              <p className="text-slate-400 text-xs text-left">
                Check your inbox and spam folder. The verification link expires in 24 hours.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="forensic-btn py-3 rounded font-mono text-sm flex items-center justify-center gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} />
              I&apos;VE VERIFIED — REFRESH
            </button>

            <Link
              to="/login"
              className="py-3 rounded border border-slate-700 text-slate-400 hover:text-cyan hover:border-cyan text-sm font-bold uppercase tracking-wider transition-all text-center"
            >
              BACK TO LOGIN
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyPendingPage;
