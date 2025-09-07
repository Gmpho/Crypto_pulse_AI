/**
 * @file Renders the Discord icon.
 * This is used in the WalletModal to represent the Discord connection option.
 */
import React from 'react';

/**
 * A functional component that renders the Discord SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const DiscordIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="#5865F2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.3,3.9A18.1,18.1,0,0,0,14,2.2a15.2,15.2,0,0,0-2.3.4,14,14,0,0,0-5.3,0A15.2,15.2,0,0,0,4,2.2a18.1,18.1,0,0,0-6.3,1.7C1.2,5.2.2,7.9,0,10.6A15.9,15.9,0,0,0,3.3,16,13.6,13.6,0,0,0,7.9,18a10.8,10.8,0,0,0,2.4.6,9.1,9.1,0,0,0,1.5.2,10,10,0,0,0,1.5-.2,10.8,10.8,0,0,0,2.4-.6,13.6,13.6,0,0,0,4.6-2,15.9,15.9,0,0,0,3.3-5.4C23.8,7.9,22.8,5.2,20.3,3.9ZM8.2,14.5a2.2,2.2,0,0,1-2.4-2.3,2.2,2.2,0,0,1,2.4-2.3,2.3,2.3,0,0,1,0,4.6Zm7.6,0a2.2,2.2,0,0,1-2.4-2.3,2.2,2.2,0,0,1,2.4-2.3,2.3,2.3,0,0,1,0,4.6Z" />
  </svg>
);