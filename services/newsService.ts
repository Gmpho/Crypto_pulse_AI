/**
 * @file This service is responsible for fetching the latest cryptocurrency news
 * from the CryptoCompare API. It shares a similar robust fetching architecture
 * with the `coingeckoService`, including proxy rotation, a circuit breaker,
 * and mock data fallbacks to ensure high availability.
 */

import type { NewsArticle } from '../types';

const NEWS_API_BASE_URL = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

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

// --- Connection Status & Subscription Logic ---
export type NewsConnectionStatus = 'polling' | 'disconnected' | 'suspended';
export interface NewsConnectionState {
  status: NewsConnectionStatus;
  trippedUntil: number;
}
type ConnectionListener = (state: NewsConnectionState) => void;

const connectionListeners: ConnectionListener[] = [];
let currentStatus: NewsConnectionStatus = 'polling';

/** Notifies all subscribed listeners about a change in the connection status. */
const notifyConnectionListeners = (status: NewsConnectionStatus) => {
  if (currentStatus !== status || status === 'suspended') {
    currentStatus = status;
    const state: NewsConnectionState = { status, trippedUntil: circuitTrippedUntil };
    connectionListeners.forEach(listener => listener(state));
  }
};

/**
 * Subscribes a listener function to news service connection status changes.
 * @param {ConnectionListener} listener - The callback function to execute on status change.
 * @returns {() => void} A function to unsubscribe the listener.
 */
export const subscribeToNewsConnectionStatus = (listener: ConnectionListener): (() => void) => {
  connectionListeners.push(listener);
  // Immediately notify with current state upon subscription
  listener({ status: currentStatus, trippedUntil: circuitTrippedUntil });
  return () => {
    const index = connectionListeners.indexOf(listener);
    if (index > -1) connectionListeners.splice(index, 1);
  };
};

/** Mock news articles used as a fallback when the API is unreachable. */
const MOCK_NEWS_ARTICLES: NewsArticle[] = [
    {
        id: 'mock1',
        title: 'Bitcoin Surges Past Key Resistance as Market Sentiment Turns Bullish',
        url: '#',
        source: 'Mock Crypto News',
        published_on: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        body: 'Bitcoin has seen a significant price increase over the last 24 hours, breaking a key resistance level. Analysts attribute this to increased institutional investment and positive regulatory news.'
    },
    {
        id: 'mock2',
        title: 'Ethereum "Dencun" Upgrade Successfully Deployed, Gas Fees Drop',
        url: '#',
        source: 'Mock Tech Block',
        published_on: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        body: 'The latest Ethereum network upgrade has been successfully implemented on the mainnet. Users are reporting a significant reduction in transaction fees on Layer 2 solutions.'
    },
];

/**
 * A robust fetch implementation that incorporates proxy rotation, retries, and a circuit breaker.
 * @param {string} url - The full URL to fetch.
 * @param {number} [retriesPerProxy=2] - The number of retry attempts for each proxy.
 * @throws {Error} If the circuit breaker is open or all proxies fail.
 * @returns {Promise<any>} A promise that resolves with the JSON data from the API.
 */
const fetchWithRetry = async (
  url: string,
  retriesPerProxy = 2
): Promise<any> => {
  if (Date.now() < circuitTrippedUntil) {
    const timeLeft = Math.ceil((circuitTrippedUntil - Date.now()) / 1000);
    notifyConnectionListeners('suspended');
    throw new Error(`Circuit breaker is open. Retrying in ${timeLeft}s.`);
  }

  let lastError: Error | null = null;
  
  try {
    const availableProxies = PROXIES
        .map((p, i) => ({ ...p, originalIndex: i }))
        .sort((a, b) => a.originalIndex === lastWorkingProxyIndex ? -1 : 1)
        .filter(proxy => {
          const blacklistedUntil = proxyBlacklist.get(proxy.name);
          if (blacklistedUntil && Date.now() < blacklistedUntil) {
            console.log(`[News] Proxy ${proxy.name} is on cooldown. Skipping.`);
            return false;
          }
          return true;
        });

    if (availableProxies.length === 0) {
        throw new Error("All proxies are on cooldown. Please wait a moment before retrying.");
    }

    for (const proxy of availableProxies) {
        const proxyUrl = proxy.buildUrl(url);
        let proxyFailedCompletely = true;

        console.log(`Attempting to fetch news via proxy: ${proxy.name}`);

        for (let j = 0; j < retriesPerProxy; j++) {
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
              lastError = new Error(`Proxy ${proxy.name} returned status: ${response.status}`);
              if ([401, 403, 404, 429].includes(response.status)) {
                console.warn(`[News] Proxy ${proxy.name} failed with non-retriable status ${response.status}. Trying next proxy.`);
                break;
              }
              throw lastError;
            }
            
            let parsedData = await response.json();
            if (parsedData && typeof parsedData === 'object' && 'contents' in parsedData) {
                try { parsedData = JSON.parse(parsedData.contents); } catch (e) { parsedData = parsedData.contents; }
            }
            
            if (parsedData.Type === 99 || parsedData.Response === "Error" || (parsedData.Message && parsedData.Message.includes('rate limit'))) {
              lastError = new Error(`CryptoCompare API Error (via ${proxy.name}): ${parsedData.Message || 'Rate limit or error response'}`);
              console.warn(`Rate limit detected in API response body from proxy ${proxy.name}. Trying next proxy.`);
              break;
            }
            
            lastWorkingProxyIndex = proxy.originalIndex;
            proxyBlacklist.delete(proxy.name);
            proxyFailedCompletely = false;
            failureCount = 0;
            circuitTrippedUntil = 0;
            notifyConnectionListeners('polling');
            console.log(`Successfully fetched news using proxy: ${proxy.name}`);
            return parsedData;

        } catch (error: any) {
            lastError = error;
            console.warn(`[News] Attempt ${j + 1}/${retriesPerProxy} with proxy ${proxy.name} failed:`, error.message);
            if (j < retriesPerProxy - 1) await new Promise(resolve => setTimeout(resolve, 500 * (j + 1)));
        }
        }

        if (proxyFailedCompletely) {
            console.error(`All retries failed for proxy: ${proxy.name}. Placing it on cooldown for ${PROXY_BLACKLIST_DURATION_MS / 1000}s.`);
            proxyBlacklist.set(proxy.name, Date.now() + PROXY_BLACKLIST_DURATION_MS);
        }
    }

    throw lastError || new Error("All proxies failed for URL: " + url);
  } catch(error: any) {
      failureCount++;
      if (failureCount >= FAILURE_THRESHOLD) {
          circuitTrippedUntil = Date.now() + CIRCUIT_TRIP_DURATION_MS;
          failureCount = 0;
          notifyConnectionListeners('suspended');
          console.error(`[News] Circuit breaker tripped for ${CIRCUIT_TRIP_DURATION_MS / 1000}s due to repeated failures.`);
      } else {
          notifyConnectionListeners('disconnected');
      }
      throw error;
  }
};

/**
 * Fetches the latest news articles from the CryptoCompare API.
 * @returns {Promise<NewsArticle[]>} A promise that resolves to an array of news articles, or mock data on failure.
 */
export const fetchLatestNews = async (): Promise<NewsArticle[]> => {
  try {
    const data = await fetchWithRetry(NEWS_API_BASE_URL);
    if (data.Type !== 100 || !Array.isArray(data.Data)) {
      console.error("News API did not return expected data format. Response:", data);
      throw new Error('Received an unexpected data format from the news API.');
    }
    return data.Data.map((article: any): NewsArticle => ({
        id: article.id,
        title: article.title,
        url: article.url,
        source: article.source,
        published_on: article.published_on,
        body: article.body,
    })).slice(0, 15);
  } catch (error: any) {
    console.warn(`Failed to fetch latest news after all retries. Reason: ${error.message}`);
    console.warn("Falling back to mock news data due to API failure.");
    return MOCK_NEWS_ARTICLES;
  }
};