/**
 * @file Renders the MetaMask wallet icon.
 * This is used in the WalletModal to represent the MetaMask connection option.
 */
import React from 'react';

/**
 * A functional component that renders the MetaMask SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const MetaMaskIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="#E8831D"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22.5 5.5L12 0L1.5 5.5L5.5 8L4 12.5L7 14L8.5 11.5L12 13.5L15.5 11.5L17 14L20 12.5L18.5 8L22.5 5.5Z M12 11L8 8.5L12 6L16 8.5L12 11Z M17.5 11.5L16.5 10L12 12L13 14L17.5 11.5Z M6.5 10L5.5 11.5L11 14L12 12L7.5 10L6.5 10Z M12 21.5L9.5 16.5L12 15L14.5 16.5L12 21.5Z" />
  </svg>
);