import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Shield, MapPin, Zap, ArrowRight, Crown, ChevronDown } from "lucide-react";
import ForensicCanvas from "../../components/ForensicEye.jsx";

function LandingPage() {
  const pillarsRef = useRef(null);

  const scrollToPillars = () => {
    pillarsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const pillars = [
    {
      icon: Search,
      title: "Reverse Search",
      description: "Find visually similar evidence using AI-powered feature matching across the indexed database. Powered by ResNet50 and FAISS vector search.",
      color: "cyan",
    },
    {
      icon: Shield,
      title: "AI Detection",
      description: "Detect AI-generated or manipulated content using advanced heuristic analysis and pattern recognition. Identify deepfakes with confidence.",
      color: "gold",
    },
    {
      icon: MapPin,
      title: "Metadata Extraction",
      description: "Extract GPS coordinates, timestamps, and technical metadata from digital evidence files. Complete forensic analysis at your fingertips.",
      color: "success",
    },
  ];

  const premiumFeatures = [
    { icon: Zap, text: "Unlimited daily analyses" },
    { icon: Shield, text: "Advanced AI detection models" },
    { icon: Search, text: "4K resolution support" },
    { icon: MapPin, text: "GPS metadata extraction" },
    { icon: Crown, text: "Priority processing queue" },
    { icon: ArrowRight, text: "API access for automation" },
  ];

  return (
    <div className="min-h-screen bg-navy overflow-x-hidden">
      {/* Background 3D Engine */}
      <div className="fixed inset-0 opacity-30">
        <ForensicCanvas isAnalyzing={false} alertLevel={20} />
      </div>

      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg opacity-10 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gold bg-steel/80 shadow-[0_0_40px_rgba(212,175,55,0.3)] mb-8"
          >
            <img src="/logo.png" alt="Eye-Dentify" className="w-20 h-20 md:w-28 md:h-28 object-contain" />
          </motion.div>

          {/* Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
          >
            Integrity. Insight.
            <br />
            <span className="text-cyan">Identification.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The AI-powered digital forensics platform for reverse video search,
            deepfake detection, and metadata extraction.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <button className="w-full sm:w-auto bg-gold hover:bg-yellow-600 text-black px-8 py-4 rounded-lg text-sm font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2">
                <Zap size={18} />
                START FREE ANALYSIS
              </button>
            </Link>
            <button
              onClick={scrollToPillars}
              className="w-full sm:w-auto border border-slate-700 hover:border-cyan text-slate-300 hover:text-cyan px-8 py-4 rounded-lg text-sm font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              LEARN MORE
              <ChevronDown size={18} />
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            <div>
              <p className="text-2xl md:text-3xl font-black text-cyan">10K+</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Videos Indexed</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-gold">99.2%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Accuracy</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-success">&lt;30s</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Analysis Time</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section ref={pillarsRef} className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Core <span className="text-gold">Capabilities</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Three pillars of forensic intelligence working together to deliver actionable insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const colorMap = {
                cyan: "glass-card--cyan",
                gold: "glass-card--gold",
                success: "glass-card--success",
              };
              const iconColorMap = {
                cyan: "text-cyan",
                gold: "text-gold",
                success: "text-success",
              };

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className={`glass-card ${colorMap[pillar.color]} p-6 md:p-8`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-navy/50 flex items-center justify-center mb-5 ${iconColorMap[pillar.color]}`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-white font-bold text-base md:text-lg uppercase tracking-wider mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Crown size={14} />
              Premium
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Unlock <span className="text-gold">Full Power</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Go beyond the free tier with advanced features designed for professional forensic analysis.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card glass-card--gold p-8 md:p-12 max-w-2xl mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {premiumFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-navy/30">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-gold" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link to="/register">
                <button className="bg-gold hover:bg-yellow-600 text-black px-8 py-3 rounded-lg text-sm font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)]">
                  GET STARTED FREE
                </button>
              </Link>
              <p className="text-slate-500 text-xs mt-3">
                1 free analysis per day • No credit card required
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12"
          >
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
              Ready to <span className="text-cyan">Analyze</span>?
            </h2>
            <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto">
              Create your free account and start investigating digital evidence today.
              Powered by ResNet50, FAISS, and advanced heuristic analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <button className="w-full sm:w-auto bg-cyan hover:bg-cyan/80 text-black px-8 py-4 rounded-lg text-sm font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:shadow-[0_0_35px_rgba(0,209,255,0.5)]">
                  CREATE FREE ACCOUNT
                </button>
              </Link>
              <Link to="/login">
                <button className="w-full sm:w-auto border border-slate-700 hover:border-gold text-slate-300 hover:text-gold px-8 py-4 rounded-lg text-sm font-bold tracking-wider uppercase transition-all">
                  SIGN IN
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-slate-600 text-xs">
            Integrity • Insight • Identification — © 2026 087 Software Development
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
