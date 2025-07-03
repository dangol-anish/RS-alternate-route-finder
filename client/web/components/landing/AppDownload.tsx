import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import AnimateInView from "../ui/AnimateInView";
import { motion } from "framer-motion";

const AppDownload = () => {
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
              <Button className="bg-[var(--green)] hover:bg-[var(--light-green)] text-white text-base md:text-xl self-start cursor-pointer w-full md:w-auto">
                Download for Android (APK)
              </Button>
              <Button className="bg-[var(--brown)] hover:bg-[var(--light-brown)] text-white text-base md:text-lg self-start cursor-pointer w-full md:w-auto">
                Download on iOS (IPA)
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
