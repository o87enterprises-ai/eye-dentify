import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Award } from "lucide-react";
import { useAdProvider } from "../../services/adProvider.js";

function RewardedAdModal({ isOpen, onClose, onComplete }) {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [adStatus, setAdStatus] = useState("loading"); // loading | playing | completed
  const adProvider = useAdProvider();

  useEffect(() => {
    if (!isOpen) {
      setTimeRemaining(30);
      setAdStatus("loading");
      return;
    }

    let skipFn;

    const startAd = async () => {
      try {
        skipFn = await adProvider.showRewardedAd(
          () => {
            setAdStatus("completed");
            setTimeRemaining(0);
            setTimeout(() => {
              onComplete();
              onClose();
            }, 1500);
          },
          () => {
            // Ad skipped
            onClose();
          },
          () => {
            // Error - fallback to mock countdown
            startMockCountdown();
          }
        );
      } catch {
        startMockCountdown();
      }
    };

    const startMockCountdown = () => {
      setAdStatus("playing");
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setAdStatus("completed");
            setTimeout(() => {
              onComplete();
              onClose();
            }, 1500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    startAd();

    return () => {
      if (skipFn) skipFn();
    };
  }, [isOpen]);

  const progress = ((30 - timeRemaining) / 30) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card glass-card--gold p-8 max-w-md w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button (disabled during ad) */}
            <button
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors disabled:opacity-30"
              onClick={onClose}
              disabled={adStatus !== "completed"}
            >
              <X size={20} />
            </button>

            {/* Icon */}
            {adStatus === "completed" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto mb-6"
              >
                <Award size={40} className="text-success" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ rotate: adStatus === "playing" ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center mx-auto mb-6"
              >
                <Play size={40} className="text-gold" />
              </motion.div>
            )}

            {/* Title */}
            {adStatus === "completed" ? (
              <>
                <h3 className="text-xl font-black text-white mb-2">
                  Analysis Unlocked!
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Your analysis is being processed. Thank you for watching!
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black text-white mb-2">
                  Watch a Short Ad
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  {adStatus === "loading"
                    ? "Loading advertisement..."
                    : `Watch for ${timeRemaining}s to unlock your analysis`}
                </p>
              </>
            )}

            {/* Progress Bar */}
            {adStatus !== "completed" && (
              <div className="mb-6">
                <div className="h-3 bg-navy rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold to-cyan"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase">
                  {adStatus === "loading" ? "Loading..." : `${timeRemaining}s remaining`}
                </p>
              </div>
            )}

            {/* Completion Checkmark */}
            {adStatus === "completed" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-success text-sm font-bold uppercase tracking-wider"
              >
                ✓ Analysis unlocked
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RewardedAdModal;
