import React from "react";

interface PulseLogoProps {
  className?: string;
  size?: number;
}

const PulseLogo = ({ className = "", size = 32 }: PulseLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id="pulse-gradient-logo"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Main Star */}
      <path
        d="M50 2L61 35H96L68 55L79 88L50 68L21 88L32 55L4 35H39L50 2Z"
        fill="url(#pulse-gradient-logo)"
      />

      {/* Offset Secondary Star (Double Star effect) */}
      <path
        d="M50 15L58 39H83L63 54L71 78L50 63L29 78L37 54L17 39H42L50 15Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
};

export default PulseLogo;
