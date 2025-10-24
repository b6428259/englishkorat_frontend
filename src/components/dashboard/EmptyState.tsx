"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  iconClassName = "text-gray-400",
}: Readonly<EmptyStateProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-md p-12"
    >
      <div className="text-center">
        <Icon className={`h-16 w-16 mx-auto mb-4 ${iconClassName}`} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}
