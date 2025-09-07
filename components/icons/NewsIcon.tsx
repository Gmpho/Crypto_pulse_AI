/**
 * @file Renders a newspaper icon.
 * This is used as the header icon for the NewsFeed component.
 */
import React from 'react';

/**
 * A functional component that renders a newspaper SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const NewsIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z" />
    <path d="M16 2v20" />
    <path d="M8 7h4" />
    <path d="M8 12h4" />
    <path d="M8 17h4" />
  </svg>
);