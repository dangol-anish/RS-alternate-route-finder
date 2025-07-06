import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import AnimateInView from "../ui/AnimateInView";
import { motion } from "framer-motion";

const AppDownload = () => {
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
    <section
      id="download"
      className="min-h-screen flex flex-col relative py-20 overflow-hidden bg-gradient-to-b from-white to-[var(--beige)]"
    >
      <AnimateInView>
        {/* Rounded rectangular background shape */}
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-[85vh] bg-[var(--light-green)]/50 rounded-b-[200px] z-10"
          animate={{
            scale: [1, 1.03, 1],
            y: [0, 8, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="relative z-20 flex-1 flex flex-col justify-center items-center w-[90%] max-w-6xl mx-auto">
          <div className="flex flex-col gap-4">
            <h2 className="text-5xl md:text-5xl font-extrabold text-center text-[var(--brown)] bg-clip-text mb-2">
              Download <span className="text-[var(--green)]">RoadSense </span>
              now and never get stuck in traffic again.
            </h2>
            <div className="flex flex-col md:flex-row  md:gap-4 gap-4 items-center justify-center  w-full md:w-auto ">
              <Button
                onClick={handleAndroidDownload}
                className="bg-[var(--green)] hover:bg-[var(--light-green)] text-white text-base md:text-xl self-start cursor-pointer w-full md:w-auto"
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
          </div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[800px] mx-auto"
          >
            <Image
              src="/mockup/appdownloadmockup.svg"
              alt="App Download Mockup"
              height={1000}
              width={1000}
              className="w-full max-w-[800px] mx-auto"
            />
          </motion.div>
        </div>
      </AnimateInView>
    </section>
  );
};

export default AppDownload;
