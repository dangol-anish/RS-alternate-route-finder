import React from "react";
import { Navbar } from "../components/ui/Navbar";
import Image from "next/image";
import HeroSection from "@/components/landing/HeroSection";

const page = () => {
  return (
    <div
      className="min-w-full flex flex-col"
      style={{ background: "var(--landing-gradient)" }}
    >
      <div className="w-[90%] mx-auto">
        <Navbar />
        <HeroSection />
      </div>
    </div>
  );
};

export default page;
