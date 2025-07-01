export default function ScrollDownIndicator() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-16 flex items-center justify-center">
        <svg
          width="40"
          height="48"
          viewBox="0 0 40 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="4"
            y="4"
            width="32"
            height="56"
            rx="16"
            stroke="var(--green)"
            strokeWidth="3"
            fill="none"
          />
          <circle
            className="animate-scroll"
            cx="20"
            cy="20"
            r="5"
            fill="var(--green)"
          />
        </svg>
      </div>

      <style>{`
        @keyframes scroll {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(18px); opacity: 0.5; }
        }
        .animate-scroll {
          animation: scroll 1.4s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
