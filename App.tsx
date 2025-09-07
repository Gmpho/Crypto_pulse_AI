/**
 * @file This is the root component of the CryptoPulse AI application.
 * It orchestrates the entire UI, manages global state, and handles the core application logic,
 * including data fetching, user interactions, and communication between child components.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CryptoCard } from './components/CryptoCard';
import { ChatPanel } from './components/ChatPanel';
import { WalletModal } from './components/WalletModal';
import { AlertModal } from './components/AlertModal';
import { ToastNotification } from './components/ToastNotification';
import { NewsFeed } from './components/NewsFeed';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Sidebar } from './components/Sidebar';
import { fetchCoinsData, subscribeToConnectionStatus, stopAllConnections, subscribeToPriceUpdates, manualReconnect, ConnectionStatus } from './services/coingeckoService';
import { getChatSession, removeChatSession, generateGroundedResponse } from './services/geminiService';
import type { CoinData, Session, ConnectedWallets, WalletType, Alert, Notification, Message } from './types';

type Theme = 'light' | 'dark';

interface ConnectionState {
  status: ConnectionStatus;
  trippedUntil: number;
}

/**
 * The main App component.
 * @returns {JSX.Element} The rendered application.
 */
const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [theme, setTheme] = useState<Theme>('dark');
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [openPrice24h, setOpenPrice24h] = useState<number | null>(null); // For real-time % change calculation
  const [isLoadingCoinData, setIsLoadingCoinData] = useState(true);
  const [coinDataError, setCoinDataError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: 'polling', trippedUntil: 0 });
  
  // Chat State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Modals and Sidebar State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalCoin, setAlertModalCoin] = useState<{ id: string, name: string, price: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Wallets & Alerts & Notifications
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallets>({ metamask: null, binance: null, telegram: null, discord: null });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // --- DERIVED STATE ---
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeMessages = activeSession?.messages ?? [];

  // --- EFFECTS ---

  // Theme effect: Toggles the 'dark' class on the root HTML element.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Load data from localStorage on initial component mount.
  useEffect(() => {
    try {
        const savedSessions = localStorage.getItem('chatSessions');
        if (savedSessions) setSessions(JSON.parse(savedSessions));

        const savedActiveId = localStorage.getItem('activeSessionId');
        if (savedActiveId) setActiveSessionId(savedActiveId);

        const savedWallets = localStorage.getItem('connectedWallets');
        if (savedWallets) setConnectedWallets(JSON.parse(savedWallets));
        
        const savedAlerts = localStorage.getItem('priceAlerts');
        if (savedAlerts) setAlerts(JSON.parse(savedAlerts));

    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Save data to localStorage whenever relevant state changes.
  useEffect(() => {
    try {
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        if (activeSessionId) localStorage.setItem('activeSessionId', activeSessionId);
        localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets));
        localStorage.setItem('priceAlerts', JSON.stringify(alerts));
    } catch (error) {
        console.error("Failed to save data to localStorage", error);
    }
  }, [sessions, activeSessionId, connectedWallets, alerts]);

  // Effect for fetching initial coin data and subscribing to live updates.
  const loadCoinData = useCallback(async () => {
    try {
      setIsLoadingCoinData(true);
      setCoinDataError(null);
      const data = await fetchCoinsData(['bitcoin']); // Fetching only Bitcoin for this example
      if (data && data.length > 0) {
        setCoinData(data[0]);
        // Calculate and store the 24h opening price to allow real-time % change updates
        if (data[0].current_price && data[0].price_change_percentage_24h != null) {
            const openPrice = data[0].current_price / (1 + data[0].price_change_percentage_24h / 100);
            setOpenPrice24h(openPrice);
        } else {
            setOpenPrice24h(null);
        }
      } else {
        throw new Error("No coin data received.");
      }
    } catch (error: any) {
      setCoinDataError(error.message || 'Failed to fetch market data.');
    } finally {
      setIsLoadingCoinData(false);
    }
  }, []);

  useEffect(() => {
    loadCoinData();
    
    // Subscribe to connection status changes from the data service.
    const unsubscribeStatus = subscribeToConnectionStatus((newState) => {
        setConnectionState(prevState => {
            if (newState.status !== prevState.status) {
                if (newState.status === 'disconnected') {
                    addNotification('Data connection lost. Displaying cached data.', 'error');
                } else if (newState.status === 'polling' && prevState.status !== 'polling') {
                    addNotification('Data connection restored. Live updates resumed.', 'success');
                } else if (newState.status === 'suspended') {
                    addNotification('Connection issues detected. Pausing live data to recover.', 'info');
                }
            }
            return newState;
        });
    });
    
    // Subscribe to real-time price updates for Bitcoin.
    const unsubscribePrice = subscribeToPriceUpdates('bitcoin', (newPrice) => {
        setCoinData(prevData => {
            if (prevData && prevData.current_price !== newPrice) {
                let newPercentageChange = prevData.price_change_percentage_24h;
                // Recalculate 24h percentage change if we have the opening price
                if (openPrice24h) {
                    newPercentageChange = ((newPrice / openPrice24h) - 1) * 100;
                }
                return { 
                    ...prevData, 
                    current_price: newPrice,
                    price_change_percentage_24h: newPercentageChange
                };
            }
            return prevData;
        });
    });

    // Cleanup subscriptions on component unmount.
    return () => {
        unsubscribeStatus();
        unsubscribePrice();
        stopAllConnections();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCoinData]);

  // Effect to check if any price alerts have been triggered by price updates.
  useEffect(() => {
      if (!coinData) return;
      alerts.forEach(alert => {
          if (alert.coinId === coinData.id) {
              const hasHitTarget = (coinData.current_price >= alert.targetPrice && (alert as any).lastPrice < alert.targetPrice) || 
                                   (coinData.current_price <= alert.targetPrice && (alert as any).lastPrice > alert.targetPrice);
              if (hasHitTarget) {
                  addNotification(`${coinData.symbol.toUpperCase()} has hit your target price of $${alert.targetPrice.toLocaleString()}`, 'info');
                  setAlerts(prev => prev.filter(a => a.id !== alert.id));
              }
          }
      });
      // Store last price on alert object to prevent re-triggering
      setAlerts(prev => prev.map(a => a.coinId === coinData.id ? {...a, lastPrice: coinData.current_price} : a));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinData]);


  // --- HANDLERS ---

  /**
   * Adds a new notification to be displayed as a toast.
   * @param {string} message - The message content.
   * @param {'success' | 'info' | 'error'} type - The type of notification.
   */
  const addNotification = (message: string, type: 'success' | 'info' | 'error') => {
    const newNotification: Notification = { id: Date.now().toString(), message, type };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
  };

  /**
   * Toggles the application's color theme between light and dark.
   */
  const handleThemeToggle = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  /**
   * Updates the messages array for a specific session.
   * @param {string} sessionId - The ID of the session to update.
   * @param {Message[]} newMessages - The new array of messages for the session.
   */
  const updateMessages = (sessionId: string, newMessages: Message[]) => {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: newMessages } : s));
  };
  
  /**
   * Creates a new, empty chat session and sets it as the active one.
   * @returns {string} The ID of the newly created session.
   */
  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: Session = {
      id: newId,
      title: 'New Chat Session',
      timestamp: Date.now(),
      messages: [],
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    return newId;
  };
  
  /**
   * Deletes a chat session and cleans up associated resources.
   * @param {string} id - The ID of the session to delete.
   */
  const handleDeleteSession = (id: string) => {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
          const remainingSessions = sessions.filter(s => s.id !== id);
          setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
      removeChatSession(id); // Clean up the backend chat instance
  };

  /**
   * Handles sending a message from the main chat panel.
   * If no session is active, it creates one first.
   * @param {string} messageText - The text of the message to send.
   * @param {boolean} useWebSearch - Whether to use grounded web search for the response.
   */
  const handleSendMessage = async (messageText: string, useWebSearch: boolean) => {
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
        currentSessionId = handleNewChat();
    }
    
    sendMessageToSession(currentSessionId, messageText, useWebSearch);
  };
  
  /**
   * Sends a message to a specific chat session and handles the AI response.
   * This function manages the full request/response lifecycle, including streaming.
   * @param {string} sessionId - The ID of the session to send the message to.
   * @param {string} messageText - The user's message text.
   * @param {boolean} useWebSearch - Whether to use web search.
   */
  const sendMessageToSession = async (sessionId: string, messageText: string, useWebSearch: boolean) => {
    const userMessage: Message = { id: Date.now().toString(), text: messageText, sender: 'user' };
    
    const currentSession = sessions.find(s => s.id === sessionId);
    if (!currentSession) return;

    const updatedMessages = [...currentSession.messages, userMessage];
    updateMessages(sessionId, updatedMessages);
    setIsAiLoading(true);

    const aiMessageId = (Date.now() + 1).toString();

    try {
        if (useWebSearch) {
             const response = await generateGroundedResponse(messageText);
             const aiMessage: Message = {
                 id: aiMessageId,
                 text: response.text,
                 sender: 'ai',
                 sources: response.sources,
             };
             updateMessages(sessionId, [...updatedMessages, aiMessage]);
        } else {
            const chat = getChatSession(sessionId);
            const stream = await chat.sendMessageStream({ message: messageText });

            let aiResponseText = '';
            const aiMessage: Message = { id: aiMessageId, text: '▌', sender: 'ai' };
            // Add a placeholder message first
            updateMessages(sessionId, [...updatedMessages, aiMessage]);

            for await (const chunk of stream) {
                aiResponseText += chunk.text;
                const streamingAiMessage: Message = { id: aiMessageId, text: aiResponseText + '▌', sender: 'ai' };
                // Update only the streaming message
                setSessions(prev => prev.map(s => s.id === sessionId 
                    ? { ...s, messages: s.messages.map(m => m.id === aiMessageId ? streamingAiMessage : m) } 
                    : s
                ));
            }
            
            const finalAiMessage: Message = { id: aiMessageId, text: aiResponseText, sender: 'ai' };
            // Final update to remove cursor
            setSessions(prev => prev.map(s => s.id === sessionId 
                ? { ...s, messages: s.messages.map(m => m.id === aiMessageId ? finalAiMessage : m) }
                : s
            ));
        }

        const sessionAfterMessage = sessions.find(s => s.id === sessionId);
        // If it's the first message pair in a session, set the session title.
        if (sessionAfterMessage && sessionAfterMessage.messages.length <= 2) {
            const newTitle = messageText.length > 30 ? messageText.substring(0, 27) + '...' : messageText;
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
        }

    } catch (error) {
        console.error("Error sending message to AI:", error);
        const errorMessage: Message = { id: aiMessageId, text: "Sorry, I couldn't get a response. Please check the console.", sender: 'ai' };
        setSessions(prev => prev.map(s => {
          if (s.id !== sessionId) return s;
          const newMessages = s.messages.find(m => m.id === aiMessageId) 
              ? s.messages.map(m => m.id === aiMessageId ? errorMessage : m)
              : [...s.messages, errorMessage];
          return { ...s, messages: newMessages };
        }));
    } finally {
        setIsAiLoading(false);
    }
  }

  // Wallet Handlers
  const handleConnectWallet = (wallet: WalletType) => {
    const mockAddress = wallet === 'metamask' ? `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` : `${wallet}User_${Date.now()}`;
    setConnectedWallets(prev => ({ ...prev, [wallet]: mockAddress }));
    addNotification(`${walletInfo[wallet].name} connected successfully!`, 'success');
  };
  
  const walletInfo: { [key in WalletType]: { name: string } } = {
    metamask: { name: 'MetaMask' },
    binance: { name: 'Binance' },
    telegram: { name: 'Telegram' },
    discord: { name: 'Discord' },
  };

  const handleDisconnectWallet = (wallet: WalletType) => {
    setConnectedWallets(prev => ({ ...prev, [wallet]: null }));
    addNotification(`${walletInfo[wallet].name} disconnected.`, 'info');
  };
  
  // Alert Handlers
  const handleOpenAlertModal = (coinId: string, coinName: string, currentPrice: number) => {
      setAlertModalCoin({ id: coinId, name: coinName, price: currentPrice });
      setIsAlertModalOpen(true);
  };
  
  const handleAddAlert = (alert: Omit<Alert, 'id' | 'createdAt'>) => {
      const newAlert: Alert = { ...alert, id: Date.now().toString(), createdAt: Date.now() };
      setAlerts(prev => [...prev, newAlert]);
      addNotification(`Alert set for ${alert.coinName} at $${alert.targetPrice}`, 'success');
      setIsAlertModalOpen(false);
  };
  
  const handleRemoveAlert = (alertId: string) => {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      addNotification('Alert removed.', 'info');
  };

  // --- RENDER ---
  return (
    <div className={`h-screen w-screen bg-brand-background text-brand-text-primary font-sans transition-colors ${theme} flex`}>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
            setActiveSessionId(id);
            setIsSidebarOpen(false); // Close sidebar on selection in mobile
        }}
        onNewChat={() => {
            handleNewChat();
            setIsSidebarOpen(false);
        }}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onWalletClick={() => setIsWalletModalOpen(true)}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-hidden p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-w-full xl:max-w-[1600px] mx-auto">
            
            {/* Main Chat Panel */}
            <div className="lg:col-span-2 h-full min-h-0">
              <ChatPanel 
                messages={activeMessages} 
                isLoading={isAiLoading}
                onSendMessage={handleSendMessage}
              />
            </div>
            
            {/* Right Info Column */}
            <div className="h-full overflow-y-auto space-y-6 pr-1 pb-6 hidden lg:block">
                {isLoadingCoinData ? (
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-lg h-[370px] flex items-center justify-center">Loading market data...</div>
                ) : coinDataError ? (
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-lg h-[370px] flex items-center justify-center text-red-500">{coinDataError}</div>
                ) : coinData ? (
                    <CryptoCard 
                        coinData={coinData} 
                        onOpenAlertModal={handleOpenAlertModal}
                        connectionState={connectionState}
                        onManualReconnect={manualReconnect}
                    />
                ) : null}
                <AnalysisPanel 
                    onGenerateAnalysis={(prompt) => handleSendMessage(prompt, false)} 
                    coinSymbol={coinData?.symbol.toUpperCase()} 
                />
                <NewsFeed />
            </div>

          </div>
        </main>
      </div>
      
      {/* Modals & Notifications */}
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        connectedWallets={connectedWallets}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />
      {isAlertModalOpen && alertModalCoin && (
        <AlertModal 
            isOpen={isAlertModalOpen}
            onClose={() => setIsAlertModalOpen(false)}
            coinId={alertModalCoin.id}
            coinName={alertModalCoin.name}
            currentPrice={coinData?.current_price ?? alertModalCoin.price}
            alerts={alerts}
            onAddAlert={handleAddAlert}
            onRemoveAlert={handleRemoveAlert}
        />
      )}

      {/* Notification Area */}
      <div className="fixed top-20 right-4 w-full max-w-sm space-y-3 z-[100]">
        {notifications.map(n => (
            <ToastNotification 
                key={n.id}
                notification={n}
                onDismiss={(id) => setNotifications(prev => prev.filter(item => item.id !== id))}
            />
        ))}
      </div>
    </div>
  );
};

export default App;