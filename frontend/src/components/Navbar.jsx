import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Search, Database, Network, Zap, Menu, X, LogIn, UserPlus, LogOut, User, BookOpen, Crown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

function Navbar({ activeTab, onTabChange, stats, analyzing }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tabs = isAuthenticated ? [
    { id: "HOME", label: "DASHBOARD", path: "/app", icon: Zap },
    { id: "SEARCH", label: "SEARCH", path: "/app/search", icon: Search },
    { id: "LIBRARY", label: "CASE ARCHIVE", path: "/app/library", icon: Database },
    { id: "INDEX", label: "INDEX", path: "/app/index", icon: Network },
    { id: "HOW-TO", label: "HOW TO USE", path: "/app/how-to", icon: BookOpen },
  ] : [
    { id: "HOME", label: "HOME", path: "/", icon: Zap },
  ];

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header
      className="h-16 border-t-2 border-gold bg-black/90 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 shadow-2xl relative"
      style={{ zIndex: 100 }}
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <Link to={isAuthenticated ? "/app" : "/"} className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gold flex items-center justify-center bg-steel shadow-[0_0_15px_rgba(212,175,55,0.4)] overflow-hidden flex-shrink-0">
            <img
              src="/logo.png"
              alt="Eye-Dentify Logo"
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg md:text-xl font-black tracking-tighter text-white whitespace-nowrap">
              EYE-<span className="text-cyan">DENTIFY</span>
            </h1>
            <span className="text-[7px] md:text-[8px] text-gold tracking-[0.3em] md:tracking-[0.4em] font-bold uppercase leading-none hidden sm:block">
              Forensic Intelligence Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-6 xl:gap-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              onClick={() => handleTabChange(tab.id)}
              className={`h-full flex items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-all relative pb-1 ${
                isActive
                  ? "text-cyan border-b-2 border-cyan"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <Icon size={12} />
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan shadow-[0_0_10px_#00D1FF]"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right Side: Auth + Status */}
      <div className="flex items-center gap-2 md:gap-4">
        {isAuthenticated && user ? (
          <div className="hidden md:flex items-center gap-3">
            {/* User Info */}
            <div className="flex items-center gap-2 text-right">
              <div className="w-7 h-7 rounded-full bg-cyan/20 flex items-center justify-center">
                <User size={12} className="text-cyan" />
              </div>
              <div className="hidden xl:block">
                <p className="text-[10px] text-white font-bold truncate max-w-[120px]">
                  {user.email}
                </p>
                <p className="text-[8px] text-slate-500 leading-none">
                  Analyses: {user.daily_analysis_count}/1
                </p>
              </div>
            </div>

            {/* Premium Link */}
            <Link to="/premium" className="text-gold hover:text-yellow-400 transition-colors">
              <Crown size={16} />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-danger transition-colors p-1"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login">
              <button className="flex items-center gap-1 text-slate-400 hover:text-cyan transition-colors text-xs font-bold uppercase tracking-wider px-3 py-2">
                <LogIn size={14} />
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-gold hover:bg-yellow-600 text-black px-4 py-2 rounded text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <UserPlus size={12} className="inline mr-1" />
                FREE ACCOUNT
              </button>
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gold hover:text-cyan transition-colors p-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-navy border-l-2 border-gold p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end mb-8">
              <button
                className="text-gold hover:text-cyan transition-colors p-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info (mobile) */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-steel/50">
                <div className="w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                  <User size={18} className="text-cyan" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold truncate max-w-[160px]">{user.email}</p>
                  <p className="text-[10px] text-slate-500">Analyses: {user.daily_analysis_count}/1</p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-col gap-3 flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-cyan/10 text-cyan border border-cyan/30"
                        : "text-slate-400 hover:text-white hover:bg-steel/50"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-bold tracking-wider uppercase">{tab.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth Actions */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to="/premium" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-2 border border-gold text-gold py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gold/10 transition-all">
                      <Crown size={16} />
                      UPGRADE
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-danger py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
                  >
                    <LogOut size={16} />
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full border border-slate-700 text-slate-300 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:border-cyan hover:text-cyan transition-all">
                      SIGN IN
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-gold hover:bg-yellow-600 text-black py-3 rounded-lg text-sm font-black tracking-widest uppercase transition-all">
                      CREATE FREE ACCOUNT
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
