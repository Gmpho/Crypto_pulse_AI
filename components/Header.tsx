/**
 * @file This file defines the main Header component for the application.
 * It includes the application title, a theme toggle button, a "Connect Wallet" button,
 * and a menu button for mobile navigation.
 */

import React from 'react';
import { BtcIcon } from './icons/BtcIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { MenuIcon } from './icons/MenuIcon';

/**
 * Defines the possible theme states.
 */
type Theme = 'light' | 'dark';

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** The current theme of the application. */
  theme: Theme;
  /** Callback function to toggle the theme. */
  onThemeToggle: () => void;
  /** Callback function to open the wallet connection modal. */
  onWalletClick: () => void;
  /** Callback function to open the sidebar on mobile devices. */
  onMenuClick: () => void;
}

/**
 * The main header component for the CryptoPulse AI application.
 * It is a sticky header that provides consistent navigation and actions.
 * @param {HeaderProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered header element.
 */
export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle, onWalletClick, onMenuClick }) => {
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center border-b border-brand-border sticky top-0 bg-brand-background/80 backdrop-blur-sm z-30 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-1 rounded-full text-brand-text-secondary hover:bg-brand-surface lg:hidden" aria-label="Open sidebar">
            <MenuIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
            <BtcIcon className="w-8 h-8" />
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary hidden sm:block">CryptoPulse AI</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-full text-brand-text-secondary hover:bg-brand-surface transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
        <button
          onClick={onWalletClick}
          className="bg-brand-blue hover:bg-brand-blue-light text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    </header>
  );
};