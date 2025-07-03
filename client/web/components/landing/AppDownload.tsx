import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

const AppDownload = () => {
  return (
    <section className="min-h-screen flex flex-col relative py-20 overflow-hidden bg-gradient-to-b from-white to-[var(--beige)]">
      {/* Rounded rectangular background shape */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[75vh] bg-[var(--light-green)]/50 rounded-b-[200px] z-10"></div>

      <div className="flex-1 flex flex-col justify-center items-center w-[90%] max-w-6xl mx-auto z-11">
        <div className="flex flex-col gap-4">
          <h2 className="text-5xl md:text-5xl font-extrabold text-center text-[var(--brown)] bg-clip-text mb-2">
            Download <span className="text-[var(--green)]">RoadSense </span>
            now and never get stuck in traffic again.
          </h2>
          <div className="flex flex-col md:flex-row  md:gap-4 gap-4 items-center justify-center ml-2 w-full md:w-auto ">
            <Button className="bg-[var(--green)] hover:bg-[var(--light-green)] text-white text-base md:text-lg self-start cursor-pointer w-full md:w-auto">
              Download for Android (APK)
            </Button>
            <Button className="bg-[var(--brown)] hover:bg-[var(--light-brown)] text-white text-base md:text-lg self-start cursor-pointer w-full md:w-auto">
              Download on iOS
            </Button>
          </div>
        </div>

        <Image
          src="/mockup/appdownloadmockup.svg"
          alt="App Download Mockup"
          height={1000}
          width={1000}
          className="w-full max-w-[800px] mx-auto"
        />
      </div>
    </section>
  );
};

export default AppDownload;
