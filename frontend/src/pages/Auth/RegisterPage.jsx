import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, AlertCircle, CheckCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { register, error, setError, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const validatePassword = () => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const result = await register(email, password);
    if (result.success) {
      setRegistered(true);
    } else {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-4">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">
              Registration Successful
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              We&apos;ve sent a verification email to{" "}
              <span className="text-cyan font-mono">{email}</span>
            </p>
            <p className="text-slate-500 text-xs mb-6">
              Check your inbox and click the verification link to activate your account.
            </p>
            <Link to="/login" className="forensic-btn w-full py-4 rounded font-mono text-sm flex items-center justify-center gap-2">
              <Mail size={16} />
              GO TO LOGIN
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-gold bg-steel shadow-[0_0_30px_rgba(212,175,55,0.3)] mb-4">
            <img src="/logo.png" alt="Eye-Dentify" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm">
            Start your forensic analysis journey
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-card p-8">
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-danger/10 border border-danger p-3 rounded-lg flex items-center gap-3 mb-6"
            >
              <AlertCircle size={16} className="text-danger flex-shrink-0" />
              <p className="text-danger text-xs">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" />
                <input
                  type="email"
                  className="w-full forensic-input pl-10 rounded"
                  placeholder="analyst@agency.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-2">
                A verification email will be sent to this address
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full forensic-input pl-10 pr-12 rounded"
                  placeholder="Min. 8 characters, letters + numbers"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full forensic-input pl-10 rounded"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full forensic-btn py-4 rounded font-mono text-sm flex items-center justify-center gap-2"
              disabled={loading || !email.trim() || !password.trim() || !confirmPassword.trim()}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></span>
                  CREATING ACCOUNT...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  CREATE ACCOUNT
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-slate-500 text-xs mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan hover:text-gold transition-colors font-bold">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-slate-500 hover:text-gold text-xs transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
