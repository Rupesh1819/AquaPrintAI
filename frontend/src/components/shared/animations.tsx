"use client";

import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

export const FadeInUp = ({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & HTMLMotionProps<"div">) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const GlassHover = ({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`glass-card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const PageTransition = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
