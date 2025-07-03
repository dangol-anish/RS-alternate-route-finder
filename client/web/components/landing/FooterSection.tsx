import Link from "next/link";
import React from "react";

const FooterSection = () => {
  return (
    <footer className="bg-[var(--brown)] text-[var(--beige)] py-12 pb-4 px-4 ">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-start gap-8 pb-12">
        {/* Left: Brand and tagline */}
        <div>
          <div className="text-3xl font-bold mb-2">
            Road<span className="text-[var(--green)]">Sense</span>
          </div>
          <div className="text-[var(--beige)]/80 text-lg">
            Smarter routes, fewer roadblocks.
          </div>
        </div>
        {/* Right: Features */}
        <div>
          <ul className="space-y-1">
            <li>
              <a
                href="#features"
                className="hover:text-[var(--green)] transition-colors text-lg"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#demo"
                className="hover:text-[var(--green)] transition-colors text-lg"
              >
                How It Works
              </a>
            </li>
            <li>
              <a
                href="#download"
                className="hover:text-[var(--green)] transition-colors text-lg"
              >
                Download
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full border-b border-[var(--light-brown)]"></div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center pt-2 text-base text-[var(--beige)]">
        <div>© {new Date().getFullYear()} RoadSense. All rights reserved.</div>
        <div>
          Made by{" "}
          <Link href="https://www.dangolanish.com.np/" target="_blank">
            Anish Dangol
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
