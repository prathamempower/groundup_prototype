// GroundUp AI — Realistic Network Latency Simulation Utility
// Simulates real-world network delays (300ms - 600ms) to ensure loading indicators, skeletons, and spinners function seamlessly

export function delay(minMs: number = 250, maxMs: number = 450): Promise<void> {
  const duration = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, duration));
}
