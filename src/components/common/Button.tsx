"use client";
import React from 'react';
import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'link' | 'monthViewClicked' | 'monthView' 
  | 'weekViewClicked' | 'weekView' | 'dayViewClicked' | 'dayView' | 'common' | 'cancel';
};


const Button = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      href,
      onClick,
      disabled = false,
      type = 'button',
      className = '',
      style,
      size = 'md',
      variant = 'primary',
    },
    ref
  ) => {
    const baseStyle =
      'rounded-3xl transition-colors shadow-md hover:shadow-lg hover:scale-105 font-semibold cursor-pointer';

    const sizeVariants: Record<string, string> = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
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
    const combinedClass = `${baseStyle} ${sizeClass} ${variants[variant]} ${className}`;

    if (href) {
      return (
        <Link href={href} className={combinedClass} style={style} ref={ref as React.Ref<HTMLAnchorElement>}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        onClick={onClick}
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
