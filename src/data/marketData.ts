export type Band = "Green" | "Yellow" | "Orange" | "Red" | "Blue" | "Grey";

export interface MarketData {
  marketName: string;
  balanced: number;
  volume: number;
  percentage: number;
  band: Band;
  coordinates: [number, number]; // [longitude, latitude]
}

export const BAND_COLORS: Record<Band, string> = {
  Green: "hsl(145, 60%, 45%)",
  Yellow: "hsl(45, 95%, 55%)",
  Orange: "hsl(25, 95%, 55%)",
  Red: "hsl(0, 75%, 55%)",
  Blue: "hsl(210, 70%, 55%)",
  Grey: "hsl(220, 10%, 70%)",
};

export const sampleMarketData: MarketData[] = [
  { marketName: "Mumbai", balanced: 8520, volume: 12400, percentage: 68.7, band: "Green", coordinates: [72.8777, 19.076] },
  { marketName: "Ahmedabad", balanced: 6230, volume: 9100, percentage: 68.5, band: "Green", coordinates: [72.5714, 23.0225] },
  { marketName: "Chennai", balanced: 5410, volume: 8900, percentage: 60.8, band: "Yellow", coordinates: [80.2707, 13.0827] },
  { marketName: "Bengaluru", balanced: 7120, volume: 10200, percentage: 69.8, band: "Green", coordinates: [77.5946, 12.9716] },
  { marketName: "Jaipur", balanced: 3200, volume: 7500, percentage: 42.7, band: "Orange", coordinates: [75.7873, 26.9124] },
  { marketName: "Lucknow", balanced: 4100, volume: 14200, percentage: 28.9, band: "Red", coordinates: [80.9462, 26.8467] },
  { marketName: "Indore", balanced: 2800, volume: 6300, percentage: 44.4, band: "Orange", coordinates: [75.8577, 22.7196] },
  { marketName: "Kolkata", balanced: 3900, volume: 7800, percentage: 50.0, band: "Yellow", coordinates: [88.3639, 22.5726] },
  { marketName: "Kochi", balanced: 4800, volume: 6100, percentage: 78.7, band: "Green", coordinates: [76.2673, 9.9312] },
  { marketName: "Ludhiana", balanced: 3600, volume: 5200, percentage: 69.2, band: "Green", coordinates: [75.8573, 30.901] },
  { marketName: "Patna", balanced: 1800, volume: 8900, percentage: 20.2, band: "Red", coordinates: [85.1376, 25.6093] },
  { marketName: "Bhubaneswar", balanced: 2100, volume: 4500, percentage: 46.7, band: "Orange", coordinates: [85.8245, 20.2961] },
  { marketName: "Hyderabad", balanced: 5600, volume: 7200, percentage: 77.8, band: "Green", coordinates: [78.4867, 17.385] },
  { marketName: "Pune", balanced: 4200, volume: 6800, percentage: 61.8, band: "Yellow", coordinates: [73.8567, 18.5204] },
  { marketName: "Guwahati", balanced: 1200, volume: 3200, percentage: 37.5, band: "Orange", coordinates: [91.7362, 26.1445] },
];
