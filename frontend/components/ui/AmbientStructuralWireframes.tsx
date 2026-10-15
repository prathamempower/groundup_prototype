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
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const strokeOpacity = intensity === "prominent" ? "opacity-80" : "opacity-50";

  // Gentle parallax offsets
  const p1X = mouseOffset.x * 12;
  const p1Y = mouseOffset.y * 12;
  const p2X = mouseOffset.x * -14;
  const p2Y = mouseOffset.y * -14;
  const p3X = mouseOffset.x * 16;
  const p3Y = mouseOffset.y * 16;
  const p4X = mouseOffset.x * -10;
  const p4Y = mouseOffset.y * -10;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Soft Peaceful Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/10 to-transparent blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-sky-300/10 to-transparent blur-3xl" />

      {/* ── Shard 1: Top-Left Peaceful Isometric Steel Beam ── */}
      <div
        className={`absolute -top-6 -left-10 sm:top-10 sm:left-8 w-64 sm:w-80 transition-transform duration-700 ease-out ${strokeOpacity}`}
        style={{
          transform: mounted
            ? `translate3d(${p1X}px, ${p1Y}px, 0)`
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
            {/* Top flange */}
            <polygon
              points="40,70 120,30 250,95 170,135"
              stroke="#0f172a"
              strokeWidth="0.9"
              strokeOpacity="0.14"
            />
            <polygon
              points="40,75 120,35 250,100 170,140"
              stroke="#0f172a"
              strokeWidth="0.75"
              strokeOpacity="0.10"
            />
            <line x1="40" y1="70" x2="40" y2="75" stroke="#0f172a" strokeWidth="0.9" strokeOpacity="0.14" />
            <line x1="170" y1="135" x2="170" y2="140" stroke="#0f172a" strokeWidth="0.9" strokeOpacity="0.14" />
            <line x1="250" y1="95" x2="250" y2="100" stroke="#0f172a" strokeWidth="0.9" strokeOpacity="0.14" />

            {/* Subtle Web plate */}
            <line x1="105" y1="52" x2="105" y2="105" stroke="#0284c7" strokeWidth="0.7" strokeOpacity="0.18" />
            <line x1="170" y1="88" x2="170" y2="140" stroke="#0284c7" strokeWidth="0.7" strokeOpacity="0.18" />

            {/* Bottom flange */}
            <polygon
              points="40,125 120,85 250,150 170,190"
              stroke="#0f172a"
              strokeWidth="0.85"
              strokeOpacity="0.12"
            />

            {/* Blueprint guidelines */}
            <line x1="20" y1="20" x2="260" y2="20" stroke="#0284c7" strokeWidth="0.6" strokeDasharray="3 4" strokeOpacity="0.25" />
            <circle cx="260" cy="150" r="3.5" stroke="#0284c7" strokeWidth="0.7" strokeOpacity="0.3" />
          </svg>
        </div>
      </div>

      {/* ── Shard 2: Top-Right Peaceful Structural Truss ── */}
      <div
        className={`absolute -top-6 -right-12 sm:top-8 sm:right-6 w-72 sm:w-[360px] transition-transform duration-700 ease-out ${strokeOpacity}`}
        style={{
          transform: mounted
            ? `translate3d(${p2X}px, ${p2Y}px, 0)`
            : "none",
        }}
      >
        <div className="animate-ambient-float-reverse">
          <svg
            viewBox="0 0 340 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            {/* Top and bottom chords */}
            <line x1="20" y1="65" x2="320" y2="25" stroke="#0f172a" strokeWidth="0.9" strokeOpacity="0.15" />
            <line x1="20" y1="130" x2="320" y2="65" stroke="#0f172a" strokeWidth="0.9" strokeOpacity="0.15" />

            {/* Diagonal lattice */}
            <line x1="20" y1="65" x2="70" y2="120" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.22" />
            <line x1="70" y1="120" x2="120" y2="52" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.22" />
            <line x1="120" y1="52" x2="170" y2="105" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.22" />
            <line x1="170" y1="105" x2="220" y2="38" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.22" />
            <line x1="220" y1="38" x2="270" y2="90" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.22" />

            {/* Minimalist connection nodes */}
            <circle cx="70" cy="120" r="2.5" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.3" />
            <circle cx="120" cy="52" r="2.5" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.3" />
            <circle cx="170" cy="105" r="2.5" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.3" />
            <circle cx="220" cy="38" r="2.5" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.3" />
          </svg>
        </div>
      </div>

      {/* ── Shard 3: Bottom-Left Peaceful Isometric Frame ── */}
      <div
        className={`hidden sm:block absolute bottom-8 left-6 w-64 sm:w-80 transition-transform duration-700 ease-out ${strokeOpacity}`}
        style={{
          transform: mounted
            ? `translate3d(${p3X}px, ${p3Y}px, 0)`
            : "none",
        }}
      >
        <div className="animate-ambient-float-slow">
          <svg
            viewBox="0 0 260 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <polygon
              points="70,45 170,18 220,60 120,88"
              stroke="#0f172a"
              strokeWidth="0.9"
              strokeOpacity="0.14"
            />
            <polygon
              points="70,115 170,88 220,130 120,158"
              stroke="#0f172a"
              strokeWidth="0.9"
              strokeOpacity="0.14"
            />
            <line x1="70" y1="45" x2="70" y2="115" stroke="#0f172a" strokeWidth="0.9" strokeOpacity="0.16" />
            <line x1="170" y1="18" x2="170" y2="88" stroke="#0f172a" strokeWidth="0.9" strokeOpacity="0.16" />
            <line x1="220" y1="60" x2="220" y2="130" stroke="#0f172a" strokeWidth="0.9" strokeOpacity="0.16" />
            <line x1="120" y1="88" x2="120" y2="158" stroke="#0f172a" strokeWidth="0.9" strokeOpacity="0.16" />
          </svg>
        </div>
      </div>

      {/* ── Shard 4: Bottom-Right Peaceful Axis Rings ── */}
      <div
        className={`hidden md:block absolute bottom-8 right-6 w-64 sm:w-80 transition-transform duration-700 ease-out ${strokeOpacity}`}
        style={{
          transform: mounted
            ? `translate3d(${p4X}px, ${p4Y}px, 0)`
            : "none",
        }}
      >
        <div className="animate-ambient-float-reverse">
          <svg
            viewBox="0 0 260 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <circle cx="140" cy="90" r="48" stroke="#0284c7" strokeWidth="0.6" strokeDasharray="3 4" strokeOpacity="0.18" />
            <circle cx="140" cy="90" r="28" stroke="#0f172a" strokeWidth="0.6" strokeOpacity="0.1" />
            <circle cx="140" cy="90" r="2.5" fill="#0284c7" fillOpacity="0.25" />
            <line x1="140" y1="20" x2="140" y2="160" stroke="#0284c7" strokeWidth="0.5" strokeDasharray="2 4" strokeOpacity="0.2" />
            <line x1="70" y1="90" x2="210" y2="90" stroke="#0284c7" strokeWidth="0.5" strokeDasharray="2 4" strokeOpacity="0.2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
