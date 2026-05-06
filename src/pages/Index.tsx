import { useState, useMemo } from "react";
import IndiaMap from "@/components/IndiaMap";
import { BandLegend } from "@/components/BandLegend";
import { MarketTable } from "@/components/MarketTable";
import { FileUpload } from "@/components/FileUpload";
import { MapFilters } from "@/components/MapFilters";
import { MarketData, Filters, emptyFilters, applyFilters, STATE_COLORS } from "@/data/marketData";

const Index = () => {
  const [marketData, setMarketData] = useState<MarketData[] | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters());

  const filteredData = useMemo(
    () => (marketData ? applyFilters(marketData, filters) : []),
    [marketData, filters]
  );

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
                <BandLegend />
              </div>
              <div className="mb-4">
                <MapFilters data={marketData} filters={filters} onChange={setFilters} />
                <p className="text-xs text-muted-foreground mt-2">
                  Showing {filteredData.length} of {marketData.length} markets
                </p>
              </div>
              <div className="h-[550px]">
                <IndiaMap data={filteredData} selectedStates={filters.state} />
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
    </div>
  );
};

export default Index;
