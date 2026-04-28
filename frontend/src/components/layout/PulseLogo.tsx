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
      {/* Main Star (Vertical/Horizontal) */}
      <path
        d="M50 5L58 42L95 50L58 58L50 95L42 58L5 50L42 42Z"
        fill="currentColor"
      />

      {/* Secondary Star (Rotated 45 degrees) */}
      <path
        d="M50 15L56 44L85 50L56 56L50 85L44 56L15 50L44 44Z"
        fill="currentColor"
        transform="rotate(45 50 50)"
        opacity="0.35"
      />
    </svg>
  );
};

export default PulseLogo;
