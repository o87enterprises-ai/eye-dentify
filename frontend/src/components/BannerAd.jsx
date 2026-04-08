import React, { useEffect, useRef } from "react";
import { useAdProvider } from "../services/adProvider.js";

function BannerAd({ id, size = "auto", position = "inline" }) {
  const containerRef = useRef(null);
  const adProvider = useAdProvider();

  useEffect(() => {
    if (containerRef.current) {
      adProvider.showBannerAd(containerRef.current.id);
    }
  }, [adProvider]);

  const positionClasses = {
    inline: "",
    below: "mt-6",
    sidebar: "",
  };

  return (
    <div
      id={id}
      ref={containerRef}
      className={`bg-steel/30 border border-slate-800/50 rounded-lg flex items-center justify-center ${positionClasses[position]}`}
      style={{
        minHeight: size === "banner" ? "90px" : size === "large" ? "250px" : "auto",
        width: size === "banner" ? "728px" : "100%",
        maxWidth: size === "banner" ? "100%" : "auto",
      }}
    />
  );
}

export default BannerAd;
