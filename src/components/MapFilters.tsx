import { useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketData, FILTER_FIELDS, Filters, FilterKey } from "@/data/marketData";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MapFiltersProps {
  data: MarketData[];
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export const MapFilters = ({ data, filters, onChange }: MapFiltersProps) => {
  const options = useMemo(() => {
    const map: Record<FilterKey, string[]> = {} as any;
    for (const { key } of FILTER_FIELDS) {
      const vals = [...new Set(data.map((d) => d[key]).filter(Boolean))].sort();
      map[key] = vals;
    }
    return map;
  }, [data]);

  const activeCount = Object.values(filters).reduce((s, arr) => s + arr.length, 0);

  const toggle = (key: FilterKey, val: string) => {
    const cur = filters[key];
    const next = cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val];
    onChange({ ...filters, [key]: next });
  };

  const clearAll = () => {
    const empty: Filters = {} as any;
    for (const { key } of FILTER_FIELDS) empty[key] = [];
    onChange(empty);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_FIELDS.map(({ key, label }) => {
        const selected = filters[key];
        const opts = options[key] || [];
        if (opts.length === 0) return null;

        return (
          <Popover key={key}>
            <PopoverTrigger asChild>
              <Button
                variant={selected.length > 0 ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1"
              >
                {label}
                {selected.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                    {selected.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-2 border-b border-border">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
              </div>
              <ScrollArea className="max-h-56">
                <div className="p-2 space-y-1">
                  {opts.map((val) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={selected.includes(val)}
                        onCheckedChange={() => toggle(key, val)}
                      />
                      <span className="truncate">{val}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
              {selected.length > 0 && (
                <div className="p-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={() => onChange({ ...filters, [key]: [] })}
                  >
                    Clear {label}
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        );
      })}

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={clearAll}>
          <X className="w-3 h-3" />
          Clear all
        </Button>
      )}
    </div>
  );
};
