/**
 * @file This file contains constant values and mock data used throughout the application.
 * These are primarily used for development, testing, and as fallback data when API calls fail.
 */

import type { PriceHistory } from './types';

/**
 * Mock price history data for the cryptocurrency chart.
 * This is used as a fallback when the CoinGecko API fails to provide chart data,
 * ensuring the chart component still renders something meaningful.
 * @constant
 * @type {PriceHistory}
 */
export const MOCK_PRICE_HISTORY: PriceHistory = {
  '1H': [
    { name: '-60m', price: 27280 },
    { name: '-50m', price: 27295 },
    { name: '-40m', price: 27305 },
    { name: '-30m', price: 27290 },
    { name: '-20m', price: 27310 },
    { name: '-10m', price: 27325 },
    { name: 'Now', price: 27340.12 },
  ],
  '1D': [
    { name: '-24h', price: 27100 },
    { name: '-18h', price: 27150 },
    { name: '-12h', price: 27200 },
    { name: '-6h', price: 27280 },
    { name: 'Now', price: 27340.12 },
  ],
  '1W': [
    { name: '7d', price: 26800 },
    { name: '6d', price: 26950 },
    { name: '5d', price: 27050 },
    { name: '4d', price: 27000 },
    { name: '3d', price: 27150 },
    { name: '2d', price: 27250 },
    { name: '1d', price: 27100 },
    { name: 'Now', price: 27340.12 },
  ],
  '1M': [
    { name: '4w', price: 25500 },
    { name: '3w', price: 26500 },
    { name: '2w', price: 26200 },
    { name: '1w', price: 26800 },
    { name: 'Now', price: 27340.12 },
  ],
};