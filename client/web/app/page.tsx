"use client";
import React from "react";
import ScrollHideNavbar from "../components/ui/ScrollHideNavbar";
import HeroSection from "@/components/landing/HeroSection";
import Features from "@/components/landing/Features";

const page = () => {
  return (
    <div
      className="min-w-full flex flex-col"
      style={{ background: "var(--landing-gradient)" }}
    >
      <div className="w-[90%] mx-auto">
        <ScrollHideNavbar />
        <HeroSection />
        <Features />
      </div>
    </div>
  );
};

export default page;
