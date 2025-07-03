import { motion, useAnimation, useInView } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface AnimateInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  className?: string;
}

/**
 * Animates children with a fade-up and slight slide-in when in view.
 * Usage: <AnimateInView><YourComponent /></AnimateInView>
 */
export default function AnimateInView({
  children,
  delay = 0,
  duration = 0.7,
  y = 32,
  once = true,
  className = "",
}: AnimateInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-40px" });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.4, 0, 0.2, 1],
        },
      });
    }
  }, [inView, controls, delay, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}
