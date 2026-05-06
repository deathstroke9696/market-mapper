import { MarketData, BAND_COLORS } from "@/data/marketData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MarketTableProps {
  data: MarketData[];
}

export const MarketTable = ({ data }: MarketTableProps) => (
  <div className="rounded-lg border border-border overflow-hidden bg-card">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="text-muted-foreground font-semibold text-xs">Market</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs text-right">Balanced</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs text-right">Volume</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs text-right">%</TableHead>
          <TableHead className="text-muted-foreground font-semibold text-xs">Band</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.marketName} className="hover:bg-muted/30 transition-colors">
            <TableCell className="font-medium text-sm text-card-foreground">{row.marketName}</TableCell>
            <TableCell className="text-right text-sm">{row.balanced.toLocaleString()}</TableCell>
            <TableCell className="text-right text-sm">{row.volume.toLocaleString()}</TableCell>
            <TableCell className="text-right text-sm">{row.percentage}%</TableCell>
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
