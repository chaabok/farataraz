"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Tooltip } from "../ui/Tooltip";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType | React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'outline' | 'ghost' | 'indigo';
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  hideLabel?: boolean;
}

export function ActionButton({
  icon: Icon,
  variant = 'secondary',
  tooltip,
  tooltipPosition = 'bottom',
  hideLabel,
  children,
  className,
  ...props
}: ActionButtonProps) {
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
    indigo: "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700",
    info: "bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700",
    warning: "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600",
    outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
  };

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const Component = Icon as React.ElementType;
    return <Component className="h-[1.2rem] w-[1.2rem] shrink-0" />;
  };

  const button = (
    <button
      className={cn(
        "flex outline-none items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 h-[30px] shrink-0",
        hideLabel ? "w-[30px] h-[30px] p-0" : "h-[30px] px-2.5 py-1",
        variant === 'primary' && 'focus:ring-blue-500',
        variant === 'indigo' && 'focus:ring-indigo-500',
        variant === 'secondary' && 'focus:ring-gray-300 dark:focus:ring-gray-600',
        variant === 'success' && 'focus:ring-emerald-500',
        variant === 'info' && 'focus:ring-cyan-500',
        variant === 'warning' && 'focus:ring-orange-500',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {renderIcon()}
      {!hideLabel && <span>{children}</span>}
    </button>
  );

  return (
    <Tooltip content={tooltip} position={tooltipPosition}>
      {button}
    </Tooltip>
  );
}

