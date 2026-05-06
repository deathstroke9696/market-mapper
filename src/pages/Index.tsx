import IndiaMap from "@/components/IndiaMap";
import { BandLegend } from "@/components/BandLegend";
import { MarketTable } from "@/components/MarketTable";
import { sampleMarketData } from "@/data/marketData";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">India Market Performance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Hover over town markers to view Balanced, Volume & Percentage metrics
        </p>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-card-foreground">Market Band Map</h2>
            <BandLegend />
          </div>
          <div className="h-[550px]">
            <IndiaMap data={sampleMarketData} />
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Market Data</h2>
          <MarketTable data={sampleMarketData} />
        </div>
      </main>
    </div>
  );
};

export default Index;
