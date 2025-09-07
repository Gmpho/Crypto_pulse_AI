/**
 * @file Renders the Telegram icon.
 * This is used in the WalletModal to represent the Telegram connection option.
 */
import React from 'react';

/**
 * A functional component that renders the Telegram SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const TelegramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="#24A1DE"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.78 18.65l.288-3.125-3.033-2.917 15.344-6.25L9.78 18.65z" />
    <path d="M9.78 18.65l2.292-2.125-2.58-2.417-2.291 2.917a.5.5 0 0 0 .788.708l2.079-2.416 1.712 1.583z" />
  </svg>
);