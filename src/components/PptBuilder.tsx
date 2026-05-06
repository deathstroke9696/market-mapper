import { useState, useEffect, useCallback } from "react";
import PptxGenJS from "pptxgenjs";
import { toast } from "sonner";
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Band, Filters, BAND_COLORS } from "@/data/marketData";
import {
  buildFilterSummary, computeBandCounts, captureMapAsDataUrl, suggestSlideTitle,
} from "@/lib/pptHelpers";
import type { MarketData } from "@/data/marketData";

export interface PptSlide {
  id: string;
  title: string;
  filterSummary: string[];
  filters: Filters;
  bandCounts: Record<Band, number>;
  totalMarkets: number;
  mapImageDataUrl: string;
  createdAt: string;
}

const STORAGE_KEY = "marketMapper.pptPlan";
const BAND_ORDER: Band[] = ["Green", "Yellow", "Orange", "Red", "Blue", "Grey"];

function loadSlides(): PptSlide[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSlides(slides: PptSlide[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
  } catch {}
}

interface PptBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  filteredData: MarketData[];
  mapElementId: string;
}

export function PptBuilder({
  open, onOpenChange, filters, filteredData, mapElementId,
}: PptBuilderProps) {
  const [slides, setSlides] = useState<PptSlide[]>(loadSlides);
  const [slideTitle, setSlideTitle] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSlides(loadSlides());
      setSlideTitle(suggestSlideTitle(filters));
    }
  }, [open, filters]);

  useEffect(() => { saveSlides(slides); }, [slides]);

  const addSlide = useCallback(async () => {
    setCapturing(true);
    try {
      const dataUrl = await captureMapAsDataUrl(mapElementId);
      const newSlide: PptSlide = {
        id: crypto.randomUUID(),
        title: slideTitle || suggestSlideTitle(filters),
        filterSummary: buildFilterSummary(filters),
        filters: JSON.parse(JSON.stringify(filters)),
        bandCounts: computeBandCounts(filteredData),
        totalMarkets: filteredData.length,
        mapImageDataUrl: dataUrl,
        createdAt: new Date().toISOString(),
      };
      setSlides((prev) => [...prev, newSlide]);
      setSlideTitle("");
      toast.success("Slide added to deck");
    } catch (e) {
      toast.error("Failed to capture map");
    } finally {
      setCapturing(false);
    }
  }, [slideTitle, filters, filteredData, mapElementId]);

  const removeSlide = (id: string) => setSlides((s) => s.filter((x) => x.id !== id));

  const moveSlide = (idx: number, dir: -1 | 1) => {
    setSlides((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const updateTitle = (id: string, title: string) => {
    setSlides((s) => s.map((x) => (x.id === id ? { ...x, title } : x)));
  };

  const clearAll = () => {
    if (!confirm("Remove all slides?")) return;
    setSlides([]);
    toast("All slides cleared");
  };

  const generatePpt = async () => {
    setGenerating(true);
    try {
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";

      for (let i = 0; i < slides.length; i++) {
        toast(`Generating slide ${i + 1} of ${slides.length}...`);
        const s = slides[i];
        const slide = pptx.addSlide();

        slide.addText(s.title, {
          x: 0.3, y: 0.2, w: 9.4, h: 0.6,
          fontSize: 24, bold: true, color: "1a1a2e",
        });

        slide.addText(s.filterSummary.join(" | "), {
          x: 0.3, y: 0.8, w: 9.4, h: 0.35,
          fontSize: 12, color: "666666",
        });

        slide.addImage({
          data: s.mapImageDataUrl,
          x: 0.3, y: 1.2, w: 6.5, h: 3.8,
        });

        let yPos = 1.5;
        for (const band of BAND_ORDER) {
          if (s.bandCounts[band] === 0) continue;
          const color = BAND_COLORS[band].replace(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/, (_m, h, s, l) => {
            // Convert HSL to hex for pptxgenjs
            return hslToHex(+h, +s, +l);
          });
          slide.addShape(pptx.ShapeType.ellipse, {
            x: 7.2, y: yPos, w: 0.2, h: 0.2, fill: { color },
          });
          slide.addText(`${s.bandCounts[band]}  ${band}`, {
            x: 7.5, y: yPos - 0.02, w: 2, h: 0.25,
            fontSize: 13, color: "333333",
          });
          yPos += 0.35;
        }

        slide.addText(`Total: ${s.totalMarkets}`, {
          x: 7.2, y: yPos + 0.05, w: 2.5, h: 0.3,
          fontSize: 14, bold: true, color: "1a1a2e",
        });

        const now = new Date();
        slide.addText(`Generated ${now.toLocaleDateString()}`, {
          x: 7, y: 5.1, w: 2.8, h: 0.3,
          fontSize: 9, color: "999999", align: "right",
        });
      }

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const filename = `market-deck-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.pptx`;
      await pptx.writeFile({ fileName: filename });
      toast.success(`PPT downloaded with ${slides.length} slides`);
    } catch (e) {
      toast.error("Failed to generate PPT");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[480px] sm:max-w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>PPT Builder</SheetTitle>
          <SheetDescription>Configure slides, then generate your deck.</SheetDescription>
        </SheetHeader>

        {/* Add slide row */}
        <div className="border border-border rounded-lg p-3 space-y-2 mt-4">
          <p className="text-xs font-medium text-muted-foreground">Add current view as slide</p>
          <Input
            placeholder="Slide title..."
            value={slideTitle}
            onChange={(e) => setSlideTitle(e.target.value)}
          />
          <Button
            size="sm"
            className="w-full"
            disabled={filteredData.length === 0 || capturing}
            onClick={addSlide}
          >
            <Plus className="w-4 h-4 mr-1" />
            {capturing ? "Capturing..." : "+ Add to deck"}
          </Button>
          {filteredData.length === 0 && (
            <p className="text-xs text-destructive">No markets visible — adjust filters</p>
          )}
        </div>

        {/* Slide list */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 min-h-0">
          {slides.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No slides yet. Apply filters and click "+ Add to deck" to start.
            </p>
          ) : (
            slides.map((s, idx) => (
              <div
                key={s.id}
                className="border border-border rounded-lg p-3 bg-card space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-bold text-muted-foreground shrink-0">
                    Slide {idx + 1}
                  </span>
                  {editingId === s.id ? (
                    <Input
                      className="h-6 text-xs flex-1"
                      value={s.title}
                      onChange={(e) => updateTitle(s.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-xs font-medium truncate flex-1 cursor-pointer hover:underline"
                      onClick={() => setEditingId(s.id)}
                    >
                      {s.title}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSlide(idx, -1)} disabled={idx === 0}>
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1}>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeSlide(s.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {s.filterSummary.map((f, i) => (
                    <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{f}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {BAND_ORDER.map((band) =>
                      s.bandCounts[band] > 0 ? (
                        <span key={band} className="flex items-center gap-0.5 text-[10px]">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ background: BAND_COLORS[band] }}
                          />
                          {s.bandCounts[band]}
                        </span>
                      ) : null
                    )}
                  </div>
                  <img
                    src={s.mapImageDataUrl}
                    alt="map"
                    className="w-[60px] h-[40px] object-cover rounded border border-border ml-auto"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-3 border-t border-border mt-auto">
          <Button variant="secondary" size="sm" onClick={clearAll} disabled={slides.length === 0}>
            Clear all
          </Button>
          <Button size="sm" className="flex-1" onClick={generatePpt} disabled={slides.length === 0 || generating}>
            {generating ? "Generating..." : "Generate PPT"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper to export slide count for badge
export function usePptSlideCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PptSlide[]).length : 0;
  } catch {
    return 0;
  }
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `${f(0)}${f(4)}${f(8)}`;
}
