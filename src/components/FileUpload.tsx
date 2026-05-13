import { useCallback, useState, useRef } from "react";
import { Trash2, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { MarketData, Band, TOWN_COORDINATES } from "@/data/marketData";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onDataLoaded: (data: MarketData[]) => void;
}

const VALID_BANDS: Band[] = ["Green", "Yellow", "Orange", "Red", "Blue", "Grey"];

const normalizeBand = (val: string): Band | null => {
  const found = VALID_BANDS.find((b) => b.toLowerCase() === val.trim().toLowerCase());
  return found ?? null;
};

const GEOCODE_CACHE_KEY = "marketMapper.geocodeCache";

const loadCacheFromStorage = (): Record<string, [number, number]> => {
  try {
    const raw = localStorage.getItem(GEOCODE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    // corrupted cache – ignore
  }
  return {};
};

const saveCacheToStorage = (cache: Record<string, [number, number]>) => {
  try {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full or unavailable – ignore
  }
};

// Persistent cache (coordinates only – no nulls)
const persistentCache: Record<string, [number, number]> = loadCacheFromStorage();
// Session-only cache for null results (failed geocodes)
const sessionNullCache: Set<string> = new Set();

// Unified lookup
const geocodeCache: Record<string, [number, number] | null> = new Proxy(
  {} as Record<string, [number, number] | null>,
  {
    get(_, key: string) {
      if (key in persistentCache) return persistentCache[key];
      if (sessionNullCache.has(key)) return null;
      return undefined;
    },
    has(_, key: string) {
      return key in persistentCache || sessionNullCache.has(key);
    },
    set(_, key: string, value: [number, number] | null) {
      if (value) {
        persistentCache[key] = value;
        saveCacheToStorage(persistentCache);
      } else {
        sessionNullCache.add(key);
      }
      return true;
    },
  }
);

const geocodeTown = async (town: string, retries = 2): Promise<[number, number] | null> => {
  const key = town.trim().toLowerCase();
  if (TOWN_COORDINATES[key]) return TOWN_COORDINATES[key];
  if (key in geocodeCache) return geocodeCache[key];

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(town + ", India")}&format=json&limit=1`,
        { headers: { "User-Agent": "MarketMapTool/1.0" } }
      );
      if (res.status === 429) {
        // Rate limited – wait and retry
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      const data = await res.json();
      if (data && data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        geocodeCache[key] = coords;
        return coords;
      }
      break; // Got response but no results
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
    }
  }
  geocodeCache[key] = null;
  return null;
};

const batchGeocode = async (
  towns: string[],
  onProgress: (done: number, total: number) => void
): Promise<Record<string, [number, number] | null>> => {
  const results: Record<string, [number, number] | null> = {};
  const needsGeocode: string[] = [];

  for (const town of towns) {
    const key = town.trim().toLowerCase();
    if (TOWN_COORDINATES[key]) {
      results[town] = TOWN_COORDINATES[key];
    } else if (key in geocodeCache) {
      results[town] = geocodeCache[key];
    } else {
      needsGeocode.push(town);
    }
  }

  onProgress(towns.length - needsGeocode.length, towns.length);

  for (let i = 0; i < needsGeocode.length; i++) {
    results[needsGeocode[i]] = await geocodeTown(needsGeocode[i]);
    onProgress(towns.length - needsGeocode.length + i + 1, towns.length);
    if (i < needsGeocode.length - 1) {
      await new Promise((r) => setTimeout(r, 1100));
    }
  }

  return results;
};

// Clean town name: remove suffixes like (M), (M CORP.), etc.
const cleanTownName = (raw: string): string =>
  raw.replace(/\s*\(.*?\)\s*/g, "").replace(/\u00a0/g, " ").trim();

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const { toast } = useToast();
  const abortRef = useRef(false);

  const processFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setProgress("Reading file...");
      abortRef.current = false;

      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          toast({ title: "Empty file", description: "The uploaded file has no data rows.", variant: "destructive" });
          setLoading(false);
          return;
        }

        const keys = Object.keys(rows[0]);
        const findCol = (search: string) =>
          keys.find((k) => k.trim().toLowerCase() === search.toLowerCase()) ||
          keys.find((k) => k.trim().toLowerCase().includes(search.toLowerCase()));

        const townCol = findCol("town") || findCol("market") || keys[0];
        const stateCol = findCol("state");
        const bandCol = findCol("band");
        const branchCol = findCol("branch");
        const regionCol = findCol("region");
        const clusterCol = findCol("cluster");
        const popGroupCol = findCol("pop group") || findCol("popgroup") || findCol("pop_group");
        const goiDistCol = findCol("goi district") || findCol("goi_district") || findCol("district");
        const brandCol = findCol("brand");
        const segmentCol = findCol("segment");
        // Vol columns: find "%" first, then "vol" excluding %
        const volPctCol = keys.find((k) => k.trim() === "%") || findCol("vol %") || findCol("vol%");
        const volCol = keys.find(
          (k) => k.trim().toLowerCase().includes("vol") && k !== volPctCol
        ) || keys.find((k) => k.trim().toLowerCase() === "vol");
        const trendBeltCol = findCol("trend belt") || findCol("trendbelt");

        if (!townCol || !bandCol) {
          toast({ title: "Invalid format", description: "File must have Town and Band columns.", variant: "destructive" });
          setLoading(false);
          return;
        }

        setProgress(`Parsed ${rows.length} rows. Geocoding towns...`);

        const townStateKeys = rows.map((r) => {
          const town = cleanTownName(String(r[townCol] || ""));
          const state = stateCol ? String(r[stateCol] || "").trim() : "";
          return state ? `${town}, ${state}` : town;
        }).filter(Boolean);
        const allTownKeys = [...new Set(townStateKeys)];

        const coordsMap = await batchGeocode(allTownKeys, (done, total) => {
          setProgress(`Geocoding: ${done}/${total} towns...`);
        });

        const parsed: MarketData[] = [];
        const skipped: string[] = [];

        for (const row of rows) {
          const rawTown = String(row[townCol] || "").trim();
          const town = cleanTownName(rawTown);
          if (!town) continue;

          const state = stateCol ? String(row[stateCol] || "").trim() : "";
          const geoKey = state ? `${town}, ${state}` : town;

          const band = normalizeBand(String(row[bandCol!] || ""));
          if (!band) { skipped.push(town + " (invalid band)"); continue; }

          const coords = coordsMap[geoKey];
          if (!coords) { skipped.push(town + " (unknown location)"); continue; }

          const vol = volCol ? Number(row[volCol]) || 0 : 0;
          const volPercent = volPctCol ? Number(row[volPctCol]) || 0 : 0;

          parsed.push({
            marketName: town,
            state: state || "—",
            branch: branchCol ? String(row[branchCol] || "").trim() : "—",
            circle: circleCol ? String(row[circleCol] || "").trim() : "—",
            section: sectionCol ? String(row[sectionCol] || "").trim() : "—",
            goiDistrict: goiDistCol ? String(row[goiDistCol] || "").trim() : "—",
            brand: brandCol ? String(row[brandCol] || "").trim() : "—",
            segment: segmentCol ? String(row[segmentCol] || "").trim() : "—",
            trendBelt: trendBeltCol ? String(row[trendBeltCol] || "").trim() : "—",
            vol,
            volPercent,
            band,
            coordinates: coords,
          });
        }

        if (parsed.length === 0) {
          toast({ title: "No valid data", description: "Could not match any towns.", variant: "destructive" });
          setLoading(false);
          return;
        }

        if (skipped.length > 0) {
          console.warn("Skipped markets:", skipped);
          toast({
            title: `⚠️ ${skipped.length} rows skipped`,
            description: skipped.slice(0, 5).join(", ") + (skipped.length > 5 ? ` and ${skipped.length - 5} more...` : ""),
            variant: "destructive",
          });
        }

        toast({ title: "Data loaded", description: `${parsed.length} markets plotted on map.` });
        onDataLoaded(parsed);
      } catch {
        toast({ title: "Error reading file", description: "Please upload a valid .xlsx or .xls file.", variant: "destructive" });
      } finally {
        setLoading(false);
        setProgress("");
      }
    },
    [onDataLoaded, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-7 h-7 text-muted-foreground animate-spin" />
            ) : (
              <FileSpreadsheet className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          {loading ? (
            <div>
              <p className="text-sm font-medium text-foreground">Processing your file...</p>
              <p className="text-xs text-muted-foreground mt-1">{progress}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">Drag & drop your Excel file here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Format: <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Branch | Circle | Section | GOI District | Brand | Segment | Town | Vol | % | Band | State</span>
              </p>
            </div>
          )}
          {!loading && (
            <label>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileInput} />
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-1" />
                  Browse files
                </span>
              </Button>
            </label>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  let cached: Record<string, [number, number]>;
                  try {
                    cached = loadCacheFromStorage();
                  } catch {
                    toast({ title: "Error", description: "Failed to read geocoding cache.", variant: "destructive" });
                    return;
                  }
                  const cacheEntries = Object.entries(cached).filter(
                    ([, v]) => v != null && Array.isArray(v) && v.length === 2
                  );
                  if (cacheEntries.length === 0) {
                    toast({ title: "Nothing to export", description: "No cached coordinates to export — upload data first." });
                    return;
                  }

                  const existing = { ...TOWN_COORDINATES };
                  let newCount = 0;
                  for (const [key, coords] of cacheEntries) {
                    if (!(key in existing)) newCount++;
                    existing[key] = [
                      parseFloat(coords[0].toFixed(4)),
                      parseFloat(coords[1].toFixed(4)),
                    ];
                  }
                  const total = Object.keys(existing).length;
                  const sorted = Object.keys(existing).sort();

                  const lines = sorted.map(
                    (k) => `  "${k}": [${existing[k][0]}, ${existing[k][1]}],`
                  );
                  const output = `export const TOWN_COORDINATES: Record<string, [number, number]> = {\n${lines.join("\n")}\n};\n`;

                  const now = new Date();
                  const pad = (n: number) => String(n).padStart(2, "0");
                  const filename = `town-coordinates-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.ts`;

                  const blob = new Blob([output], { type: "text/plain" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = filename;
                  link.click();
                  URL.revokeObjectURL(link.href);

                  let clipboardOk = false;
                  try {
                    await navigator.clipboard.writeText(output);
                    clipboardOk = true;
                  } catch {}

                  const dupCount = cacheEntries.length - newCount;
                  toast({
                    title: `Exported ${total} coordinates (${newCount} new${dupCount > 0 ? `, ${dupCount} updated` : ""})`,
                    description: clipboardOk
                      ? `Copied to clipboard and downloaded as ${filename}. Paste into src/data/marketData.ts to make permanent.`
                      : `Downloaded as ${filename}. Paste into src/data/marketData.ts to make permanent. (Clipboard unavailable)`,
                  });
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export cache
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px] text-xs">
              Export your geocoded cache as TypeScript code to permanently add these towns to the hardcoded lookup, eliminating future geocoding for these towns.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            localStorage.removeItem(GEOCODE_CACHE_KEY);
            Object.keys(persistentCache).forEach((k) => delete persistentCache[k]);
            sessionNullCache.clear();
            toast({ title: "Cache cleared", description: "Geocoding cache has been reset." });
          }}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Clear geocoding cache
        </Button>
      </div>
    </>
  );
};
