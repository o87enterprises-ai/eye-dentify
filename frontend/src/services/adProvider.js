/**
 * Ad Provider Abstraction Layer
 * Factory pattern to swap between ad providers easily.
 */

const AD_PROVIDER = import.meta.env.VITE_AD_PROVIDER || "mock";

/**
 * Base interface for ad providers
 */
class AdProvider {
  /**
   * Show a rewarded video ad
   * @param {Function} onComplete - Callback when ad is completed
   * @param {Function} onSkip - Callback when ad is skipped
   * @param {Function} onError - Callback when ad fails
   */
  // eslint-disable-next-line no-unused-vars
  async showRewardedAd(onComplete, onSkip, onError) {
    throw new Error("showRewardedAd must be implemented");
  }

  /**
   * Show a banner ad in the specified container
   * @param {string} containerId - DOM element ID to render the ad
   */
  // eslint-disable-next-line no-unused-vars
  showBannerAd(containerId) {
    throw new Error("showBannerAd must be implemented");
  }
}

/**
 * Mock Ad Provider - simulates ads for development/testing
 */
class MockAdProvider extends AdProvider {
  async showRewardedAd(onComplete, _onSkip, onError) {
    try {
      // Simulate a 30-second ad
      const duration = 30;
      let remaining = duration;

      const countdown = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(countdown);
          onComplete();
        }
      }, 1000);

      // Return a function to skip the ad
      return () => {
        clearInterval(countdown);
        // In mock mode, skipping is allowed
        onComplete();
      };
    } catch (err) {
      onError(err);
    }
  }

  showBannerAd(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="
        background: rgba(18, 28, 38, 0.6);
        border: 1px solid rgba(212, 175, 55, 0.2);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
        color: #7F8C9A;
        font-size: 12px;
        font-family: 'Inter', system-ui, sans-serif;
      ">
        <p style="margin-bottom: 4px; color: #D4AF37; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 10px;">
          Advertisement
        </p>
        <p>Ad Placeholder — 728x90</p>
        <p style="font-size: 10px; margin-top: 4px;">Configure VITE_AD_PROVIDER=google for real ads</p>
      </div>
    `;
  }
}

/**
 * Google AdSense Provider
 * Implements Google AdSense Rewarded Ads and Banner Ads
 */
class GoogleAdProvider extends AdProvider {
  constructor() {
    super();
    this.clientId = import.meta.env.VITE_GOOGLE_AD_CLIENT || "";
    this.rewardedSlot = import.meta.env.VITE_GOOGLE_AD_REWARDED_SLOT || "";
    this.bannerSlot = import.meta.env.VITE_GOOGLE_AD_BANNER_SLOT || "";
  }

  async showRewardedAd(onComplete, onSkip, onError) {
    try {
      if (!window.adsbygoogle) {
        onError(new Error("Google AdSense not loaded"));
        return;
      }

      // Load Google AdSense rewarded ad
      const rewardedAd = new google.ads.RewardedAd(this.rewardedSlot);

      rewardedAd.load(() => {
        rewardedAd.show();
      });

      rewardedAd.on("rewarded", () => {
        onComplete();
      });

      rewardedAd.on("closed", () => {
        // User closed without watching full ad
        onSkip();
      });

      rewardedAd.on("error", (err) => {
        onError(err);
      });

      return () => rewardedAd.destroy();
    } catch (err) {
      onError(err);
    }
  }

  showBannerAd(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${this.clientId}"
           data-ad-slot="${this.bannerSlot}"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    `;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense banner failed:", err);
    }
  }
}

/**
 * Factory function to get the configured ad provider
 * @returns {AdProvider}
 */
export function getAdProvider() {
  const providers = {
    mock: MockAdProvider,
    google: GoogleAdProvider,
  };

  const ProviderClass = providers[AD_PROVIDER] || MockAdProvider;
  return new ProviderClass();
}

// Singleton instance
let adProviderInstance = null;

export function useAdProvider() {
  if (!adProviderInstance) {
    adProviderInstance = getAdProvider();
  }
  return adProviderInstance;
}

export { AdProvider, MockAdProvider, GoogleAdProvider };
