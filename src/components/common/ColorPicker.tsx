"use client";

import React, { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function ColorPicker({
  color,
  onChange,
  label,
  disabled = false,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Validate hex color (with or without #)
    const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    const valueWithHash = value.startsWith("#") ? value : `#${value}`;

    if (hexRegex.test(valueWithHash)) {
      onChange(valueWithHash);
    }
  };

  const handleInputBlur = () => {
    // Ensure the value has # prefix
    if (inputValue && !inputValue.startsWith("#")) {
      const valueWithHash = `#${inputValue}`;
      setInputValue(valueWithHash);
      onChange(valueWithHash);
    }
  };

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
    setInputValue(newColor);
  };

  const presetColors = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Amber
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#6366F1", // Indigo
    "#14B8A6", // Teal
    "#84CC16", // Lime
    "#F43F5E", // Rose
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex items-center space-x-3">
        {/* Color Preview Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ backgroundColor: color }}
          aria-label="Pick color"
        />

        {/* Hex Input */}
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            placeholder="#3B82F6"
            maxLength={7}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
          />
        </div>
      </div>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200"
        >
          <HexColorPicker color={color} onChange={handleColorChange} />

          {/* Preset Colors */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Preset Colors
            </p>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => handleColorChange(presetColor)}
                  className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{ backgroundColor: presetColor }}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
