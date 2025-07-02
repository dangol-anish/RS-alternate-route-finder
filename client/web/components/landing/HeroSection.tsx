"use client";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import ScrollDownIndicator from "../ui/ScrollDownIndicator";

const HeroSection = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-4 relative pt-20 md:pt-0 w-[90%] mx-auto">
      <section className="w-full md:w-1/2 flex flex-col gap-4 items-center md:items-start justify-center">
        <span className="flex items-center justify-start self-start gap-2 ml-2">
          <Image src="/icons/Logo.svg" alt="logo" width={32} height={32} />
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--brown)]">
            RoadSense
          </h1>
        </span>
        <span className="self-start ml-2">
          <h2 className="text-4xl md:text-6xl font-bold text-[var(--brown)]">
            Smarter Routes.
          </h2>
          <h2 className="text-4xl md:text-6xl font-bold text-[var(--green)]">
            Fewer Roadblocks.
          </h2>
        </span>

        <p className="text-base md:text-xl font-light text-[var(--brown)] mb-2 ml-2">
          RoadSense helps you outsmart traffic and roadblocks by finding faster,
          smarter alternative routes, keeping you on track every time.
        </p>
        <div className="flex flex-col md:flex-row  md:gap-4 gap-4 self-start ml-2 w-full md:w-auto">
          <Button className="bg-[var(--green)] hover:bg-[var(--light-green)] text-white text-base md:text-lg self-start cursor-pointer w-full md:w-auto">
            Download for Android (APK)
          </Button>
          <Button className="bg-[var(--brown)] hover:bg-[var(--light-brown)] text-white text-base md:text-lg self-start cursor-pointer w-full md:w-auto">
            Download on iOS
          </Button>
        </div>
        <span className="italic text-xs ml-2 self-start text-[var(--light-brown)]">
          *Currently available only for Kathmandu and Lalitpur, Nepal
        </span>
      </section>
      <section className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0">
        <Image
          src="/mockup/mockup2.svg"
          alt="mockup"
          width={400}
          height={400}
          className="w-full  md:max-w-full self-end"
        />
      </section>
      {/* Scroll Down Indicator - show on sm and up */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex">
        <ScrollDownIndicator />
      </div>
    </div>
  );
};

export default HeroSection;
