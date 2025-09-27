"use client";
import React, { startTransition } from "react";
// Link is intentionally not used for internal navigation to ensure router.push behavior
// import Link from "next/link";
import { useRouter } from "next/navigation";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  style?: React.CSSProperties;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'link' | 'monthViewClicked' | 'monthView'
  | 'weekViewClicked' | 'weekView' | 'dayViewClicked' | 'dayView' | 'common' | 'cancel';
};


const Button = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  ButtonProps
>(
  (
    {
      children,
      href,
      onClick,
      disabled = false,
      type = "button",
      className = "",
      style,
      size = "md",
      variant = "primary",
    },
    ref
  ) => {
    const router = useRouter();
    const baseStyle =
      "rounded-3xl transition-colors shadow-md hover:shadow-lg hover:scale-105 font-semibold cursor-pointer";

    const sizeVariants: Record<string, string> = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-5 py-3 text-lg",
    };

    const variants: Record<string, string> = {
      primary: 'rounded-lg bg-[#334293] text-white hover:bg-[#EFE957] hover:text-[#334293]',
      secondary: 'bg-[#EFE957] text-[#334293] hover:bg-[#EFD157]',
      outline: 'border-2 border-[#334293] text-[#334293] hover:bg-white hover:text-[#334293]',
      link: 'text-[#EFE957] hover:text-[#EFD157]',
      monthViewClicked: 'rounded-lg bg-white text-black border-2 border-[#334293]',
      monthView: 'rounded-lg bg-white text-[#334293]',
      weekViewClicked: 'rounded-lg bg-white text-black border-2 border-[#334293]',
      weekView: 'rounded-lg bg-white text-[#334293]',
      dayViewClicked: 'rounded-lg bg-white text-black border-2 border-[#334293]',
      dayView: 'rounded-lg bg-white text-[#334293]',
      common: 'rounded-lg bg-[#334293] text-white hover:bg-white hover:text-[#334293] hover:ring-1 hover:ring-[#334293]',
      cancel: 'rounded-lg bg-red-600 text-white hover:bg-white hover:text-red-600 hover:ring-1 hover:ring-red-600',
    };

    const sizeClass = sizeVariants[size] || sizeVariants.md;
    const disabledClass = disabled ? "opacity-50 pointer-events-none" : "";
    const combinedClass =
      `${baseStyle} ${sizeClass} ${variants[variant]} ${disabledClass} ${className}`.trim();

    if (href) {
      // External links should use a normal anchor tag
      const isExternal = /^https?:\/\//i.test(href);

      if (isExternal) {
        return (
          <a
            href={href}
            className={combinedClass}
            style={style}
            ref={ref as React.Ref<HTMLAnchorElement>}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={disabled || undefined}
            onClick={(event) => {
              if (disabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              onClick?.(event);
            }}
          >
            {children}
          </a>
        );
      }

      // Internal links: use router.push on click to ensure client navigation
      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        onClick?.(e);

        if (e.defaultPrevented) {
          return;
        }

        // allow modifier keys to open in new tab/window
        if (
          e.metaKey ||
          e.altKey ||
          e.ctrlKey ||
          e.shiftKey ||
          // middle-click (aux click) detection: button === 1
          e.button === 1
        ) {
          return;
        }
        e.preventDefault();
        try {
          startTransition(() => {
            router.push(href);
          });
        } catch (error) {
          // fallback to native navigation and log for debugging
          console.warn(
            "router.push failed, falling back to window.location",
            error
          );
          window.location.href = href;
        }
      };

      return (
        <a
          href={href}
          className={combinedClass}
          style={style}
          ref={ref as React.Ref<HTMLAnchorElement>}
          onClick={handleClick}
          aria-disabled={disabled || undefined}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onClick?.(event);
        }}
        disabled={disabled}
        className={`${combinedClass} disabled:opacity-50`}
        style={style}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
