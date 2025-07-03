import React from "react";

const steps = [
  {
    title: "Download the App",
    content:
      "Download the RoadSense app to start your journey toward smoother and smarter navigation.",
  },
  {
    title: "Explore the Map",
    content:
      "Use our interactive map to view real-time traffic updates and reported obstacles. Set your source and destination on map to get a route avoiding obstacles on the way.",
  },
  {
    title: "Report Roadblocks",
    content:
      "See a roadblock or closure? Report it to help others. As your reputation grows, your reports and votes have greater impact on improving routes.",
  },
  {
    title: "Find Alternate Routes",
    content:
      "Our smart system will suggest the best alternate routes to avoid delays and obstructions on the way.",
  },
];

const stepImages = [
  "/mockup/step1.svg",
  "/mockup/step2.svg",
  "/mockup/step3.svg",
  "/mockup/step4.svg",
];

const HowItWorks = () => {
  return (
    <section className="min-h-screen py-20 bg-gradient-to-r from-[var(--beige)]/80 via-[var(--light-green)]/80 to-[var(--green)]/80">
      <div className="flex flex-col gap-4">
        {" "}
        <h2
          className="
    text-5xl md:text-5xl font-extrabold text-center
 text-[var(--brown)] 
    bg-clip-text 
  "
        >
          How <span className="text-[var(--green)]">Road</span>Sense Works
        </h2>
        <p className="text-center text-[var(--brown)] text-xl font-light">
          Make smarter travel choices and skip the roadblocks with RS Alternate
          Route Finder - just follow these easy steps.
        </p>
      </div>
      <div className="flex flex-col gap-12 mt-24 w-[90%] mx-auto">
        {steps.map((step, idx) => (
          <div
            key={step.title}
            className={`flex flex-col lg:flex-row items-center justify-center gap-8 ${
              idx % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Step image */}
            <div className="w-full max-w-lg flex-shrink-0 mb-4 lg:mb-0">
              <img
                src={stepImages[idx]}
                alt={`Step ${idx + 1}`}
                className="w-full h-auto"
              />
            </div>
            {/* Step text and arrow */}
            <div className="flex flex-col w-full max-w-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 aspect-square rounded-full bg-[var(--green)] flex items-center justify-center text-white font-bold text-2xl mr-6 shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-1 text-[var(--brown)]">
                    {step.title}
                  </h3>
                  <p className="text-[var(--brown)] text-xl font-normal">
                    {step.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
