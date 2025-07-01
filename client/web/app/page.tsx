import React from "react";
import { Navbar } from "../components/ui/Navbar";
import Image from "next/image";
import HeroSection from "@/components/landing/HeroSection";

const page = () => {
  return (
    <div
      className=" min-w-full flex flex-col"
      style={{ background: "var(--landing-gradient)" }}
    >
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default page;
