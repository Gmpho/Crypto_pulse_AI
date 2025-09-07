/**
 * @file Renders a "Wi-Fi Off" icon.
 * This is used to indicate a disconnected or suspended data connection.
 */
import React from 'react';

/**
 * A functional component that renders a Wi-Fi Off SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const WifiOffIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22 8.82" />
    <path d="M2 8.82a15 15 0 0 1 .91-1.55" />
    <path d="M8.53 16.11a5 5 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);