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

      {/* Main Star (Vertical/Horizontal) */}
      <path
        d="M50 5L58 42L95 50L58 58L50 95L42 58L5 50L42 42Z"
        fill="url(#pulse-gradient-logo)"
      />

      {/* Secondary Star (Rotated 45 degrees) */}
      <path
        d="M50 15L56 44L85 50L56 56L50 85L44 56L15 50L44 44Z"
        fill="url(#pulse-gradient-logo)"
        transform="rotate(45 50 50)"
        opacity="0.6"
      />
    </svg>
  );
};

export default PulseLogo;
