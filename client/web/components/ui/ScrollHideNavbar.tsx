"use client";
import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";

const ScrollHideNavbar = () => {
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShow(false); // scrolling down
      } else {
        setShow(true); // scrolling up
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="navbar"
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-0 left-0 w-full z-[100] pointer-events-none bg-none"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="pointer-events-auto">
            <Navbar />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollHideNavbar;
