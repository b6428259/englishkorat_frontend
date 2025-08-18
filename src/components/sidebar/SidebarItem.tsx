/**
 * SidebarItem component
 * Individual menu item with support for submenus and navigation
 */

"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@heroui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarItemProps } from './types';

/**
 * Chevron icon for submenu indication
 */
const SubmenuChevron = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

/**
 * Label component with animation
 */
const AnimatedLabel: React.FC<{ 
  label: string; 
  visible: boolean; 
  uniqueKey: string; 
}> = ({ label, visible, uniqueKey }) => (
  <AnimatePresence mode="wait">
    {visible && (
      <motion.span
        key={uniqueKey}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        className="font-medium text-left truncate flex-1"
      >
        {label}
      </motion.span>
    )}
  </AnimatePresence>
);

/**
 * SidebarItem component
 */
const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  expanded,
  labelsVisible,
  isMobile,
  isOpen,
  onParentClick,
  onChildClick,
  isActiveRoute
}) => {
  const hasChildren = item.children && item.children.length > 0;
  
  // Base styles for menu items
  const baseItemClasses = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer";
  const activeClasses = isActive 
    ? "bg-primary-500 text-white shadow-md" 
    : "text-gray-700 hover:bg-gray-100 hover:text-primary-600";

  /**
   * Parent button for items with children or no href
   */
  const ParentButton = (
    <Button
      variant="light"
      className={`${baseItemClasses} ${activeClasses} justify-start`}
      onPress={() => onParentClick(item)}
      startContent={
        <span className="flex-shrink-0 text-current">
          {item.icon}
        </span>
      }
      endContent={
        labelsVisible && hasChildren ? (
          <SubmenuChevron isOpen={isOpen} />
        ) : null
      }
    >
      <AnimatedLabel
        label={item.label}
        visible={labelsVisible}
        uniqueKey={`${item.id}-label`}
      />
    </Button>
  );

  /**
   * Link component for items with direct navigation
   */
  const ParentLink = item.href ? (
    <Link
      href={item.href}
      className={`${baseItemClasses} ${activeClasses} no-underline`}
      onClick={() => { 
        if (isMobile) onChildClick(item.href!); 
      }}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <AnimatedLabel
        label={item.label}
        visible={labelsVisible}
        uniqueKey={`${item.id}-label-link`}
      />
    </Link>
  ) : null;

  return (
    <li>
      {/* Render either button (for items with children) or link (for direct navigation) */}
      {hasChildren ? ParentButton : ParentLink}

      {/* Submenu */}
      <AnimatePresence initial={false}>
        {expanded && labelsVisible && hasChildren && isOpen && (
          <motion.ul
            key={`${item.id}-submenu`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-1 ml-10 pr-2 flex flex-col overflow-hidden space-y-1"
          >
            {item.children!.map((child) => {
              const childActive = isActiveRoute(child.href);
              return (
                <li key={child.id}>
                  <Button
                    variant="light"
                    size="sm"
                    className={`
                      w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 justify-start cursor-pointer
                      ${childActive 
                        ? 'bg-primary-50 text-primary-600 font-medium border-l-2 border-primary-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                      }
                    `}
                    onPress={() => onChildClick(child.href)}
                  >
                    {child.label}
                  </Button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
};

export default SidebarItem;