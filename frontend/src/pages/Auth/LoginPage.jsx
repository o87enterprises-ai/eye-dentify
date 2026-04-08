import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      {/* Background Grid */}
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
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to continue your forensic analysis
          </p>
        </div>

        {/* Login Card */}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full forensic-btn py-4 rounded font-mono text-sm flex items-center justify-center gap-2"
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></span>
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  SIGN IN
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-slate-500 text-xs mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-cyan hover:text-gold transition-colors font-bold">
              Create one
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

export default LoginPage;
