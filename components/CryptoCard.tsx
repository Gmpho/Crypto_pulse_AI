/**
 * @file This component displays a detailed card for a single cryptocurrency.
 * It includes the current price, 24h change, a historical price chart,
 * timeframe selection, and an option to set price alerts. It also visualizes
 * the data connection status.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { Timeframe, PriceDataPoint, CoinData } from '../types';
import { fetchCoinHistory } from '../services/coingeckoService';
import type { ConnectionStatus } from '../services/coingeckoService';
import { Chart } from './Chart';
import { BellIcon } from './icons/BellIcon';
import { WifiIcon } from './icons/WifiIcon';
import { WifiOffIcon } from './icons/WifiOffIcon';
import { RefreshIcon } from './icons/RefreshIcon';

/**
 * Represents the state of the data connection from the service.
 */
interface ConnectionState {
  /** The current status of the connection. */
  status: ConnectionStatus;
  /** A timestamp until which the connection is suspended (if applicable). */
  trippedUntil: number;
}

/**
 * Props for the CryptoCard component.
 */
interface CryptoCardProps {
  /** The data for the cryptocurrency to display. */
  coinData: CoinData;
  /** Callback function to open the price alert modal. */
  onOpenAlertModal: (coinId: string, coinName: string, currentPrice: number) => void;
  /** The current state of the data connection. */
  connectionState: ConnectionState;
  /** Callback function to manually trigger a data reconnection attempt. */
  onManualReconnect: () => void;
}

/**
 * A sub-component that displays the current data connection status
 * (polling, disconnected, or suspended) with appropriate icons and text.
 * @param {object} props - The component properties.
 * @param {ConnectionState} props.state - The current connection state.
 * @param {() => void} props.onReconnect - Callback to trigger a manual reconnect.
 * @returns {JSX.Element} The rendered status indicator.
 */
const StatusIndicator: React.FC<{ state: ConnectionState; onReconnect: () => void }> = ({ state, onReconnect }) => {
    const { status, trippedUntil } = state;
    const [countdown, setCountdown] = useState(0);

    // Effect to manage the countdown timer when the connection is suspended.
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;

        if (status === 'suspended' && trippedUntil > Date.now()) {
            const updateCountdown = () => {
                const timeLeft = Math.ceil((trippedUntil - Date.now()) / 1000);
                if (timeLeft > 0) {
                    setCountdown(timeLeft);
                } else {
                    setCountdown(0);
                    if (intervalId) clearInterval(intervalId);
                }
            };
            
            updateCountdown(); // Initial call
            intervalId = setInterval(updateCountdown, 1000);
        } else {
            setCountdown(0);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [status, trippedUntil]);

    const statusInfo = {
        polling: { icon: WifiIcon, color: 'text-yellow-500', text: 'Connection active. Updates via polling.' },
        disconnected: { icon: WifiOffIcon, color: 'text-red-500', text: 'Connection failed. Displaying cached data.' },
        suspended: { icon: WifiOffIcon, color: 'text-orange-500', text: 'Connection suspended. Retrying...' },
    };

    const { icon: Icon, color, text } = statusInfo[status] || statusInfo.disconnected;

    return (
        <div className="group absolute top-4 right-4 flex items-center gap-2">
            {status === 'suspended' ? (
                <>
                    <span className="text-xs text-orange-500 animate-pulse font-semibold">
                       {countdown > 0 ? `Data paused. Retrying in ${countdown}s` : 'Retrying...'}
                    </span>
                    <Icon className={`w-5 h-5 transition-colors ${color}`} />
                </>
            ) : status === 'disconnected' ? (
                <>
                    <span className="text-xs text-red-500 animate-pulse font-semibold">Live data failed</span>
                    <button 
                        onClick={onReconnect} 
                        className="p-1.5 bg-brand-surface hover:bg-brand-border rounded-full text-brand-text-secondary hover:text-brand-blue transition-colors"
                        aria-label="Manual Reconnect"
                    >
                        <RefreshIcon className="w-4 h-4" />
                    </button>
                    <Icon className={`w-5 h-5 transition-colors ${color}`} />
                </>
            ) : (
                <div className="relative">
                     <Icon className={`w-5 h-5 transition-colors ${color}`} />
                     {/* Keep tooltip for polling status for less UI clutter */}
                     <div className="absolute top-full right-0 mt-2 w-max bg-brand-surface border border-brand-border text-brand-text-primary text-xs rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {text}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * The main component for displaying cryptocurrency data in a card format.
 * It manages its own state for chart data and timeframe selection.
 * @param {CryptoCardProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered cryptocurrency card.
 */
export const CryptoCard: React.FC<CryptoCardProps> = ({ coinData, onOpenAlertModal, connectionState, onManualReconnect }) => {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1H');
  const [chartData, setChartData] = useState<PriceDataPoint[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const [priceColorClass, setPriceColorClass] = useState('text-brand-text-primary');
  const prevPriceRef = useRef<number | undefined>(undefined);

  const timeframes: Timeframe[] = ['1H', '1D', '1W', '1M'];

  // Effect to flash the price green or red on change.
  useEffect(() => {
    if (prevPriceRef.current !== undefined && prevPriceRef.current !== coinData.current_price) {
      const direction = coinData.current_price > prevPriceRef.current ? 'up' : 'down';
      setPriceColorClass(direction === 'up' ? 'text-brand-green' : 'text-red-500');
      
      const timer = setTimeout(() => {
        setPriceColorClass('text-brand-text-primary');
      }, 700);
      
      return () => clearTimeout(timer);
    }
  }, [coinData.current_price]);
  
  // Effect to store the previous price for comparison.
  useEffect(() => {
    prevPriceRef.current = coinData.current_price;
  }, [coinData.current_price]);

  // Effect to load chart data when the active timeframe or coin changes.
  useEffect(() => {
    const loadChartData = async () => {
      setIsChartLoading(true);
      setChartError(null);
      try {
        const history = await fetchCoinHistory(coinData.id, activeTimeframe);
        setChartData(history);
      } catch (error: any) {
        setChartError(error.message || 'Could not load chart data.');
      } finally {
        setIsChartLoading(false);
      }
    };

    if (coinData?.id) {
        loadChartData();
    }
  }, [coinData.id, activeTimeframe, coinData.name]);
  
  const priceChange = coinData.price_change_percentage_24h;
  const priceChangeColor = priceChange >= 0 ? 'text-brand-green' : 'text-red-500';

  return (
    <div className="relative bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-brand-blue/50 flex flex-col">
      <StatusIndicator state={connectionState} onReconnect={onManualReconnect} />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={coinData.image} alt={coinData.name} className="w-10 h-10" />
          <div>
            <h3 className="text-2xl font-bold text-brand-text-primary">{coinData.symbol.toUpperCase()}</h3>
            <p className="text-brand-text-secondary">{coinData.name}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
            <p className={`text-2xl font-bold transition-colors duration-500 ${priceColorClass}`}>
                ${coinData.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </p>
            <p className={`font-semibold transition-colors duration-500 ${priceChangeColor}`}>
                {priceChange ? priceChange.toFixed(2) : '0.00'}%
            </p>
        </div>
      </div>
      
      <div className="w-full h-48 flex items-center justify-center flex-grow">
        {isChartLoading ? (
            <div className="text-brand-text-secondary">Loading Chart...</div>
        ) : chartError ? (
            <div className="text-red-500 text-sm text-center">{chartError}</div>
        ) : chartData.length > 0 ? (
            <Chart data={chartData} />
        ) : (
            <div className="text-brand-text-secondary">No chart data available.</div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 mt-4">
        <div className="flex items-center justify-center gap-2 bg-brand-background p-1 rounded-lg flex-grow">
            {timeframes.map((tf) => (
            <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`w-full text-center py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 ${
                activeTimeframe === tf
                    ? 'bg-brand-blue text-white'
                    : 'text-brand-text-secondary hover:bg-brand-border/50'
                }`}
            >
                {tf}
            </button>
            ))}
        </div>
        <button 
            onClick={() => onOpenAlertModal(coinData.id, coinData.name, coinData.current_price)}
            className="p-3 bg-brand-background hover:bg-brand-border/50 rounded-lg text-brand-text-secondary hover:text-brand-blue transition-colors"
            aria-label={`Set price alert for ${coinData.name}`}
        >
            <BellIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};