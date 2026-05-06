export type Band = "Green" | "Yellow" | "Orange" | "Red" | "Blue" | "Grey";

export interface MarketData {
  marketName: string;
  balanced: number;
  volume: number;
  percentage: number;
  band: Band;
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
  { marketName: "Maharashtra", balanced: 8520, volume: 12400, percentage: 68.7, band: "Green" },
  { marketName: "Gujarat", balanced: 6230, volume: 9100, percentage: 68.5, band: "Green" },
  { marketName: "Tamil Nadu", balanced: 5410, volume: 8900, percentage: 60.8, band: "Yellow" },
  { marketName: "Karnataka", balanced: 7120, volume: 10200, percentage: 69.8, band: "Green" },
  { marketName: "Rajasthan", balanced: 3200, volume: 7500, percentage: 42.7, band: "Orange" },
  { marketName: "Uttar Pradesh", balanced: 4100, volume: 14200, percentage: 28.9, band: "Red" },
  { marketName: "Madhya Pradesh", balanced: 2800, volume: 6300, percentage: 44.4, band: "Orange" },
  { marketName: "West Bengal", balanced: 3900, volume: 7800, percentage: 50.0, band: "Yellow" },
  { marketName: "Kerala", balanced: 4800, volume: 6100, percentage: 78.7, band: "Green" },
  { marketName: "Punjab", balanced: 3600, volume: 5200, percentage: 69.2, band: "Green" },
  { marketName: "Haryana", balanced: 2900, volume: 4800, percentage: 60.4, band: "Yellow" },
  { marketName: "Bihar", balanced: 1800, volume: 8900, percentage: 20.2, band: "Red" },
  { marketName: "Odisha", balanced: 2100, volume: 4500, percentage: 46.7, band: "Orange" },
  { marketName: "Telangana", balanced: 5600, volume: 7200, percentage: 77.8, band: "Green" },
  { marketName: "Andhra Pradesh", balanced: 4200, volume: 6800, percentage: 61.8, band: "Yellow" },
  { marketName: "Jharkhand", balanced: 1500, volume: 3900, percentage: 38.5, band: "Orange" },
  { marketName: "Assam", balanced: 1200, volume: 3200, percentage: 37.5, band: "Orange" },
  { marketName: "Chhattisgarh", balanced: 1900, volume: 4100, percentage: 46.3, band: "Yellow" },
  { marketName: "Uttarakhand", balanced: 2200, volume: 3100, percentage: 71.0, band: "Green" },
  { marketName: "Himachal Pradesh", balanced: 1800, volume: 2400, percentage: 75.0, band: "Green" },
  { marketName: "Goa", balanced: 950, volume: 1200, percentage: 79.2, band: "Green" },
  { marketName: "Jammu and Kashmir", balanced: 1100, volume: 2800, percentage: 39.3, band: "Orange" },
  { marketName: "Delhi", balanced: 5200, volume: 6900, percentage: 75.4, band: "Green" },
  { marketName: "Sikkim", balanced: 400, volume: 600, percentage: 66.7, band: "Yellow" },
  { marketName: "Meghalaya", balanced: 500, volume: 1100, percentage: 45.5, band: "Orange" },
  { marketName: "Tripura", balanced: 600, volume: 1300, percentage: 46.2, band: "Orange" },
  { marketName: "Mizoram", balanced: 350, volume: 700, percentage: 50.0, band: "Yellow" },
  { marketName: "Nagaland", balanced: 300, volume: 800, percentage: 37.5, band: "Orange" },
  { marketName: "Manipur", balanced: 400, volume: 900, percentage: 44.4, band: "Orange" },
  { marketName: "Arunachal Pradesh", balanced: 280, volume: 650, percentage: 43.1, band: "Orange" },
];
