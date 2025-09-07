/**
 * @file Renders a Wi-Fi icon.
 * This is used to indicate an active or polling data connection.
 */
import React from 'react';

/**
 * A functional component that renders a Wi-Fi SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const WifiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12.55a11 11 0 0 1 14 0" />
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <path d="M8 16.29a5 5 0 0 1 8 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);