export type Band = "Green" | "Yellow" | "Orange" | "Red" | "Blue" | "Grey";

export interface MarketData {
  marketName: string;
  state: string;
  jadugar: number;
  jadugarPercent: number;
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

// Town coordinates lookup for geocoding
export const TOWN_COORDINATES: Record<string, [number, number]> = {
  "ichalkaranji": [74.4605, 16.6912],
  "jaysingpur": [74.5664, 16.7835],
  "kagal": [74.3154, 16.577],
  "gadhinglaj": [74.3501, 16.2229],
  "panhala": [74.1101, 16.8121],
  "kolhapur": [74.2433, 16.7050],
  "sangli": [74.5815, 16.8524],
  "satara": [74.0183, 17.6805],
  "pune": [73.8567, 18.5204],
  "mumbai": [72.8777, 19.0760],
  "nashik": [73.7898, 20.0063],
  "nagpur": [79.0882, 21.1458],
  "aurangabad": [75.3433, 19.8762],
  "solapur": [75.9064, 17.6599],
  "ahmednagar": [74.7496, 19.0948],
  "latur": [76.5604, 18.4088],
  "jalgaon": [75.5626, 21.0077],
  "akola": [77.0082, 20.7002],
  "amravati": [77.7523, 20.9320],
  "nanded": [77.3210, 19.1383],
  "ratnagiri": [73.3120, 16.9902],
  "sindhudurg": [73.6354, 16.3489],
  "miraj": [74.6467, 16.8260],
  "shiroli": [74.3783, 16.7265],
  "hatkanangle": [74.4280, 16.7520],
  "indore": [75.8577, 22.7196],
  "bhopal": [77.4126, 23.2599],
  "jaipur": [75.7873, 26.9124],
  "delhi": [77.2090, 28.6139],
  "chennai": [80.2707, 13.0827],
  "bengaluru": [77.5946, 12.9716],
  "hyderabad": [78.4867, 17.3850],
  "ahmedabad": [72.5714, 23.0225],
  "surat": [72.8311, 21.1702],
  "vadodara": [73.1812, 22.3072],
  "rajkot": [70.8022, 22.3039],
  "lucknow": [80.9462, 26.8467],
  "kanpur": [80.3319, 26.4499],
  "patna": [85.1376, 25.6093],
  "ranchi": [85.3096, 23.3441],
  "bhubaneswar": [85.8245, 20.2961],
  "kochi": [76.2673, 9.9312],
  "coimbatore": [76.9558, 11.0168],
  "visakhapatnam": [83.2185, 17.6868],
  "vijayawada": [80.6480, 16.5062],
  "thiruvananthapuram": [76.9366, 8.5241],
  "mangalore": [74.8560, 12.9141],
  "hubli": [75.1240, 15.3647],
  "belgaum": [74.4977, 15.8497],
  "gulbarga": [76.8343, 17.3297],
  "dharwad": [75.0078, 15.4589],
  "goa": [73.8278, 15.4909],
};

export const sampleMarketData: MarketData[] = [
  { marketName: "Ichalkaranji", state: "Maharashtra", jadugar: 4520, jadugarPercent: 66.5, band: "Green", coordinates: [74.4605, 16.6912] },
  { marketName: "Jaysingpur", state: "Maharashtra", jadugar: 2100, jadugarPercent: 48.8, band: "Yellow", coordinates: [74.5664, 16.7835] },
  { marketName: "Kagal", state: "Maharashtra", jadugar: 1500, jadugarPercent: 38.5, band: "Orange", coordinates: [74.3154, 16.577] },
  { marketName: "Gadhinglaj", state: "Maharashtra", jadugar: 980, jadugarPercent: 30.6, band: "Red", coordinates: [74.3501, 16.2229] },
  { marketName: "Panhala", state: "Maharashtra", jadugar: 1800, jadugarPercent: 75.0, band: "Green", coordinates: [74.1101, 16.8121] },
];
