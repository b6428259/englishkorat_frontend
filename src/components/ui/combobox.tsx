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

export function Combobox({
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

  // Debug logging
  console.log("Combobox render:", {
    optionsLength: options?.length || 0,
    options: options,
    value: value,
    placeholder: placeholder,
  });

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const filteredOptions = React.useMemo(() => {
    const result = !searchValue
      ? options
      : options.filter(
          (option) =>
            option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
            option.description
              ?.toLowerCase()
              .includes(searchValue.toLowerCase())
        );
    console.log("Combobox filteredOptions:", {
      searchValue,
      filteredCount: result.length,
      totalOptions: options.length,
      firstOption: result[0],
    });
    return result;
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
            "w-full justify-between text-left font-normal",
            !selectedOption && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {displayText.length > maxDisplayLength
              ? displayText.substring(0, maxDisplayLength) + "..."
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
        className="w-full p-0 z-[10000] max-h-[300px] overflow-hidden"
        style={{
          minWidth: "var(--radix-popover-trigger-width)",
          zIndex: 10000,
        }}
        sideOffset={4}
      >
        <div className="overflow-hidden rounded-md border bg-white">
          {/* Search Input */}
          <div className="border-b px-3 py-2">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-7 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* Options List */}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      console.log("Option clicked:", option.value);
                      handleSelect(option.value);
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex-1 min-w-0">
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
