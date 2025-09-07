/**
 * @file This component defines a modal dialog for setting and viewing price alerts
 * for a specific cryptocurrency.
 */

import React, { useState } from 'react';
import type { Alert } from '../types';
import { TrashIcon } from './icons/TrashIcon';

/**
 * Props for the AlertModal component.
 */
interface AlertModalProps {
  /** Whether the modal is currently visible. */
  isOpen: boolean;
  /** Callback function to close the modal. */
  onClose: () => void;
  /** The name of the coin for which to set alerts (e.g., "Bitcoin"). */
  coinName: string;
  /** The unique ID of the coin (e.g., "bitcoin"). */
  coinId: string;
  /** The current price of the coin, used for user reference. */
  currentPrice: number;
  /** An array of all existing alerts. */
  alerts: Alert[];
  /** Callback function to add a new alert. */
  onAddAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  /** Callback function to remove an existing alert. */
  onRemoveAlert: (alertId: string) => void;
}

/**
 * A modal that allows users to create and manage price alerts.
 * It displays active alerts for the selected coin and provides a form to add new ones.
 * @param {AlertModalProps} props - The properties for the component.
 * @returns {JSX.Element | null} The rendered modal or null if it's not open.
 */
export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  coinName,
  coinId,
  currentPrice,
  alerts,
  onAddAlert,
  onRemoveAlert,
}) => {
  const [targetPrice, setTargetPrice] = useState('');

  if (!isOpen) return null;

  /**
   * Handles the form submission for creating a new alert.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (!isNaN(price) && price > 0) {
      onAddAlert({ coinId, coinName, targetPrice: price });
      setTargetPrice('');
    }
  };
  
  // Filter alerts to show only those for the currently selected coin.
  const coinAlerts = alerts.filter(a => a.coinId === coinId);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-sm shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-brand-text-primary">Price Alerts for {coinName}</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary text-2xl">&times;</button>
        </div>
        
        <p className="text-sm text-brand-text-secondary mb-4">Current Price: ${currentPrice.toLocaleString()}</p>

        <form onSubmit={handleAddAlert} className="flex gap-2 mb-6">
          <input
            type="number"
            step="any"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Set target price"
            className="flex-1 bg-brand-background border border-brand-border rounded-lg py-2 px-3 text-brand-text-primary placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-blue"
            aria-label="Target price"
          />
          <button type="submit" className="bg-brand-blue hover:bg-brand-blue-light text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Set Alert
          </button>
        </form>

        <h3 className="text-lg font-semibold text-brand-text-primary mb-2">Active Alerts</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {coinAlerts.length > 0 ? (
                coinAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between bg-brand-background p-3 rounded-lg">
                        <p className="text-brand-text-primary">Notify at ${alert.targetPrice.toLocaleString()}</p>
                        <button onClick={() => onRemoveAlert(alert.id)} className="p-1 text-brand-text-secondary hover:text-red-400">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-brand-text-secondary text-sm">No active alerts for {coinName}.</p>
            )}
        </div>
      </div>
    </div>
  );
};