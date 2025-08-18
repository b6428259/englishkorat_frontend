/**
 * TypeScript interfaces for sidebar components
 */

import { ReactNode } from 'react';

/**
 * Interface for child menu items in sidebar
 */
export interface SidebarChildItem {
  /** Unique identifier for the child item */
  id: string;
  /** Display label for the child item */
  label: string;
  /** Navigation href for the child item */
  href: string;
  /** Optional icon for the child item */
  icon?: React.ReactNode;
}

/**
 * Interface for main sidebar items
 */
export interface SidebarItem {
  /** Unique identifier for the sidebar item */
  id: string;
  /** Display label for the sidebar item */
  label: string;
  /** Optional navigation href (some items only open submenus) */
  href?: string;
  /** Icon component to display */
  icon: ReactNode;
  /** Optional array of child items for dropdown menus */
  children?: SidebarChildItem[];
}

/**
 * Props interface for the main Sidebar component
 */
export interface SidebarProps {
  /** Additional CSS classes to apply */
  className?: string;
  /** Whether the sidebar is expanded or collapsed */
  expanded: boolean;
  /** Whether the current device is mobile */
  isMobile: boolean;
  /** Callback function to toggle sidebar state */
  onToggle: (expanded: boolean) => void;
}

/**
 * Props interface for individual SidebarItem component
 */
export interface SidebarItemProps {
  /** The sidebar item data */
  item: SidebarItem;
  /** Whether the item is currently active */
  isActive: boolean;
  /** Whether the sidebar is expanded */
  expanded: boolean;
  /** Whether labels should be visible */
  labelsVisible: boolean;
  /** Whether the device is mobile */
  isMobile: boolean;
  /** Whether the item's submenu is open */
  isOpen: boolean;
  /** Callback for handling parent item clicks */
  onParentClick: (item: SidebarItem) => void;
  /** Callback for handling child item clicks */
  onChildClick: (href: string) => void;
  /** Function to check if a route is active */
  isActiveRoute: (href?: string) => boolean;
}

/**
 * Props interface for SidebarToggle component
 */
export interface SidebarToggleProps {
  /** Whether the sidebar is expanded */
  expanded: boolean;
  /** Whether the device is mobile */
  isMobile: boolean;
  /** Callback function to toggle sidebar */
  onToggle: () => void;
}