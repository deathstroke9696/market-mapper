import { MarketData, BAND_COLORS } from "@/data/marketData";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface MarketTableProps {
  data: MarketData[];
}

export const MarketTable = ({ data }: MarketTableProps) => (
  <div className="rounded-lg border border-border overflow-hidden bg-card max-h-[400px] overflow-y-auto">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="text-muted-foreground font-semibold text-xs">Town</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs">State</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs">Branch</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs">Brand</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs">Segment</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs text-right">Vol</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs text-right">Vol %</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs">Band</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, idx) => (
          <TableRow key={`${row.marketName}-${idx}`} className="hover:bg-muted/30 transition-colors">
            <TableCell className="font-medium text-sm text-card-foreground">{row.marketName}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{row.state}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{row.branch}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{row.brand}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{row.segment}</TableCell>
            <TableCell className="text-right text-sm">{(row.vol ?? 0).toLocaleString()}</TableCell>
            <TableCell className="text-right text-sm">{row.volPercent ?? 0}%</TableCell>
            <TableCell>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: BAND_COLORS[row.band] + "20",
                  color: BAND_COLORS[row.band],
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BAND_COLORS[row.band] }} />
                {row.band}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
