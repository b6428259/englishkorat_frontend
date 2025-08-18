/**
 * SidebarToggle component
 * Positioned on the middle of the sidebar's right edge for better UX
 */

"use client";

import React from 'react';
import { Button } from '@heroui/button';
import { motion } from 'framer-motion';
import { SidebarToggleProps } from './types';

/**
 * Chevron icon component for the toggle button
 */
const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-180' : 'rotate-0'}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2.2}
    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

/**
 * SidebarToggle component with improved positioning and styling
 */
const SidebarToggle: React.FC<SidebarToggleProps> = ({ expanded, isMobile, onToggle }) => {
  // Don't show toggle button on mobile as sidebar behavior is different
  if (isMobile) return null;

  return (
    <motion.div
      className="absolute top-1/2 -right-5 transform -translate-y-1/2 z-50"
      initial={false}
      animate={{
        x: expanded ? 0 : 0,
        opacity: 1
      }}
      transition={{
        duration: 0.25,
        ease: 'easeInOut'
      }}
    >
      <Button
        isIconOnly
        size="sm"
        radius="full"
        variant="solid"
        color="primary"
        className="w-9 h-9 min-w-9 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border border-gray-200 bg-white text-gray-700"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
        onPress={onToggle}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <ChevronIcon expanded={expanded} />
      </Button>
    </motion.div>
  );
};

export default SidebarToggle;