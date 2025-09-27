"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
// Command components not needed for simple dropdown;
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  allowClear?: boolean;
  maxDisplayLength?: number;
}

function normalizePrimitive(
  input: string | number | undefined
): string | undefined {
  if (input === undefined || input === null) return undefined;
  const normalized = String(input);
  return normalized.length === 0 ? undefined : normalized;
}

function ComboboxComponent({
  options = [],
  value,
  onValueChange,
  placeholder = "Select option...",
  emptyText = "No option found.",
  searchPlaceholder = "Search options...",
  disabled = false,
  loading = false,
  className,
  allowClear = false,
  maxDisplayLength = 50,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const optionsListRef = React.useRef<HTMLDivElement>(null);

  const normalizedValue = React.useMemo(
    () => normalizePrimitive(value),
    [value]
  );

  const selectedOption = React.useMemo(() => {
    if (normalizedValue === undefined) return undefined;
    return options.find(
      (option) => normalizePrimitive(option.value) === normalizedValue
    );
  }, [options, normalizedValue]);

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    const query = searchValue.toLowerCase();
    return options.filter((option) => {
      const labelMatch = option.label.toLowerCase().includes(query);
      const descriptionMatch = option.description
        ?.toLowerCase()
        .includes(query);
      return labelMatch || descriptionMatch;
    });
  }, [options, searchValue]);

  const displayText = selectedOption?.label || placeholder;

  const handleSelect = (selectedValue: string | number) => {
    if (selectedValue === value) {
      setOpen(false);
      return;
    }
    onValueChange(selectedValue);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
  };

  const handleOptionsWheel = React.useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const container = optionsListRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      const isScrollingUp = event.deltaY < 0;

      if ((isScrollingUp && isAtTop) || (!isScrollingUp && isAtBottom)) {
        return;
      }

      event.stopPropagation();
    },
    []
  );

  // Reset search when closing
  React.useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  if (loading) {
    return (
      <Button
        variant="outline"
        role="combobox"
        disabled
        className={cn(
          "w-full justify-between text-left font-normal",
          "text-muted-foreground",
          className
        )}
      >
        <span>Loading...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal transition-colors duration-200",
            !selectedOption && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {displayText.length > maxDisplayLength
              ? `${displayText.substring(0, maxDisplayLength)}...`
              : displayText}
          </span>
          <div className="flex items-center gap-1">
            {allowClear && selectedOption && (
              <button
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "z-[10000] w-full max-h-[300px] overflow-hidden rounded-md border bg-popover p-0 text-popover-foreground shadow-lg outline-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2"
        )}
        style={{
          minWidth: "var(--radix-popover-trigger-width)",
          zIndex: 10000,
        }}
        sideOffset={4}
      >
        <div className="overflow-hidden rounded-md bg-white">
          {/* Search Input */}
          <div className="border-b px-3 py-2">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="text-gray-700 w-full h-7 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* Options List */}
          <div
            ref={optionsListRef}
            className="max-h-[200px] overflow-y-auto scroll-smooth"
            onWheel={handleOptionsWheel}
          >
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground text-gray-700">
                {emptyText}
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "text-gray-700 flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex-1 min-w-0 text-gray-700">
                      <div className="truncate font-medium text-sm">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 flex-shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const Combobox = React.memo(ComboboxComponent);
