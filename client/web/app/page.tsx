import React from "react";
import { Navbar } from "../components/ui/Navbar";

const page = () => {
  return (
    <div
      className="min-h-screen min-w-full flex flex-col"
      style={{ background: "var(--landing-gradient)" }}
    >
      <Navbar />
      <div className="flex-1 flex items-center justify-center">page</div>
    </div>
  );
};

export default page;
