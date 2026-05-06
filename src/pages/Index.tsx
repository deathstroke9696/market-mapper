import { useState, useMemo, useCallback } from "react";
import { Camera, Presentation } from "lucide-react";
import { toast } from "sonner";
import IndiaMap from "@/components/IndiaMap";
import { BandLegend } from "@/components/BandLegend";
import { BandCountsLegend } from "@/components/BandCountsLegend";
import { MarketTable } from "@/components/MarketTable";
import { FileUpload } from "@/components/FileUpload";
import { MapFilters } from "@/components/MapFilters";
import { PptBuilder, usePptSlideCount } from "@/components/PptBuilder";
import { Button } from "@/components/ui/button";
import { MarketData, Filters, emptyFilters, applyFilters, STATE_COLORS } from "@/data/marketData";
import { captureMapAsDataUrl } from "@/lib/pptHelpers";

const MAP_ELEMENT_ID = "india-map-snip-target";

const Index = () => {
  const [marketData, setMarketData] = useState<MarketData[] | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [pptOpen, setPptOpen] = useState(false);
  const [snipping, setSnipping] = useState(false);

  const filteredData = useMemo(
    () => (marketData ? applyFilters(marketData, filters) : []),
    [marketData, filters]
  );

  const pptSlideCount = usePptSlideCount();

  const handleSnipMap = useCallback(async () => {
    setSnipping(true);
    try {
      const dataUrl = await captureMapAsDataUrl(MAP_ELEMENT_ID);
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const filename = `market-map-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.png`;
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
      toast.success("Map snipped successfully");
    } catch (e) {
      toast.error("Failed to snip map");
      console.error(e);
    } finally {
      setSnipping(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">India Market Performance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload your Excel file to visualize market data on the map
        </p>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        <FileUpload onDataLoaded={(data) => { setMarketData(data); setFilters(emptyFilters()); }} />

        {marketData && marketData.length > 0 && (
          <>
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-card-foreground">Market Band Map</h2>
                <div className="flex items-center gap-2">
                  <BandLegend />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSnipMap}
                    disabled={snipping || filteredData.length === 0}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    {snipping ? "Snipping..." : "Snip Map"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPptOpen(true)}
                    className="relative"
                  >
                    <Presentation className="w-4 h-4 mr-1" />
                    PPT Builder
                    {pptSlideCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {pptSlideCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              <div className="mb-4">
                <MapFilters data={marketData} filters={filters} onChange={setFilters} />
                <p className="text-xs text-muted-foreground mt-2">
                  Showing {filteredData.length} of {marketData.length} markets
                </p>
              </div>
              <div className="h-[550px] relative" id={MAP_ELEMENT_ID}>
                <IndiaMap data={filteredData} selectedStates={filters.state} />
                <BandCountsLegend data={filteredData} />
              </div>
              {filters.state.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="text-xs text-muted-foreground font-medium">State colors:</span>
                  {filters.state.map((s, i) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-sm border border-border"
                        style={{ backgroundColor: STATE_COLORS[i % STATE_COLORS.length], opacity: 0.7 }}
                      />
                      <span className="text-xs text-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground mb-3">Market Data</h2>
              <MarketTable data={filteredData} />
            </div>
          </>
        )}
      </main>

      <PptBuilder
        open={pptOpen}
        onOpenChange={setPptOpen}
        filters={filters}
        filteredData={filteredData}
        mapElementId={MAP_ELEMENT_ID}
      />
    </div>
  );
};

export default Index;
