"use client";

import { TH as FlagTH, US as FlagUS } from "country-flag-icons/react/3x2";
import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Language } from "../../locales/translations";

interface LanguageSwitchProps {
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  className = "",
  showLabels = true,
  compact = false,
}) => {
  const { language, setLanguage, isLoading } = useLanguage();

  if (isLoading) {
    const skeletonWidth = compact ? "w-12" : "w-16";
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded h-8 ${skeletonWidth} ${className}`}
      />
    );
  }

  const handleLanguageToggle = () => {
    const newLanguage: Language = language === "th" ? "en" : "th";
    setLanguage(newLanguage);
  };

  const flagWidth = compact ? 22 : 24;
  const flagHeight = compact ? 15 : 16;
  const buttonPadding = compact ? "px-2 py-1" : "px-2.5 py-1.5 sm:px-3 sm:py-2";
  const buttonGap = compact ? "gap-1.5" : "gap-2";
  const flagGapClass = compact ? "gap-1.5" : "gap-1.5 sm:gap-2";
  const labelMarginClass = compact ? "" : "sm:ml-3";
  const isThai = language === "th";
  const isEnglish = language === "en";
  const flagClass = (active: boolean) =>
    `transition-all duration-300 ${
      active ? "opacity-100 scale-100 drop-shadow-sm" : "opacity-60 scale-95"
    }`;
  const flagStyle = (active: boolean) => ({
    width: flagWidth,
    height: flagHeight,
    borderRadius: 3,
    boxShadow: active ? "0 2px 8px #33429333" : "none",
  });

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <button
        onClick={handleLanguageToggle}
        className={`flex items-center ${buttonGap} rounded-xl border border-transparent bg-white/60 ${buttonPadding} text-gray-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#334293] focus:ring-offset-1 hover:bg-white hover:text-[#334293]`}
        aria-label={`Switch to ${
          language === "th" ? "English" : "Thai"
        } language`}
        aria-pressed={language === "th"}
      >
        <div className={`flex items-center ${flagGapClass}`}>
          <span className={flagClass(isThai)} style={flagStyle(isThai)}>
            <FlagTH title="Thai" style={flagStyle(isThai)} />
          </span>
          <span className={flagClass(isEnglish)} style={flagStyle(isEnglish)}>
            <FlagUS title="English" style={flagStyle(isEnglish)} />
          </span>
        </div>
        {showLabels && (
          <span
            className={`ml-2 text-xs font-semibold text-gray-700 transition-colors duration-300 ${labelMarginClass}`}
          >
            <span className="inline sm:hidden">{isThai ? "TH" : "EN"}</span>
            <span className="hidden sm:inline">{isThai ? "ไทย" : "EN"}</span>
          </span>
        )}
      </button>
    </div>
  );
};

export default LanguageSwitch;
