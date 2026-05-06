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
  { marketName: "Ichalkaranji", balanced: 4520, volume: 6800, percentage: 66.5, band: "Green", coordinates: [74.4605, 16.6912] },
  { marketName: "Jaysingpur", balanced: 2100, volume: 4300, percentage: 48.8, band: "Yellow", coordinates: [74.5664, 16.7835] },
  { marketName: "Kagal", balanced: 1500, volume: 3900, percentage: 38.5, band: "Orange", coordinates: [74.3154, 16.577] },
  { marketName: "Gadhinglaj", balanced: 980, volume: 3200, percentage: 30.6, band: "Red", coordinates: [74.3501, 16.2229] },
  { marketName: "Panhala", balanced: 1800, volume: 2400, percentage: 75.0, band: "Green", coordinates: [74.1101, 16.8121] },
];
