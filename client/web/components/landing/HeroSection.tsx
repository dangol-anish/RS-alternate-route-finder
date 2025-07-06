"use client";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import ScrollDownIndicator from "../ui/ScrollDownIndicator";
import AnimateInView from "../ui/AnimateInView";
import { motion } from "framer-motion";

const HeroSection = () => {
  const handleAndroidDownload = () => {
    // Create a temporary link element to trigger download
    const link = document.createElement("a");
    link.href = "/apk/roadsense.apk";
    link.download = "roadsense.apk";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGitHubRedirect = () => {
    window.open(
      "https://github.com/dangol-anish/RS-alternate-route-finder",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-4 relative pt-20 md:pt-0 w-[90%] mx-auto">
      <AnimateInView className="w-full md:w-1/2 flex flex-col gap-4 items-center md:items-start justify-center">
        <span className="flex items-center justify-start self-start gap-2 lg:ml-2">
          <Image src="/icons/Logo.svg" alt="logo" width={32} height={32} />
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--brown)]">
            <span className="text-[var(--green)]">Road</span>Sense
          </h1>
        </span>
        <span className="self-start lg:ml-2">
          <h2 className="text-4xl md:text-6xl font-bold text-[var(--brown)]">
            Smarter Routes.
          </h2>
          <h2 className="text-4xl md:text-6xl font-bold text-[var(--green)]">
            Fewer Roadblocks.
          </h2>
        </span>

        <p className="text-base md:text-xl font-light text-[var(--brown)] mb-2 lg:ml-2">
          RoadSense helps you outsmart traffic and roadblocks by finding faster,
          smarter alternative routes, keeping you on track every time.
        </p>
        <div className="flex flex-col md:flex-row  md:gap-4 gap-4 self-start lg:ml-2 w-full md:w-auto">
          <Button
            onClick={handleAndroidDownload}
            className="bg-[var(--green)] hover:bg-[var(--light-green)] text-white text-base md:text-lg self-start cursor-pointer w-full md:w-auto"
          >
            Download for Android (APK)
          </Button>
          <Button
            onClick={handleGitHubRedirect}
            className="bg-[var(--brown)] hover:bg-[var(--light-brown)] text-white text-base md:text-lg self-start cursor-pointer w-full md:w-auto flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            View on GitHub
          </Button>
        </div>
        <span className="italic text-xs lg:ml-2 self-start text-[var(--light-brown)]">
          *Currently available only for Kathmandu and Lalitpur, Nepal
        </span>
      </AnimateInView>
      <AnimateInView
        className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0 relative"
        delay={0.2}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[340px] md:h-[340px] lg:w-[420px] lg:h-[420px] rounded-full bg-[var(--light-green)] opacity-80 z-1"
          animate={{
            scale: [1, 1.04, 1],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="w-full md:max-w-full self-end z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <Image
            src="/mockup/mockup2.svg"
            alt="mockup"
            width={400}
            height={400}
            className="w-full md:max-w-full self-end z-10"
          />
        </motion.div>
      </AnimateInView>
      {/* Scroll Down Indicator - show on sm and up */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex">
        <ScrollDownIndicator />
      </div>
    </div>
  );
};

export default HeroSection;
