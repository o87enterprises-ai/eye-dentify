import React from "react";
import { motion } from "framer-motion";

function GlassCard({
  children,
  variant = "default",
  className = "",
  hover = true,
  animate = true,
  initial = { opacity: 0, y: 20 },
  whileInView = { opacity: 1, y: 0 },
  viewport = { once: true },
  ...props
}) {
  const variantClasses = {
    default: "glass-card",
    gold: "glass-card glass-card--gold",
    cyan: "glass-card glass-card--cyan",
    danger: "glass-card glass-card--danger",
    success: "glass-card glass-card--success",
  };

  const content = (
    <div
      className={`${variantClasses[variant]} ${className} ${hover ? "" : "hover:border-opacity-100 hover:translate-y-0 hover:shadow-none"}`}
      {...props}
    >
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={initial}
        whileInView={whileInView}
        viewport={viewport}
        transition={{ duration: 0.4 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

export default GlassCard;
