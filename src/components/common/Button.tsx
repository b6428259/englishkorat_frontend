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
  variant?: 'primary' | 'secondary' | 'outline' | 'link' | 'monthViewClicked' | 'monthView' | 'weekViewClicked' | 'weekView' | 'dayViewClicked' | 'dayView';
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
      variant = 'primary',
    },
    ref
  ) => {
    const baseStyle =
      "px-6 py-2 rounded-3xl transition-colors shadow-md hover:shadow-lg hover:scale-105 font-semibold cursor-pointer";

    const variants: Record<string, string> = {
      primary: "bg-[#334293] text-white hover:bg-[#EFE957] hover:text-[#334293]",
      secondary: "bg-[#EFE957] text-[#334293] hover:bg-[#EFD157]",
      outline: "border-2 border-[#334293] text-[#334293] hover:bg-white hover:text-[#334293]",
      link: "text-[#EFE957] hover:text-[#EFD157]",
      monthViewClicked: "rounded-lg bg-[#334293] text-white",
      monthView: "rounded-lg bg-white text-[#334293]",
      weekViewClicked: "rounded-lg bg-[#334293] text-white",
      weekView: "rounded-lg bg-white text-[#334293]",
      dayViewClicked: "rounded-lg bg-[#334293] text-white",
      dayView: "rounded-lg bg-white text-[#334293]"
    };

    const combinedClass = `${baseStyle} ${variants[variant]} ${className}`;

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
