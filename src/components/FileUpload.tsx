import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
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

const getCoordinates = (town: string): [number, number] | null => {
  const key = town.trim().toLowerCase();
  return TOWN_COORDINATES[key] ?? null;
};

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [dragging, setDragging] = useState(false);
  const { toast } = useToast();

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

          if (rows.length === 0) {
            toast({ title: "Empty file", description: "The uploaded file has no data rows.", variant: "destructive" });
            return;
          }

          // Find columns (case-insensitive)
          const firstRow = rows[0];
          const keys = Object.keys(firstRow);
          const findCol = (search: string) => keys.find((k) => k.toLowerCase().includes(search.toLowerCase()));

          const townCol = findCol("town") || findCol("market") || keys[0];
          const jadugarCol = findCol("jadugar %") ? undefined : findCol("jadugar");
          const jadugarPctCol = findCol("jadugar %") || findCol("jadugar%");
          const bandCol = findCol("band");

          if (!townCol || !bandCol) {
            toast({ title: "Invalid format", description: "File must have Town and Band columns.", variant: "destructive" });
            return;
          }

          const parsed: MarketData[] = [];
          const skipped: string[] = [];

          for (const row of rows) {
            const town = String(row[townCol] || "").trim();
            if (!town) continue;

            const band = normalizeBand(String(row[bandCol!] || ""));
            if (!band) { skipped.push(town + " (invalid band)"); continue; }

            const coords = getCoordinates(town);
            if (!coords) { skipped.push(town + " (unknown location)"); continue; }

            const jadugar = jadugarCol ? Number(row[jadugarCol]) || 0 : 0;
            const jadugarPercent = jadugarPctCol ? Number(row[jadugarPctCol]) || 0 : 0;

            parsed.push({ marketName: town, jadugar, jadugarPercent, band, coordinates: coords });
          }

          if (parsed.length === 0) {
            toast({ title: "No valid data", description: "Could not match any towns. Check town names.", variant: "destructive" });
            return;
          }

          if (skipped.length > 0) {
            toast({ title: `${skipped.length} rows skipped`, description: skipped.slice(0, 5).join(", "), });
          }

          toast({ title: "Data loaded", description: `${parsed.length} markets plotted on map.` });
          onDataLoaded(parsed);
        } catch {
          toast({ title: "Error reading file", description: "Please upload a valid .xlsx or .xls file.", variant: "destructive" });
        }
      };
      reader.readAsArrayBuffer(file);
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
          <FileSpreadsheet className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Drag & drop your Excel file here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Format: <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Town | Jadugar | Jadugar % | Band</span>
          </p>
        </div>
        <label>
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileInput} />
          <Button variant="outline" size="sm" asChild>
            <span className="cursor-pointer">
              <Upload className="w-4 h-4 mr-1" />
              Browse files
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};
