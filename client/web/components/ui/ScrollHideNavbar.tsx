"use client";
import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "./Navbar";

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
    <div
      className={`
        fixed top-0 left-0 w-full z-[100]
        pointer-events-none bg-none
        transition-transform transition-opacity duration-300 ease-in-out
        ${show ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}
    >
      <div className="pointer-events-auto">
        <Navbar />
      </div>
    </div>
  );
};

export default ScrollHideNavbar;
