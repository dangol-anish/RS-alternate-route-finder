import { ChevronDown } from "lucide-react";

export default function ScrollDownIndicator() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md shadow-md border border-white/30 animate-bounce-slow">
        <ChevronDown className="w-7 h-7 text-[var(--brown)] opacity-80 animate-fade-in-out" />
      </div>
      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(16px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1.6s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fade-in-out {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 1.6s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
