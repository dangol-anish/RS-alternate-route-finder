import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";

const HeroSection = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <section className=" w-1/2 flex flex-col gap-4 items-center justify-center">
        <span className="flex items-center justify-start self-start gap-2 ml-2">
          <Image src="/icons/Logo.svg" alt="logo" width={32} height={32} />
          <h1 className="text-3xl font-bold text-[var(--brown)]">RoadSense</h1>
        </span>
        <span>
          <h2 className="text-7xl font-bold text-[var(--brown)]">
            Smarter Routes.
          </h2>
          <h2 className="text-7xl font-bold text-[var(--green)]">
            Fewer Roadblocks.
          </h2>
        </span>

        <p className="text-xl font-light text-[var(--brown)] mb- ml-2">
          RoadSense helps you outsmart traffic and roadblocks by finding faster,
          smarter alternative routes, keeping you on track every time.
        </p>
        <div className="flex gap-6 self-start ml-2">
          {" "}
          <Button className="bg-[var(--green)] hover:bg-[var(--light-green)] text-white text-lg self-start cursor-pointer">
            Download for Android (APK)
          </Button>
          <Button className="bg-[var(--brown)] hover:bg-[var(--light-brown)] text-white text-lg self-start cursor-pointer">
            Download on iOS
          </Button>
        </div>
      </section>
      <section className="w-1/2">
        <Image
          src="/mockup/mockup2.svg"
          alt="mockup"
          width={900}
          height={900}
          className=""
        />
      </section>
    </div>
  );
};

export default HeroSection;
