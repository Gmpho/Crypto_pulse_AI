/**
 * @file This component defines a modal dialog for connecting and disconnecting wallets or social accounts.
 * It displays a list of supported platforms and their connection status.
 */

import React, { useState } from 'react';
import { MetaMaskIcon } from './icons/MetaMaskIcon';
import { BinanceIcon } from './icons/BinanceIcon';
import { TelegramIcon } from './icons/TelegramIcon';
import { DiscordIcon } from './icons/DiscordIcon';
import type { ConnectedWallets, WalletType } from '../types';

/**
 * Props for the WalletModal component.
 */
interface WalletModalProps {
  /** Whether the modal is currently visible. */
  isOpen: boolean;
  /** Callback function to close the modal. */
  onClose: () => void;
  /** An object representing the connection status of all wallets. */
  connectedWallets: ConnectedWallets;
  /** Callback function to initiate a connection for a specific wallet type. */
  onConnect: (wallet: WalletType) => void;
  /** Callback function to disconnect a specific wallet type. */
  onDisconnect: (wallet: WalletType) => void;
}

/**
 * A dictionary mapping wallet types to their display name and icon component.
 * @constant
 */
const walletInfo: { [key in WalletType]: { name: string; icon: React.FC<{className?: string}> } } = {
  metamask: { name: 'MetaMask', icon: MetaMaskIcon },
  binance: { name: 'Binance', icon: BinanceIcon },
  telegram: { name: 'Telegram', icon: TelegramIcon },
  discord: { name: 'Discord', icon: DiscordIcon },
};

/**
 * A modal dialog for managing wallet and platform connections.
 * It simulates a connection delay for a better user experience.
 * @param {WalletModalProps} props - The properties for the component.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  connectedWallets,
  onConnect,
  onDisconnect,
}) => {
  const [connectingWallet, setConnectingWallet] = useState<WalletType | null>(null);

  if (!isOpen) return null;

  /**
   * Handles the connect button click, setting a loading state and simulating a delay.
   * @param {WalletType} wallet - The type of wallet to connect.
   */
  const handleConnectClick = (wallet: WalletType) => {
    setConnectingWallet(wallet);
    // Simulate network delay for connection
    setTimeout(() => {
      onConnect(wallet);
      setConnectingWallet(null);
    }, 1500);
  };

  /**
   * Renders a single row for a wallet/platform in the modal.
   * @param {WalletType} type - The type of wallet to render.
   * @returns {JSX.Element} A div element representing the wallet row.
   */
  const renderWallet = (type: WalletType) => {
    const { name, icon: Icon } = walletInfo[type];
    const connectedAccount = connectedWallets[type];
    const isConnecting = connectingWallet === type;

    /**
     * Truncates a long wallet address for better display.
     * @param {string} address - The address to truncate.
     * @returns {string} The truncated address.
     */
    const truncateAddress = (address: string) => {
        if (!address) return '';
        if (address.startsWith('0x') && address.length > 10) {
            return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        }
        return address;
    };

    return (
      <div key={type} className="flex items-center justify-between bg-brand-background p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8" />
          <div>
            <p className="font-bold text-brand-text-primary">{name}</p>
            {connectedAccount && (
              <p className="text-xs text-brand-green font-mono" title={connectedAccount}>{truncateAddress(connectedAccount)}</p>
            )}
          </div>
        </div>
        {connectedAccount ? (
          <button onClick={() => onDisconnect(type)} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 font-semibold text-sm py-1 px-3 rounded-md transition-colors">
            Disconnect
          </button>
        ) : (
          <button 
            onClick={() => handleConnectClick(type)}
            disabled={isConnecting}
            className="bg-brand-blue hover:bg-brand-blue-light text-white font-semibold text-sm py-1 px-3 rounded-md transition-colors w-24 text-center disabled:bg-brand-border disabled:cursor-wait"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-sm shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          {/* FIX: Corrected invalid 'hh2' tag to 'h2'. */}
          <h2 className="text-xl font-bold text-brand-text-primary">Connect Wallet</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary">&times;</button>
        </div>
        <div className="space-y-4">
          {(Object.keys(walletInfo) as WalletType[]).map(renderWallet)}
        </div>
      </div>
    </div>
  );
};