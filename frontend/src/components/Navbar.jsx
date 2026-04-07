import React from "react";
import { Link } from "react-router-dom";
import { Shield, Search, Database, Network, Zap } from "lucide-react";

function Navbar({ activeTab, onTabChange, stats, analyzing }) {
  const tabs = [
    { id: "HOME", label: "HOME", path: "/", icon: Zap },
    { id: "SEARCH", label: "SEARCH", path: "/search", icon: Search },
    { id: "LIBRARY", label: "CASE ARCHIVE", path: "/library", icon: Database },
    { id: "INDEX", label: "INDEX SYSTEM", path: "/index", icon: Network },
  ];

  return (
    <header
      className="h-16 border-t-2 border-gold bg-black/90 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8 shadow-2xl relative"
      style={{ zIndex: 100 }}
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center bg-steel shadow-[0_0_15px_rgba(212,175,55,0.4)] overflow-hidden">
          <img
            src="/logo.png"
            alt="Eye-Dentify Logo"
            className="w-10 h-10 object-contain"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter text-white">
            EYE-<span className="text-cyan">DENTIFY</span>
          </h1>
          <span className="text-[8px] text-gold tracking-[0.4em] font-bold uppercase leading-none">
            Forensic Intelligence Platform
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-8 lg:gap-12">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              onClick={() => onTabChange(tab.id)}
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

      {/* Status & Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:block text-right">
          <p className="text-[10px] text-gold uppercase font-bold leading-none">
            {stats && stats.exists ? "FORENSIC_NODE: ONLINE" : "FORENSIC_NODE: OFFLINE"}
          </p>
          <p className="text-[8px] text-slate-500 leading-none mt-1">
            {stats && stats.exists
              ? `${stats.total_vectors.toLocaleString()} VECTORS INDEXED`
              : "AWAITING EVIDENCE"}
          </p>
        </div>

        <Link to="/">
          <button
            className="bg-gold hover:bg-yellow-600 text-black px-4 py-2 rounded text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
          >
            <Zap size={12} className="inline mr-1" />
            NEW CASE
          </button>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
