"use client";

import React, { useEffect, useState, useRef } from "react";

interface AmbientStructuralWireframesProps {
  className?: string;
  intensity?: "subtle" | "prominent";
}

export function AmbientStructuralWireframes({
  className = "",
  intensity = "subtle",
}: AmbientStructuralWireframesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse offset from screen center (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const strokeOpacity = intensity === "prominent" ? "opacity-90" : "opacity-75";

  // Interpolated parallax offsets for different depth layers
  const p1X = mouseOffset.x * 14;
  const p1Y = mouseOffset.y * 14;
  const p2X = mouseOffset.x * -18;
  const p2Y = mouseOffset.y * -18;
  const p3X = mouseOffset.x * 24;
  const p3Y = mouseOffset.y * 24;
  const p4X = mouseOffset.x * -12;
  const p4Y = mouseOffset.y * -12;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* ── Shard 1: Top-Left Isometric Steel Wide-Flange Girder ── */}
      <div
        className={`absolute -top-10 -left-12 sm:top-10 sm:left-6 w-72 sm:w-96 transition-transform duration-700 ease-out ${strokeOpacity}`}
        style={{
          transform: mounted
            ? `translate3d(${p1X}px, ${p1Y}px, 0)`
            : "none",
        }}
      >
        <div className="animate-ambient-float-slow">
          <svg
            viewBox="0 0 320 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Dimension guide lines */}
            <line x1="20" y1="30" x2="280" y2="30" stroke="#0284c7" strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.45" />
            <line x1="20" y1="24" x2="20" y2="36" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.6" />
            <line x1="280" y1="24" x2="280" y2="36" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.6" />
            <text x="130" y="24" fill="#0369a1" fontSize="8" fontFamily="monospace" opacity="0.65" letterSpacing="0.08em">
              W14x90 BEAM · SEC A-A
            </text>

            {/* Isometric I-Beam profile & longitudinal perspective */}
            {/* Top flange */}
            <polygon
              points="40,80 120,40 260,110 180,150"
              stroke="#0f172a"
              strokeWidth="1.2"
              strokeOpacity="0.18"
            />
            <polygon
              points="40,86 120,46 260,116 180,156"
              stroke="#0f172a"
              strokeWidth="0.9"
              strokeOpacity="0.12"
            />
            {/* Connecting top flange thickness */}
            <line x1="40" y1="80" x2="40" y2="86" stroke="#0f172a" strokeWidth="1.2" strokeOpacity="0.2" />
            <line x1="180" y1="150" x2="180" y2="156" stroke="#0f172a" strokeWidth="1.2" strokeOpacity="0.2" />
            <line x1="260" y1="110" x2="260" y2="116" stroke="#0f172a" strokeWidth="1.2" strokeOpacity="0.2" />

            {/* Web plate */}
            <polygon
              points="76,84 116,64 256,134 216,154"
              stroke="#0284c7"
              strokeWidth="0.85"
              strokeDasharray="4 3"
              strokeOpacity="0.28"
            />
            <line x1="110" y1="62" x2="110" y2="120" stroke="#0284c7" strokeWidth="1" strokeOpacity="0.2" />
            <line x1="180" y1="97" x2="180" y2="155" stroke="#0284c7" strokeWidth="1" strokeOpacity="0.2" />

            {/* Bottom flange */}
            <polygon
              points="40,140 120,100 260,170 180,210"
              stroke="#0f172a"
              strokeWidth="1.1"
              strokeOpacity="0.16"
            />
            <line x1="40" y1="140" x2="40" y2="146" stroke="#0f172a" strokeWidth="1" strokeOpacity="0.2" />
            <line x1="180" y1="210" x2="180" y2="216" stroke="#0f172a" strokeWidth="1" strokeOpacity="0.2" />

            {/* Bolt hole circles in isometric projection */}
            <ellipse cx="90" cy="74" rx="3.5" ry="2" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.35" />
            <ellipse cx="140" cy="99" rx="3.5" ry="2" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.35" />
            <ellipse cx="190" cy="124" rx="3.5" ry="2" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.35" />

            {/* Datum elevation crosshair */}
            <circle cx="280" cy="170" r="4.5" stroke="#0284c7" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="280" y1="162" x2="280" y2="178" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.4" />
            <line x1="272" y1="170" x2="288" y2="170" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.4" />
            <text x="240" y="196" fill="#0369a1" fontSize="7" fontFamily="monospace" opacity="0.6">
              BM: +42.50&apos;
            </text>
          </svg>
        </div>
      </div>

      {/* ── Shard 2: Top-Right Structural Lattice Crane Jib & Truss ── */}
      <div
        className={`absolute -top-8 -right-16 sm:top-6 sm:right-4 w-80 sm:w-[420px] transition-transform duration-700 ease-out ${strokeOpacity}`}
        style={{
          transform: mounted
            ? `translate3d(${p2X}px, ${p2Y}px, 0)`
            : "none",
        }}
      >
        <div className="animate-ambient-float-reverse">
          <svg
            viewBox="0 0 360 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Top chord */}
            <line x1="20" y1="70" x2="340" y2="25" stroke="#0f172a" strokeWidth="1.2" strokeOpacity="0.22" />
            <line x1="20" y1="74" x2="340" y2="29" stroke="#0f172a" strokeWidth="0.8" strokeOpacity="0.1" />

            {/* Bottom chord */}
            <line x1="20" y1="140" x2="340" y2="70" stroke="#0f172a" strokeWidth="1.2" strokeOpacity="0.22" />
            <line x1="20" y1="144" x2="340" y2="74" stroke="#0f172a" strokeWidth="0.8" strokeOpacity="0.1" />

            {/* Diagonal lattice lacing (Warren truss configuration) */}
            <line x1="20" y1="70" x2="70" y2="128" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.32" />
            <line x1="70" y1="128" x2="120" y2="56" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.32" />
            <line x1="120" y1="56" x2="170" y2="114" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.32" />
            <line x1="170" y1="114" x2="220" y2="42" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.32" />
            <line x1="220" y1="42" x2="270" y2="98" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.32" />
            <line x1="270" y1="98" x2="320" y2="28" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.32" />

            {/* Vertical king posts */}
            <line x1="70" y1="63" x2="70" y2="128" stroke="#0f172a" strokeWidth="0.8" strokeOpacity="0.15" />
            <line x1="170" y1="49" x2="170" y2="114" stroke="#0f172a" strokeWidth="0.8" strokeOpacity="0.15" />
            <line x1="270" y1="35" x2="270" y2="98" stroke="#0f172a" strokeWidth="0.8" strokeOpacity="0.15" />

            {/* Gusset plate nodes */}
            <circle cx="70" cy="128" r="3" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.45" />
            <circle cx="120" cy="56" r="3" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.45" />
            <circle cx="170" cy="114" r="3" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.45" />
            <circle cx="220" cy="42" r="3" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.45" />

            {/* Hoist cable drop line */}
            <line x1="220" y1="42" x2="220" y2="170" stroke="#0284c7" strokeWidth="0.75" strokeDasharray="2 3" strokeOpacity="0.4" />
            <polygon points="216,170 224,170 220,178" stroke="#0284c7" strokeWidth="0.8" strokeOpacity="0.5" />

            {/* CAD grid notation */}
            <text x="235" y="150" fill="#0369a1" fontSize="7" fontFamily="monospace" opacity="0.6">
              CRANE JIB · RAD: 45M
            </text>
            <text x="235" y="162" fill="#64748b" fontSize="6.5" fontFamily="monospace" opacity="0.6">
              GRID: E-04 / AZIMUTH 210°
            </text>
          </svg>
        </div>
      </div>

      {/* ── Shard 3: Bottom-Left Reinforced Concrete Foundation Cage Prism ── */}
      <div
        className={`hidden sm:block absolute bottom-8 left-6 w-80 sm:w-96 transition-transform duration-700 ease-out ${strokeOpacity}`}
        style={{
          transform: mounted
            ? `translate3d(${p3X}px, ${p3Y}px, 0)`
            : "none",
        }}
      >
        <div className="animate-ambient-float-slow">
          <svg
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Top perimeter rebar tie */}
            <polygon
              points="80,50 190,20 250,70 140,100"
              stroke="#0f172a"
              strokeWidth="1.1"
              strokeOpacity="0.18"
            />
            {/* Intermediate tie ring */}
            <polygon
              points="80,90 190,60 250,110 140,140"
              stroke="#0284c7"
              strokeWidth="0.9"
              strokeDasharray="4 3"
              strokeOpacity="0.25"
            />
            {/* Bottom perimeter rebar tie */}
            <polygon
              points="80,130 190,100 250,150 140,180"
              stroke="#0f172a"
              strokeWidth="1.1"
              strokeOpacity="0.18"
            />

            {/* Vertical reinforcing rebar legs (#8 Bars) */}
            <line x1="80" y1="35" x2="80" y2="165" stroke="#0f172a" strokeWidth="1.2" strokeOpacity="0.24" />
            <line x1="190" y1="5" x2="190" y2="135" stroke="#0f172a" strokeWidth="1.2" strokeOpacity="0.24" />
            <line x1="250" y1="55" x2="250" y2="185" stroke="#0f172a" strokeWidth="1.2" strokeOpacity="0.24" />
            <line x1="140" y1="85" x2="140" y2="195" stroke="#0f172a" strokeWidth="1.2" strokeOpacity="0.24" />

            {/* Internal helical stirrups tie hooks */}
            <path
              d="M 80 50 Q 135 60 190 20"
              stroke="#0284c7"
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />
            <path
              d="M 140 100 Q 195 110 250 70"
              stroke="#0284c7"
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />

            {/* Spec callout */}
            <line x1="140" y1="180" x2="90" y2="190" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.4" />
            <circle cx="90" cy="190" r="2" fill="#0284c7" fillOpacity="0.5" />
            <text x="10" y="193" fill="#0369a1" fontSize="7" fontFamily="monospace" opacity="0.65">
              PIER COL #8 REBAR
            </text>
          </svg>
        </div>
      </div>

      {/* ── Shard 4: Bottom-Right Isometric Truss Node & Benchmark Ring ── */}
      <div
        className={`hidden md:block absolute bottom-12 -right-8 w-80 sm:w-96 transition-transform duration-700 ease-out ${strokeOpacity}`}
        style={{
          transform: mounted
            ? `translate3d(${p4X}px, ${p4Y}px, 0)`
            : "none",
        }}
      >
        <div className="animate-ambient-float-reverse">
          <svg
            viewBox="0 0 320 210"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Concentric coordinate compass rings */}
            <circle cx="180" cy="110" r="60" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="3 4" strokeOpacity="0.2" />
            <circle cx="180" cy="110" r="42" stroke="#0f172a" strokeWidth="0.7" strokeOpacity="0.12" />
            <circle cx="180" cy="110" r="22" stroke="#0284c7" strokeWidth="0.9" strokeOpacity="0.3" />
            <circle cx="180" cy="110" r="3.5" fill="#0284c7" fillOpacity="0.4" />

            {/* 30° / 60° Isometric axis rays */}
            <line x1="180" y1="20" x2="180" y2="200" stroke="#0284c7" strokeWidth="0.75" strokeDasharray="2 4" strokeOpacity="0.3" />
            <line x1="90" y1="60" x2="270" y2="160" stroke="#0284c7" strokeWidth="0.75" strokeDasharray="2 4" strokeOpacity="0.3" />
            <line x1="90" y1="160" x2="270" y2="60" stroke="#0284c7" strokeWidth="0.75" strokeDasharray="2 4" strokeOpacity="0.3" />

            {/* Corner alignment bracket marks */}
            <path d="M 60 70 L 40 70 L 40 90" stroke="#0f172a" strokeWidth="1" strokeOpacity="0.25" />
            <path d="M 280 70 L 300 70 L 300 90" stroke="#0f172a" strokeWidth="1" strokeOpacity="0.25" />
            <path d="M 60 170 L 40 170 L 40 150" stroke="#0f172a" strokeWidth="1" strokeOpacity="0.25" />
            <path d="M 280 170 L 300 170 L 300 150" stroke="#0f172a" strokeWidth="1" strokeOpacity="0.25" />

            {/* Technical coordinate labels */}
            <text x="195" y="65" fill="#0369a1" fontSize="7.5" fontFamily="monospace" opacity="0.6">
              SURVEY BENCHMARK · PT-09
            </text>
            <text x="195" y="78" fill="#64748b" fontSize="6.5" fontFamily="monospace" opacity="0.55">
              LAT 40.7128° N · LON 74.0060° W
            </text>
            <text x="195" y="90" fill="#0369a1" fontSize="7" fontFamily="monospace" opacity="0.5">
              TOLERANCE ±0.005&apos;
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
