import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../services/api.jsx";

/**
 * Hook for tracking daily analysis limit and handling ad-gated access.
 */
export function useDailyLimit() {
  const { user, refreshUser } = useAuth();
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState(null);

  const dailyLimit = 1;
  const currentCount = user?.daily_analysis_count || 0;
  const isLimitReached = currentCount >= dailyLimit;

  /**
   * Attempt to create an analysis. If limit reached, show ad modal.
   * @param {Function} createFn - The analysis creation function
   * @param {string} videoId - The video ID to analyze
   * @param {string} analysisType - Type of analysis
   */
  const requestAnalysis = useCallback(async (createFn, videoId, analysisType = "full") => {
    if (!isLimitReached) {
      // Within limit, create analysis directly
      return createFn(videoId, analysisType);
    }

    // Limit reached, store the pending analysis and show ad modal
    setPendingAnalysis({ createFn, videoId, analysisType });
    setShowAdModal(true);
    return null;
  }, [isLimitReached]);

  /**
   * Called after the user completes watching the rewarded ad.
   * Creates the analysis without incrementing the counter.
   */
  const handleAdComplete = useCallback(async () => {
    if (!pendingAnalysis) return;

    const { createFn, videoId, analysisType } = pendingAnalysis;

    try {
      // Use the ad-unlock endpoint (doesn't increment counter)
      const result = await api.unlockAnalysis(videoId, analysisType);
      setPendingAnalysis(null);
      await refreshUser();
      return result;
    } catch (err) {
      console.error("Failed to unlock analysis:", err);
      throw err;
    }
  }, [pendingAnalysis, refreshUser]);

  const closeAdModal = useCallback(() => {
    setShowAdModal(false);
    setPendingAnalysis(null);
  }, []);

  return {
    user,
    dailyLimit,
    currentCount,
    isLimitReached,
    showAdModal,
    requestAnalysis,
    handleAdComplete,
    closeAdModal,
  };
}

export default useDailyLimit;
