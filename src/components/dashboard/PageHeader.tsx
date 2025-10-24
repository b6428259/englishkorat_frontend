"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: {
    label: string;
    value: number | string;
  };
}

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
}: Readonly<PageHeaderProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 md:px-8 py-8 md:py-10 shadow-lg"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <Icon className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0" />
              <span className="break-words">{title}</span>
            </h1>
            <p className="text-indigo-100 text-sm md:text-lg">{subtitle}</p>
          </div>

          {badge && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/20 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-lg flex-shrink-0"
            >
              <div className="text-xs md:text-sm font-medium whitespace-nowrap">
                {badge.label}: {badge.value}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
