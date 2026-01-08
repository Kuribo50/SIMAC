import React from "react";

interface InstitutionalSealProps {
  role: string; // e.g., "JEFE AREA ADMINISTRATIVA" or "SERVICIO TÉCNICO"
  color?: string;
  size?: number;
  establecimiento?: string;
}

export default function InstitutionalSeal({
  role,
  color = "#7c3aed", // Default to a vivid purple (violet-600)
  size = 140, // Slightly smaller default
  establecimiento = "CESFAM DR. ALBERTO REYES",
}: InstitutionalSealProps) {
  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full opacity-90"
        style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.1))" }}
      >
        {/* Outer Dotted Circle (The "Estrias") */}
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray="8 6"
        />

        {/* Inner Solid Circle */}
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />

        {/* Text Paths */}
        <defs>
          <path id="curveTop" d="M 35,100 A 65,65 0 0,1 165,100" />
          <path id="curveBottom" d="M 40,100 A 60,60 0 0,0 160,100" />
        </defs>

        {/* Top Text */}
        <text
          fontSize="14"
          fontWeight="900"
          fill={color}
          textAnchor="middle"
          letterSpacing="1"
          style={{ textTransform: "uppercase" }}
        >
          <textPath xlinkHref="#curveTop" startOffset="50%">
            {establecimiento}
          </textPath>
        </text>

        {/* Bottom Text - Fixed Position */}
        <text
          fontSize="16"
          fontWeight="900"
          fill={color}
          textAnchor="middle"
          letterSpacing="2"
        >
          <textPath xlinkHref="#curveBottom" startOffset="50%">
            TOMÉ
          </textPath>
        </text>

        {/* Decorative Stars */}
        <text
          x="15"
          y="110"
          fontSize="24"
          fill={color}
          fontWeight="bold"
          transform="rotate(-15 15 110)"
        >
          ★
        </text>
        <text
          x="175"
          y="110"
          fontSize="24"
          fill={color}
          fontWeight="bold"
          transform="rotate(15 175 110)"
        >
          ★
        </text>

        {/* Center Content (Role) */}
        <foreignObject x="45" y="65" width="110" height="70">
          <div className="h-full flex flex-col items-center justify-center text-center leading-none">
            {/* Inner Icon or Graphic (Optional) */}
            <div className="mb-1" style={{ color }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p
              style={{ color }}
              className="text-[10px] font-black uppercase tracking-wider"
            >
              CERTIFICADO
            </p>
            <p
              style={{ color }}
              className="text-[9px] font-bold uppercase mt-0.5"
            >
              {role}
            </p>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
