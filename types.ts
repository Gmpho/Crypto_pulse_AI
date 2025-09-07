/**
 * @file This file contains all the TypeScript type definitions and interfaces
 * used throughout the CryptoPulse AI application.
 */

/**
 * Represents a single data point for a price chart.
 */
export interface PriceDataPoint {
  /** The label for the x-axis (e.g., a timestamp or relative time). */
  name: string;
  /** The price value for the y-axis. */
  price: number;
}

/**
 * Defines the available timeframes for historical price charts.
 */
export type Timeframe = '1H' | '1D' | '1W' | '1M';

/**
 * A dictionary mapping each timeframe to an array of price data points.
 */
export type PriceHistory = {
  [key in Timeframe]: PriceDataPoint[];
};

/**
 * Represents the core data for a cryptocurrency, fetched from an external API like CoinGecko.
 */
export interface CoinData {
  /** A unique identifier for the coin (e.g., 'bitcoin'). */
  id: string;
  /** The coin's ticker symbol (e.g., 'btc'). */
  symbol: string;
  /** The full name of the coin (e.g., 'Bitcoin'). */
  name: string;
  /** A URL to an image/logo for the coin. */
  image: string;
  /** The current market price in USD. */
  current_price: number;
  /** The percentage change in price over the last 24 hours. */
  price_change_percentage_24h: number;
}

/**
 * Represents a source chunk provided by the Gemini API's grounding feature.
 */
export interface GroundingChunk {
  /** Contains web source information. */
  web: {
    /** The URL of the web source. */
    uri: string;
    /** The title of the web page. */
    title: string;
  };
}

/**
 * Represents a single message in a chat session.
 */
export interface Message {
  /** A unique identifier for the message. */
  id: string;
  /** The text content of the message. */
  text: string;
  /** The sender of the message. */
  sender: 'user' | 'ai';
  /** An optional array of web sources for AI messages grounded with web search. */
  sources?: GroundingChunk[];
}

/**
 * Represents a complete chat session, including its metadata and messages.
 */
export interface Session {
  /** A unique identifier for the session. */
  id: string;
  /** The title of the chat session, often generated from the first user message. */
  title: string;
  /** The timestamp when the session was created. */
  timestamp: number;
  /** An array of all messages within the session. */
  messages: Message[];
}

/**
 * Defines the supported wallet or platform types for connection.
 */
export type WalletType = 'metamask' | 'binance' | 'telegram' | 'discord';

/**
 * A dictionary mapping each wallet type to a connected account identifier (e.g., an address) or null if not connected.
 */
export type ConnectedWallets = {
  [key in WalletType]: string | null;
};

/**
 * Represents a user-defined price alert for a specific cryptocurrency.
 */
export interface Alert {
  /** A unique identifier for the alert. */
  id:string;
  /** The ID of the coin this alert is for (e.g., 'bitcoin'). */
  coinId: string;
  /** The name of the coin for display purposes. */
  coinName: string;
  /** The target price that will trigger the alert. */
  targetPrice: number;
  /** The timestamp when the alert was created. */
  createdAt: number;
}

/**
 * Represents a UI notification (toast message).
 */
export interface Notification {
  /** A unique identifier for the notification. */
  id: string;
  /** The message content to display. */
  message: string;
  /** The type of notification, which affects its styling. */
  type: 'success' | 'info' | 'error';
}

/**
 * Represents a single news article fetched from an external API.
 */
export interface NewsArticle {
  /** A unique identifier for the article. */
  id: string;
  /** The headline of the news article. */
  title: string;
  /** The URL to the full article. */
  url: string;
  /** The name of the news source (e.g., 'Cointelegraph'). */
  source: string;
  /** The Unix timestamp of when the article was published. */
  published_on: number;
  /** The main body or summary of the article. */
  body: string;
}

/**
 * Defines the types of widgets that can be displayed on a customizable dashboard.
 * @deprecated This type is part of an unused customizable dashboard feature.
 */
export type WidgetType = 'cryptoCard' | 'newsFeed' | 'chatHistory' | 'aiAnalysis' | 'chat';