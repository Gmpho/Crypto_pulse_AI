/**
 * @file Renders a generic user profile icon.
 * This is used in the chat panel to represent messages sent by the user.
 */
import React from 'react';

/**
 * A functional component that renders a generic user SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);