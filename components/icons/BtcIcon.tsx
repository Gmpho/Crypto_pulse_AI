/**
 * @file Renders a stylized Bitcoin (BTC) icon.
 * This SVG icon is used in the header and other parts of the UI to represent the application's theme.
 */

import React from 'react';

/**
 * A functional component that renders the Bitcoin SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const BtcIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <circle cx="12" cy="12" r="10" fill="#F7931A" stroke="none" />
    <path
      d="M14.5 8.5h-5a2 2 0 0 0 -2 2v3a2 2 0 0 0 2 2h5a2 2 0 0 0 2 -2v-3a2 2 0 0 0 -2 -2zm-5 5v-3m5 3v-3m-4 1.5h3"
      stroke="#FFFFFF"
      strokeWidth="1.5"
    />
    <path d="M11.5 7.5v-1" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M11.5 16.5v1" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M12.5 7.5v-1" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M12.5 16.5v1" stroke="#FFFFFF" strokeWidth="1.5" />
  </svg>
);