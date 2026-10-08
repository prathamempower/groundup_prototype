export interface CompItem {
  address: string;
  price: number;
  sqFt: number;
  daysAgo: number;
  match: 'Strong' | 'Moderate' | 'Weak';
}

export interface DealData {
  address: string;
  propertyType: string;
  units: number;
  sqFt: number;
  acquisitionCost: number;
  hardCosts: number;
  softCosts: number;
  arv: number;
}
