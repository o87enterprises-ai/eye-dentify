import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, X, Zap, Shield, Database, Clock } from "lucide-react";

function PremiumPage() {
  const features = {
    free: [
      { text: "1 analysis per day", included: true },
      { text: "Basic reverse search", included: true },
      { text: "Standard resolution", included: true },
      { text: "Ad-supported access", included: true },
      { text: "Advanced AI detection", included: false },
      { text: "GPS metadata extraction", included: false },
      { text: "Priority processing", included: false },
      { text: "API access", included: false },
    ],
    premium: [
      { text: "Unlimited analyses", included: true },
      { text: "Advanced reverse search", included: true },
      { text: "4K resolution support", included: true },
      { text: "No advertisements", included: true },
      { text: "Advanced AI detection", included: true },
      { text: "GPS metadata extraction", included: true },
      { text: "Priority processing", included: true },
      { text: "API access", included: true },
    ],
  };

  return (
    <div className="min-h-screen bg-navy p-4 lg:p-8">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 pt-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-gold bg-steel shadow-[0_0_30px_rgba(212,175,55,0.3)] mb-6">
            <Crown size={32} className="text-gold" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Upgrade to <span className="text-gold">PREMIUM</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Unlock the full power of Eye-Dentify with unlimited analyses, advanced features, and priority processing.
          </p>
        </motion.div>

        {/* Coming Soon Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider">
            <Clock size={16} />
            Coming Soon
          </span>
          <p className="text-slate-500 text-xs mt-3">
            Premium subscriptions will be available next week
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-black text-white mb-1">FREE</h3>
              <p className="text-3xl font-black text-cyan">$0</p>
              <p className="text-slate-500 text-xs">forever</p>
            </div>

            <ul className="space-y-3">
              {features.free.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  {feature.included ? (
                    <Check size={16} className="text-success flex-shrink-0" />
                  ) : (
                    <X size={16} className="text-slate-600 flex-shrink-0" />
                  )}
                  <span className={feature.included ? "text-slate-300" : "text-slate-600"}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <button className="w-full mt-8 py-3 rounded border border-slate-700 text-slate-500 text-sm font-bold uppercase tracking-wider cursor-not-allowed">
              Current Plan
            </button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card glass-card--gold p-8 relative"
          >
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gold text-black text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-black text-white mb-1">PREMIUM</h3>
              <p className="text-3xl font-black text-gold">$9.99</p>
              <p className="text-slate-500 text-xs">per month</p>
            </div>

            <ul className="space-y-3">
              {features.premium.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <Check size={16} className="text-gold flex-shrink-0" />
                  <span className="text-slate-300">{feature.text}</span>
                </li>
              ))}
            </ul>

            <button
              className="w-full mt-8 py-3 rounded bg-gold/20 border border-gold text-gold text-sm font-bold uppercase tracking-wider hover:bg-gold hover:text-black transition-all cursor-not-allowed"
              title="Premium subscriptions available next week"
            >
              <Zap size={14} className="inline mr-2" />
              Coming Soon
            </button>
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan text-sm transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PremiumPage;
