/**
 * @file This component fetches and displays a feed of the latest cryptocurrency news.
 * It subscribes to its own data service to handle connection states (polling, suspended, disconnected)
 * and shows appropriate UI feedback.
 */

import React, { useState, useEffect } from 'react';
import { fetchLatestNews, subscribeToNewsConnectionStatus, NewsConnectionState } from '../services/newsService';
import type { NewsArticle } from '../types';
import { NewsIcon } from './icons/NewsIcon';

/**
 * Converts a Unix timestamp to a human-readable "time ago" string.
 * @param {number} timestamp - The Unix timestamp in seconds.
 * @returns {string} A relative time string (e.g., "5m ago").
 */
const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - (timestamp * 1000)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

/**
 * A component that displays a list of the latest crypto news articles.
 * It manages its own loading, error, and connection states.
 * @returns {JSX.Element} The rendered news feed panel.
 */
export const NewsFeed: React.FC = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState<NewsConnectionState>({ status: 'polling', trippedUntil: 0 });
    const [countdown, setCountdown] = useState(0);

    // Subscribe to connection status changes on mount.
    useEffect(() => {
        const unsubscribe = subscribeToNewsConnectionStatus(setConnectionState);
        return () => unsubscribe();
    }, []);

    // Effect to manage the countdown timer when the connection is suspended.
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;
    
        if (connectionState.status === 'suspended' && connectionState.trippedUntil > Date.now()) {
          const updateCountdown = () => {
            const timeLeft = Math.ceil((connectionState.trippedUntil - Date.now()) / 1000);
            setCountdown(timeLeft > 0 ? timeLeft : 0);
            if (timeLeft <= 0 && intervalId) {
              clearInterval(intervalId);
            }
          };
          updateCountdown();
          intervalId = setInterval(updateCountdown, 1000);
        } else {
          setCountdown(0);
        }
    
        return () => {
          if (intervalId) clearInterval(intervalId);
        };
      }, [connectionState]);

    // Effect to load news data or reload when the connection status changes.
    useEffect(() => {
        const loadNews = async () => {
            // Don't fetch if connection is suspended
            if (connectionState.status === 'suspended') return;
            
            setIsLoading(true);
            setError(null);
            try {
                const latestNews = await fetchLatestNews();
                setNews(latestNews.slice(0, 10)); // Show top 10 articles
                setError(null); // Clear previous errors on success
            } catch (err: any) {
                setError(err.message || 'Could not load news.');
            } finally {
                setIsLoading(false);
            }
        };

        loadNews();
        
        // Reload news automatically when connection recovers from suspension
        if(connectionState.status === 'polling') {
            const timer = setTimeout(loadNews, 1000); // slight delay after recovery
            return () => clearTimeout(timer);
        }

    }, [connectionState.status]);

    /**
     * Renders the main content of the feed based on the current state.
     * @returns {JSX.Element} The content to be displayed (loader, error, or news list).
     */
    const renderContent = () => {
        if (connectionState.status === 'suspended') {
            return (
              <div className="text-orange-500 text-center p-4 animate-pulse">
                {countdown > 0 ? `News feed paused. Retrying in ${countdown}s...` : 'Attempting to reconnect...'}
              </div>
            );
          }
        if (isLoading) {
            return <div className="text-brand-text-secondary text-center p-4">Loading news...</div>;
        }
        if (error && connectionState.status === 'disconnected') {
            return <div className="text-red-500 text-center p-4">Failed to load news. Retrying in background.</div>;
        }
        if (news.length === 0) {
            return <div className="text-brand-text-secondary text-center p-4">No news available.</div>;
        }
        return (
            <div className="space-y-3">
                {news.map(article => (
                    <a 
                        key={article.id} 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 bg-brand-background hover:bg-brand-border/50 rounded-lg transition-colors"
                    >
                        <h4 className="font-semibold text-sm text-brand-text-primary mb-1">{article.title}</h4>
                        <div className="flex items-center justify-between text-xs text-brand-text-secondary">
                            <span>{article.source}</span>
                            <span>{timeAgo(article.published_on)}</span>
                        </div>
                    </a>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 w-full h-full flex flex-col shadow-lg">
            <div className="flex items-center gap-2 mb-4">
                <NewsIcon className="w-5 h-5 text-brand-text-primary" />
                <h3 className="text-lg font-bold text-brand-text-primary">Latest News</h3>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                {renderContent()}
            </div>
        </div>
    );
};