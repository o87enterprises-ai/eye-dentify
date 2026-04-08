import React, { useEffect, useState } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Shield } from "lucide-react";
import { api } from "../../services/api.jsx";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verify = async () => {
      try {
        await api.verifyEmail(token);
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Verification failed. The token may be invalid or expired.");
      }
    };

    verify();
  }, [token]);

  if (status === "success") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`glass-card p-8 text-center ${status === "error" ? "glass-card--danger" : "glass-card--success"}`}>
          {status === "verifying" && (
            <>
              <div className="w-16 h-16 rounded-full bg-cyan/20 border-2 border-cyan flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 border-3 border-cyan border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-black text-white mb-2">
                Verifying Email...
              </h2>
              <p className="text-slate-400 text-sm">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {message}
              </p>
              <Link to="/login">
                <button className="forensic-btn w-full py-4 rounded font-mono text-sm flex items-center justify-center gap-2">
                  <Shield size={16} />
                  CONTINUE TO LOGIN
                </button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-danger/20 border-2 border-danger flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} className="text-danger" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {message}
              </p>
              <Link to="/register">
                <button className="forensic-btn w-full py-4 rounded font-mono text-sm flex items-center justify-center gap-2">
                  TRY AGAIN
                </button>
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;
