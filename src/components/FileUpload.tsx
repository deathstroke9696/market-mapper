import { useCallback, useState, useRef } from "react";
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

// In-memory geocode cache to avoid repeat API calls
const geocodeCache: Record<string, [number, number] | null> = {};

const geocodeTown = async (town: string): Promise<[number, number] | null> => {
  const key = town.trim().toLowerCase();

  // Check hardcoded first
  if (TOWN_COORDINATES[key]) return TOWN_COORDINATES[key];

  // Check cache
  if (key in geocodeCache) return geocodeCache[key];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(town + ", India")}&format=json&limit=1`,
      { headers: { "User-Agent": "MarketMapTool/1.0" } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const coords: [number, number] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      geocodeCache[key] = coords;
      return coords;
    }
  } catch {
    // ignore geocode errors
  }
  geocodeCache[key] = null;
  return null;
};

// Rate-limited batch geocoding
const batchGeocode = async (
  towns: string[],
  onProgress: (done: number, total: number) => void
): Promise<Record<string, [number, number] | null>> => {
  const results: Record<string, [number, number] | null> = {};
  const needsGeocode: string[] = [];

  // First pass: resolve from hardcoded + cache
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

  // Batch geocode with rate limiting (2 per second to be respectful)
  for (let i = 0; i < needsGeocode.length; i++) {
    results[needsGeocode[i]] = await geocodeTown(needsGeocode[i]);
    onProgress(towns.length - needsGeocode.length + i + 1, towns.length);
    if (i < needsGeocode.length - 1) {
      await new Promise((r) => setTimeout(r, 500)); // 2 req/sec
    }
  }

  return results;
};

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
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          toast({ title: "Empty file", description: "The uploaded file has no data rows.", variant: "destructive" });
          setLoading(false);
          return;
        }

        // Find columns (case-insensitive, exact match priority)
        const firstRow = rows[0];
        const keys = Object.keys(firstRow);
        const findCol = (search: string) =>
          keys.find((k) => k.trim().toLowerCase() === search.toLowerCase()) ||
          keys.find((k) => k.trim().toLowerCase().includes(search.toLowerCase()));

        const townCol = findCol("town") || findCol("market") || keys[0];
        const stateCol = findCol("state");
        // Important: find "Jadugar %" first, then find "Jadugar" excluding the % column
        const jadugarPctCol = findCol("jadugar %") || findCol("jadugar%");
        const jadugarCol = keys.find(
          (k) => k.trim().toLowerCase().includes("jadugar") && k !== jadugarPctCol
        );
        const bandCol = findCol("band");

        if (!townCol || !bandCol) {
          toast({ title: "Invalid format", description: "File must have Town and Band columns.", variant: "destructive" });
          setLoading(false);
          return;
        }

        setProgress(`Parsed ${rows.length} rows. Geocoding towns...`);

        // Build unique geocode keys as "town, state" to disambiguate duplicates
        const townStateKeys = rows.map((r) => {
          const town = String(r[townCol] || "").trim();
          const state = stateCol ? String(r[stateCol] || "").trim() : "";
          return state ? `${town}, ${state}` : town;
        }).filter(Boolean);
        const allTownKeys = [...new Set(townStateKeys)];

        // Batch geocode all towns (with state for disambiguation)
        const coordsMap = await batchGeocode(allTownKeys, (done, total) => {
          setProgress(`Geocoding: ${done}/${total} towns...`);
        });

        const parsed: MarketData[] = [];
        const skipped: string[] = [];

        for (const row of rows) {
          const town = String(row[townCol] || "").trim();
          if (!town) continue;

          const state = stateCol ? String(row[stateCol] || "").trim() : "";
          const geoKey = state ? `${town}, ${state}` : town;

          const band = normalizeBand(String(row[bandCol!] || ""));
          if (!band) { skipped.push(town + " (invalid band)"); continue; }

          const coords = coordsMap[geoKey];
          if (!coords) { skipped.push(town + " (unknown location)"); continue; }

          const jadugar = jadugarCol ? Number(row[jadugarCol]) || 0 : 0;
          const jadugarPercent = jadugarPctCol ? Number(row[jadugarPctCol]) || 0 : 0;

          parsed.push({ marketName: town, state: state || "—", jadugar, jadugarPercent, band, coordinates: coords });
        }

        if (parsed.length === 0) {
          toast({ title: "No valid data", description: "Could not match any towns. Check town names.", variant: "destructive" });
          setLoading(false);
          return;
        }

        if (skipped.length > 0) {
          toast({
            title: `${skipped.length} rows skipped`,
            description: skipped.slice(0, 5).join(", ") + (skipped.length > 5 ? ` and ${skipped.length - 5} more...` : ""),
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
            <p className="text-sm font-medium text-foreground">
              Drag & drop your Excel file here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Format: <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Town | Jadugar | Jadugar % | Band</span>
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
  );
};
