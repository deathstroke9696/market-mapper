import { useMemo } from "react";
import { X, Filter, ChevronDown } from "lucide-react";
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
      const vals = [...new Set(data.map((d) => d[key]).filter((v) => v && v !== "—"))].sort();
      map[key] = vals;
    }
    return map;
  }, [data]);

  const activeCount = Object.values(filters).reduce((s, arr) => s + arr.length, 0);

  const activeEntries = useMemo(() => {
    const entries: { key: FilterKey; label: string; val: string }[] = [];
    for (const { key, label } of FILTER_FIELDS) {
      for (const val of filters[key]) {
        entries.push({ key, label, val });
      }
    }
    return entries;
  }, [filters]);

  const toggle = (key: FilterKey, val: string) => {
    const cur = filters[key];
    const next = cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val];
    onChange({ ...filters, [key]: next });
  };

  const removeChip = (key: FilterKey, val: string) => {
    onChange({ ...filters, [key]: filters[key].filter((v) => v !== val) });
  };

  const clearAll = () => {
    const empty: Filters = {} as any;
    for (const { key } of FILTER_FIELDS) empty[key] = [];
    onChange(empty);
  };

  return (
    <div className="space-y-3">
      {/* Header with filter count and clear all */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          {activeCount > 0 && (
            <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px]">
              {activeCount} selected
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={clearAll}>
            <X className="w-3 h-3" />
            Clear all filters
          </Button>
        )}
      </div>

      {/* Filter buttons row */}
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
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <div className="p-2 border-b border-border flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <span className="text-[10px] text-muted-foreground">{opts.length} options</span>
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
      </div>

      {/* Selected filter chips */}
      {activeEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeEntries.map(({ key, label, val }) => (
            <Badge
              key={`${key}-${val}`}
              variant="secondary"
              className="h-6 text-xs gap-1 pr-1 cursor-pointer hover:bg-secondary/60"
              onClick={() => removeChip(key, val)}
            >
              <span className="text-muted-foreground">{label}:</span> {val}
              <X className="w-3 h-3 ml-0.5" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
