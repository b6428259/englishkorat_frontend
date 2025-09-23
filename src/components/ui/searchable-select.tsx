"use client";

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
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string | number;
  onValueChange: (value: string | number) => void;
  /** Optional async loader for remote options. Receives the current query and should return options array. */
  fetchOptions?: (query: string) => Promise<SearchableSelectOption[]>;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  allowClear?: boolean;
  maxDisplayLength?: number;
  groupBy?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  fetchOptions,
  placeholder = "Select option...",
  emptyText = "No option found.",
  searchPlaceholder = "Search options...",
  disabled = false,
  loading = false,
  className,
  allowClear = false,
  maxDisplayLength = 50,
  groupBy = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteOptions, setRemoteOptions] = useState<SearchableSelectOption[]>(
    []
  );

  // Find selected option
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  // Filter and group options based on search
  const filteredOptions = useMemo(() => {
    const source = fetchOptions ? remoteOptions : options;
    const filtered = source.filter(
      (option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!groupBy) return filtered;

    // Group options by 'group' property
    const grouped = filtered.reduce((acc, option) => {
      const group = option.group || "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {} as Record<string, SearchableSelectOption[]>);

    return grouped;
  }, [options, searchQuery, groupBy, fetchOptions, remoteOptions]);

  // Truncate display text if too long
  const truncateText = (text: string) => {
    if (text.length <= maxDisplayLength) return text;
    return text.substring(0, maxDisplayLength) + "...";
  };

  // Handle selection
  const handleSelect = (selectedValue: string | number) => {
    if (selectedValue === value) {
      setOpen(false);
      return;
    }

    onValueChange(selectedValue);
    setOpen(false);
    setSearchQuery("");
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
  };

  // Reset search when opening
  useEffect(() => {
    if (open) {
      setSearchQuery("");
    }
  }, [open]);

  // Fetch remote options when query changes (debounced)
  useEffect(() => {
    if (!fetchOptions) return;
    let mounted = true;
    setRemoteLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetchOptions(searchQuery);
        if (!mounted) return;
        setRemoteOptions(res || []);
      } catch {
        if (!mounted) return;
        setRemoteOptions([]);
      } finally {
        if (mounted) setRemoteLoading(false);
      }
    }, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
      setRemoteLoading(false);
    };
  }, [fetchOptions, searchQuery]);

  const displayText = selectedOption
    ? truncateText(selectedOption.label)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled || loading}
        >
          <span className="truncate">{displayText}</span>
          <div className="flex items-center gap-1">
            {allowClear && selectedOption && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        style={{ width: triggerRef.current?.offsetWidth || 240, minWidth: 200 }}
      >
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-64 overflow-auto">
            <CommandEmpty>{emptyText}</CommandEmpty>

            {loading || remoteLoading ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : groupBy &&
              typeof filteredOptions === "object" &&
              !Array.isArray(filteredOptions) ? (
              // Render grouped options
              Object.entries(filteredOptions).map(([group, groupOptions]) => (
                <CommandGroup key={group} heading={group}>
                  {groupOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="truncate">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : (
              // Render flat options
              (Array.isArray(filteredOptions) ? filteredOptions : []).map(
                (option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
