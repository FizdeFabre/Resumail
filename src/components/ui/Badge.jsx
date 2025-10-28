// src/components/ui/Badge.jsx
import React from "react";
import { Badge as RSBadge } from "reactstrap";

export function Badge({ children, color = "primary", className = "" }) {
  const colorMap = {
    primary: "bg-indigo-600 text-white",
    secondary: "bg-gray-600 text-white",
    success: "bg-green-600 text-white",
    danger: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
    light: "bg-gray-100 text-gray-700",
    dark: "bg-gray-900 text-white",
  };

  return (
    <RSBadge
      color="none"
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorMap[color] || colorMap.primary} ${className}`}
    >
      {children}
    </RSBadge>
  );
}
