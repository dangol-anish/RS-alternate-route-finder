"use client";
import React from "react";
import ScrollHideNavbar from "../components/ui/ScrollHideNavbar";
import HeroSection from "@/components/landing/HeroSection";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import AppDownload from "@/components/landing/AppDownload";

const page = () => {
  return (
    <div
      className="min-w-full flex flex-col"
      style={{ background: "var(--landing-gradient)" }}
    >
      <div className="w-full">
        <ScrollHideNavbar />
        <HeroSection />
        <Features />
        <HowItWorks />
        <AppDownload />
      </div>
    </div>
  );
};

export default page;
