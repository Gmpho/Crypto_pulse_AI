/**
 * @file This service handles all interactions with the CoinGecko API.
 * It is responsible for fetching cryptocurrency market data and historical chart data.
 *
 * To ensure reliability and bypass potential CORS issues, this service implements
 * a robust fetching mechanism with several key features:
 * 1.  **Proxy Rotation:** It cycles through a list of public CORS proxies to make requests.
 * 2.  **Proxy Blacklisting:** Proxies that consistently fail are temporarily put on a cooldown.
 * 3.  **Circuit Breaker:** If multiple consecutive requests fail across all proxies,
 *     the service enters a "suspended" state for a set duration to avoid spamming the APIs.
 * 4.  **Polling:** It provides a subscription-based polling mechanism for real-time price updates.
 * 5.  **Mock Fallback:** If all data sources fail, it returns mock data to ensure the UI remains functional.
 */

import type { CoinData, PriceDataPoint, Timeframe } from '../types';
import { MOCK_PRICE_HISTORY } from '../constants';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

/** A list of CORS proxy services to use for API requests. */
const PROXIES = [
  { name: 'AllOrigins', buildUrl: (target: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}` },
  { name: 'ThingProxy', buildUrl: (target: string) => `https://thingproxy.freeboard.io/fetch/${target}` },
  { name: 'CORSProxy.io', buildUrl: (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}` },
];
let lastWorkingProxyIndex = 0;

/** A map to temporarily blacklist failing proxies. */
const proxyBlacklist = new Map<string, number>();
const PROXY_BLACKLIST_DURATION_MS = 60 * 1000; // 1 minute

// --- Circuit Breaker State ---
const FAILURE_THRESHOLD = 3;
const CIRCUIT_TRIP_DURATION_MS = 2 * 60 * 1000; // 2 minutes
let failureCount = 0;
let circuitTrippedUntil = 0;

/** Mock data used as a fallback when the API is unreachable. */
const MOCK_COIN_DATA: CoinData[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501400',
    current_price: 68123.45,
    price_change_percentage_24h: 1.25,
  },
];

// --- Simplified Connection Status & Polling Logic ---
export type ConnectionStatus = 'polling' | 'disconnected' | 'suspended';
interface ConnectionState {
  status: ConnectionStatus;
  trippedUntil: number;
}
type ConnectionListener = (state: ConnectionState) => void;
type PriceUpdateListener = (newPrice: number) => void;

const connectionListeners: ConnectionListener[] = [];
const priceUpdateListeners = new Map<string, PriceUpdateListener[]>();
let pollingInterval: ReturnType<typeof setInterval> | null = null;
let currentStatus: ConnectionStatus = 'polling';

/** Notifies all connection status listeners of a state change. */
const notifyConnectionListeners = (status: ConnectionStatus) => {
  if (currentStatus !== status || status === 'suspended') {
    currentStatus = status;
    const state: ConnectionState = { status, trippedUntil: circuitTrippedUntil };
    connectionListeners.forEach(listener => listener(state));
  }
};

/** Notifies price update listeners for a specific coin. */
const notifyPriceUpdateListeners = (coinId: string, newPrice: number) => {
    if (priceUpdateListeners.has(coinId)) {
        priceUpdateListeners.get(coinId)!.forEach(listener => listener(newPrice));
    }
};

/**
 * A robust fetch implementation that incorporates proxy rotation, retries, and a circuit breaker.
 * @param {string} endpoint - The CoinGecko API endpoint to fetch (e.g., '/coins/markets').
 * @param {number} [retriesPerProxy=2] - The number of retry attempts for each proxy.
 * @throws {Error} If the circuit breaker is open or all proxies fail.
 * @returns {Promise<any>} A promise that resolves with the JSON data from the API.
 */
const fetchWithRetry = async (
  endpoint: string,
  retriesPerProxy = 2
): Promise<any> => {
    if (Date.now() < circuitTrippedUntil) {
        const timeLeft = Math.ceil((circuitTrippedUntil - Date.now()) / 1000);
        throw new Error(`Circuit breaker is open. Retrying in ${timeLeft}s.`);
    }

  const targetUrl = `${COINGECKO_API_BASE_URL}${endpoint}`;
  let lastError: Error | null = null;

  try {
    const availableProxies = PROXIES
        .map((p, i) => ({...p, originalIndex: i}))
        .sort((a, b) => a.originalIndex === lastWorkingProxyIndex ? -1 : 1) // Prioritize last working proxy
        .filter(proxy => {
            const blacklistedUntil = proxyBlacklist.get(proxy.name);
            if (blacklistedUntil && Date.now() < blacklistedUntil) {
                console.log(`[CoinGecko] Proxy ${proxy.name} is on cooldown. Skipping.`);
                return false;
            }
            return true;
        });

    if (availableProxies.length === 0) {
        throw new Error("All proxies are on cooldown. Please wait a moment before retrying.");
    }

    for (const proxy of availableProxies) {
        const proxyUrl = proxy.buildUrl(targetUrl);
        let proxyFailedCompletely = true;
        
        for (let j = 0; j < retriesPerProxy; j++) {
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
            lastError = new Error(`Proxy ${proxy.name} returned status: ${response.status}`);
            if ([401, 403, 404, 429].includes(response.status)) {
                console.warn(`[CoinGecko] Proxy ${proxy.name} failed with non-retriable status ${response.status}. Trying next proxy.`);
                break; 
            }
            throw lastError;
            }
            
            let data = await response.json();
            if (data && typeof data === 'object' && 'contents' in data) {
                try { data = JSON.parse(data.contents); } catch (e) { data = data.contents; }
            }
            if (data && data.status && data.status.error_message) {
                lastError = new Error(`CoinGecko API Error: ${data.status.error_message}`);
                console.warn(`API error from proxy ${proxy.name}: ${data.status.error_message}`);
                if (data.status.error_code === 429) { break; }
                throw lastError;
            }
            
            lastWorkingProxyIndex = proxy.originalIndex;
            proxyBlacklist.delete(proxy.name);
            proxyFailedCompletely = false;
            failureCount = 0;
            circuitTrippedUntil = 0;
            return data;

        } catch (error: any) {
            lastError = error;
            console.warn(`[CoinGecko] Attempt ${j + 1}/${retriesPerProxy} with proxy ${proxy.name} failed:`, error.message);
            if (j < retriesPerProxy - 1) await new Promise(resolve => setTimeout(resolve, 500 * (j + 1)));
        }
        }

        if (proxyFailedCompletely) {
            console.warn(`[CoinGecko] All retries failed for proxy ${proxy.name}. Placing it on cooldown for ${PROXY_BLACKLIST_DURATION_MS / 1000}s.`);
            proxyBlacklist.set(proxy.name, Date.now() + PROXY_BLACKLIST_DURATION_MS);
        }
    }

    throw lastError || new Error("All data sources are currently unavailable.");
  } catch(error: any) {
      failureCount++;
      if (failureCount >= FAILURE_THRESHOLD) {
          circuitTrippedUntil = Date.now() + CIRCUIT_TRIP_DURATION_MS;
          failureCount = 0;
          console.error(`Circuit breaker tripped for ${CIRCUIT_TRIP_DURATION_MS / 1000}s due to repeated failures.`);
      }
      throw error;
  }
};

/** The core polling function that fetches price updates periodically. */
const pollForPriceUpdates = async () => {
    const coinIds = Array.from(priceUpdateListeners.keys());
    if (coinIds.length === 0) {
        stopPolling();
        return;
    }

    try {
        if (Date.now() < circuitTrippedUntil) {
            throw new Error('Polling attempt skipped: circuit breaker is open.');
        }
        const ids = coinIds.join(',');
        const endpoint = `/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false`;
        const data = await fetchWithRetry(endpoint);
        
        if (!Array.isArray(data)) { throw new Error("Invalid data format from polling request. Expected an array."); }
        
        data.forEach((coin: CoinData) => notifyPriceUpdateListeners(coin.id, coin.current_price));
        notifyConnectionListeners('polling');
    } catch (error: any) {
        console.error("Polling for price updates failed:", error.message);
        if (Date.now() < circuitTrippedUntil) {
            notifyConnectionListeners('suspended');
            stopPolling();
            console.log(`Polling suspended. Will attempt to restart in ${CIRCUIT_TRIP_DURATION_MS / 1000}s.`);
            setTimeout(startPolling, CIRCUIT_TRIP_DURATION_MS);
        } else {
            notifyConnectionListeners('disconnected');
        }
    }
};

/** Starts the polling interval if it's not already running. */
const startPolling = () => {
    if (pollingInterval) return;
    console.log("Starting price update polling...");
    pollForPriceUpdates();
    pollingInterval = setInterval(pollForPriceUpdates, 60000);
};

/** Stops the polling interval. */
const stopPolling = () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log("Stopped price update polling.");
    }
};

/**
 * Subscribes a listener function to connection status changes.
 * @param {ConnectionListener} listener - The callback function to execute on status change.
 * @returns {() => void} A function to unsubscribe the listener.
 */
export const subscribeToConnectionStatus = (listener: ConnectionListener): (() => void) => {
  connectionListeners.push(listener);
  listener({ status: currentStatus, trippedUntil: circuitTrippedUntil });
  return () => {
    const index = connectionListeners.indexOf(listener);
    if (index > -1) connectionListeners.splice(index, 1);
  };
};

/**
 * Subscribes a listener function to price updates for a specific coin.
 * @param {string} coinId - The ID of the coin to subscribe to (e.g., 'bitcoin').
 * @param {PriceUpdateListener} listener - The callback function to execute with the new price.
 * @returns {() => void} A function to unsubscribe the listener.
 */
export const subscribeToPriceUpdates = (coinId: string, listener: PriceUpdateListener): (() => void) => {
    if (!priceUpdateListeners.has(coinId)) {
        priceUpdateListeners.set(coinId, []);
    }
    priceUpdateListeners.get(coinId)!.push(listener);

    startPolling();

    return () => {
        if (priceUpdateListeners.has(coinId)) {
            const listeners = priceUpdateListeners.get(coinId)!.filter(l => l !== listener);
            if (listeners.length > 0) {
                priceUpdateListeners.set(coinId, listeners);
            } else {
                priceUpdateListeners.delete(coinId);
            }
        }
        if (priceUpdateListeners.size === 0) {
            stopPolling();
        }
    };
};

/**
 * Manually triggers a reconnection attempt by resetting the circuit breaker and restarting the poll.
 */
export const manualReconnect = () => {
    console.log("Manual refresh triggered. Forcing price update poll.");
    if (priceUpdateListeners.size > 0) {
      circuitTrippedUntil = 0;
      failureCount = 0;
      stopPolling();
      startPolling();
    }
};

/**
 * Stops all active polling connections.
 */
export const stopAllConnections = () => {
    stopPolling();
};

/**
 * Fetches the latest market data for a list of cryptocurrencies.
 * @param {string[]} coinIds - An array of coin IDs to fetch data for.
 * @returns {Promise<CoinData[]>} A promise that resolves to an array of coin data, or mock data on failure.
 */
export const fetchCoinsData = async (coinIds: string[]): Promise<CoinData[]> => {
  try {
    const ids = coinIds.join(',');
    const endpoint = `/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false`;
    const data = await fetchWithRetry(endpoint);
    if (!Array.isArray(data)) {
        console.warn(`Expected array from fetchCoinsData, got ${typeof data}. Falling back to mock data.`);
        return MOCK_COIN_DATA;
    }
    return data;
  } catch (error: any) {
    console.warn(`Failed to fetch coin data after all retries. Reason: ${error.message}`);
    console.warn('Falling back to mock coin data.');
    if (Date.now() < circuitTrippedUntil) {
        notifyConnectionListeners('suspended');
    } else {
        notifyConnectionListeners('disconnected');
    }
    return MOCK_COIN_DATA;
  }
};

/**
 * Determines the correct API parameters based on the selected timeframe.
 * @param {Timeframe} timeframe - The desired timeframe ('1H', '1D', '1W', '1M').
 * @returns {{ days: number, interval?: string }} The parameters for the CoinGecko API call.
 */
const getTimeframeParams = (timeframe: Timeframe): { days: number, interval?: string } => {
    switch (timeframe) {
        case '1H': return { days: 1 };
        case '1D': return { days: 1 };
        case '1W': return { days: 7, interval: 'daily' };
        case '1M': return { days: 30, interval: 'daily' };
        default: return { days: 1 };
    }
};

/**
 * Fetches historical price data for a specific coin and timeframe.
 * @param {string} coinId - The ID of the coin.
 * @param {Timeframe} timeframe - The desired timeframe for the chart.
 * @returns {Promise<PriceDataPoint[]>} A promise that resolves to an array of formatted data points for the chart, or mock data on failure.
 */
export const fetchCoinHistory = async (coinId: string, timeframe: Timeframe): Promise<PriceDataPoint[]> => {
  try {
    const { days, interval } = getTimeframeParams(timeframe);
    const intervalParam = interval ? `&interval=${interval}` : '';
    const endpoint = `/coins/${coinId}/market_chart?vs_currency=usd&days=${days}${intervalParam}`;
    const data = await fetchWithRetry(endpoint);

    if (!data || !Array.isArray(data.prices)) {
      console.error('Invalid chart data structure received:', data);
      throw new Error('Unexpected data format for chart history.');
    }
    
    const priceMap = new Map<string, number>();
    data.prices.forEach(([timestamp, price]: [number, number]) => {
        const date = new Date(timestamp);
        let key = '';
        if (timeframe === '1H' || timeframe === '1D') {
            key = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            key = date.toLocaleString([], { month: 'short', day: 'numeric' });
        }
        priceMap.set(key, price);
    });

    const formattedData: PriceDataPoint[] = Array.from(priceMap.entries()).map(([name, price]) => ({ name, price }));
    
    if (data.prices.length > 0) {
        const lastPoint = data.prices[data.prices.length - 1];
        if (lastPoint) {
          const currentPrice = lastPoint[1];
          if (formattedData.length === 0 || formattedData[formattedData.length-1].name !== 'Now') {
             formattedData.push({ name: 'Now', price: currentPrice });
          }
        }
    }

    return formattedData;
  } catch (error: any) {
    console.warn(`Failed to fetch coin history. Reason: ${error.message}`);
    console.warn('Falling back to mock chart data.');
    return MOCK_PRICE_HISTORY[timeframe];
  }
};