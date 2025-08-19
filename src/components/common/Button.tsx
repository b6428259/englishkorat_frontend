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

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  style,
  variant = 'primary',
}) => {
  const baseStyle =
    "px-6 py-2 rounded-3xl transition-colors shadow-md hover:shadow-lg hover:scale-105 font-semibold";

  const variants: Record<string, string> = {
    primary: "bg-[#334293] text-white hover:bg-[#EFE957] hover:text-[#334293]",
    secondary: "bg-[#EFE957] text-[#334293] hover:bg-[#EFD157]",
    outline: "border-2 border-[#334293] text-[#334293] hover:bg-[#EFE957]",
    link: "text-[#EFE957] hover:text-[#EFD157]",
    monthViewClicked: "rounded-e-sm bg-[#334293] text-white",
    monthView: "border-1 border-[#334293] rounded-e-sm bg-white text-[#334293]",
    weekViewClicked: "rounded-sm bg-[#334293] text-white",
    weekView: "border-1 border-[#334293] rounded-sm bg-white text-[#334293]",
    dayViewClicked: "rounded-s-sm bg-[#334293] text-white",
    dayView: "border-1 border-[#334293] rounded-s-sm bg-white text-[#334293]"
  };

  const combinedClass = `${baseStyle} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClass} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${combinedClass} disabled:opacity-50`}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
