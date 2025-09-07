/**
 * @file Renders the Binance icon.
 * This is used in the WalletModal to represent the Binance connection option.
 */
import React from 'react';

/**
 * A functional component that renders the Binance SVG icon.
 * @param {object} props - The component's properties.
 * @param {string} [props.className] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const BinanceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="#F3BA2F"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.624 13.92L12 18.545L7.376 13.92l-1.42 1.419L12 21.382l6.045-6.043l-1.421-1.419z" />
    <path d="M12 2.618L5.955 8.662l1.42 1.419L12 5.455l4.624 4.626l1.42-1.419L12 2.618z" />
    <path d="M21.382 12l-6.043 6.045l-1.42-1.42L18.545 12l-4.626-4.624l1.42-1.42L21.382 12z" />
    <path d="M2.618 12l6.045-6.045l1.42 1.42L5.455 12l4.626 4.624l-1.42 1.42L2.618 12z" />
    <path d="M12 10.586L10.586 12L12 13.414L13.414 12L12 10.586z" />
  </svg>
);