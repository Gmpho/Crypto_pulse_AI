/**
 * @file Renders a sparkle icon.
 * This icon is used throughout the application to signify AI-powered features,
 * such as the chat assistant and market analysis panel.
 */
import React from 'react';

/**
 * A functional component that renders a sparkle SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
    <path d="M4.5 4.5l3 3" />
    <path d="M16.5 4.5l-3 3" />
    <path d="M4.5 16.5l3-3" />
    <path d="M16.5 16.5l-3-3" />
  </svg>
);