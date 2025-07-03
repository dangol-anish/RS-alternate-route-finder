import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FiMapPin, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import AnimateInView from "../ui/AnimateInView";

const features = [
  {
    title: "Real-Time Map Navigation",
    description:
      "Interactive maps with live GPS tracking to guide you every step of the way.",
    iconBg: "bg-[var(--green)]/40",
    icon: <FiMapPin size={26} className="text-[var(--brown)]" />,
  },
  {
    title: "Alternate Route Suggestions",
    description:
      "Smart rerouting based on roadblocks or hazards to keep you moving.",
    iconBg: "bg-[var(--green)]/40",
    icon: <FiTrendingUp size={26} className="text-[var(--brown)]" />,
  },
  {
    title: "Obstacle Reporting",
    description:
      "Community-powered reporting of obstacles and road conditions in real-time.",
    iconBg: "bg-[var(--green)]/40",
    icon: <FiAlertCircle size={26} className="text-[var(--brown)]" />,
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="min-h-[80%] py-20 bg-gradient-to-r from-white to-[var(--beige)]"
    >
      <AnimateInView>
        <div className="w-[90%] max-w-6xl mx-auto">
          <div className="flex flex-col gap-4">
            <h2
              className="
                text-5xl md:text-6xl font-extrabold text-center
                text-[var(--brown)]
              "
            >
              Powerful Features for Smart Navigation
            </h2>
            <p
              className="
                text-lg md:text-xl text-center mb-12
                bg-gradient-to-r from-[var(--brown)] to-[var(--light-brown)]
                bg-clip-text text-transparent
              "
            >
              Explore how RoadSense uses advanced technology to make your daily
              commute faster, smarter, and less stressful.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4 sm:p-8 lg:p-12 pt-12 sm:pt-16 lg:pt-24">
            {features.map((feature, i) => (
              <AnimateInView key={feature.title} delay={0.1 + i * 0.12}>
                <Card className="h-full border border-[var(--brown)]/10 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div
                    className={`w-16 h-16 rounded-lg flex items-center justify-center ${feature.iconBg}`}
                  >
                    {feature.icon}
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="text-left font-bold text-lg text-[var(--brown)] ">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-left font-normal text-base text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimateInView>
            ))}
          </div>
        </div>
      </AnimateInView>
    </section>
  );
};

export default Features;
