import React from "react";

export function Button2({ children, onClick, disabled, variant, className, ...props }) {
  const base = "px-4 py-2 rounded font-medium transition-colors";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-100",
  };
  const vClass = variants[variant] || variants.default;
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${vClass} ${className || ""}`} {...props}>
      {children}
    </button>
  );
}