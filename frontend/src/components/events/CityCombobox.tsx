import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CITIES } from "@/data/cities";

interface CityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function CityCombobox({
  value,
  onChange,
  placeholder = "Select city...",
  className,
  triggerClassName,
}: CityComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter cities based on search query
  const filteredCities = React.useMemo(() => {
    if (!searchQuery) return CITIES;
    const query = searchQuery.toLowerCase().trim();
    return CITIES.filter((city) => city.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-bold rounded-xl h-11 border-border/40 hover:bg-accent/10 hover:text-accent-foreground text-left px-3.5",
            triggerClassName
          )}
        >
          <span className="truncate">
            {value
              ? CITIES.find((city) => city.toLowerCase() === value.toLowerCase()) || value
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[280px] p-0 z-[300] border-border/40 bg-popover/95 backdrop-blur-md", className)} align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search city..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-10"
          />
          <CommandList className="max-h-[220px]">
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">No city found.</CommandEmpty>
            <CommandGroup>
              {filteredCities.slice(0, 100).map((city) => (
                <CommandItem
                  key={city}
                  value={city}
                  onSelect={() => {
                    onChange(city);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                  className="cursor-pointer text-xs font-bold py-2.5 px-3 hover:bg-accent hover:text-accent-foreground"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5 shrink-0",
                      value?.toLowerCase() === city.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{city}</span>
                </CommandItem>
              ))}
              {filteredCities.length > 100 && (
                <div className="py-2 px-3 text-[9px] text-muted-foreground font-black uppercase tracking-wider border-t border-border/20 bg-muted/5 text-center">
                  Showing top 100 matches
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
