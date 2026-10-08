export interface MapLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  address: string;
  x: number;
  y: number;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  units: number;
  budget: string;
  nextDraw: string;
  progressPct: number;
  trade: string;
  risk?: string;
}
