import React from 'react';

type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    style?: React.CSSProperties;
};

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    disabled = false,
    type = 'button',
    className = '',
    style,
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 ${className}`}
        style={style}
    >
        {children}
    </button>
);

export default Button;