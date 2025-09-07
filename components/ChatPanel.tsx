/**
 * @file This component provides the main chat interface for the application.
 * It displays the conversation history, handles user input, shows a typing indicator,
 * and allows the user to toggle web search for grounded responses.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { Message, GroundingChunk } from '../types';
import { SparkleIcon } from './icons/SparkleIcon';
import { UserIcon } from './icons/UserIcon';
import { SendIcon } from './icons/SendIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { MarkdownRenderer } from './MarkdownRenderer';

/**
 * Props for the ChatPanel component.
 */
interface ChatPanelProps {
  /** An array of messages in the current active session. */
  messages: Message[];
  /** A boolean indicating if the AI is currently generating a response. */
  isLoading: boolean;
  /** 
   * Callback function to send a message to the parent component.
   * @param {string} message - The text content of the message.
   * @param {boolean} useWebSearch - Whether web search should be enabled for this message.
   */
  onSendMessage: (message: string, useWebSearch: boolean) => void;
}

/**
 * A small animated component to indicate that the AI is processing a request.
 * @returns {JSX.Element} The rendered typing indicator.
 */
const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-brand-blue-light animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 rounded-full bg-brand-blue-light animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-brand-blue-light animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        <span className="text-brand-text-secondary text-sm ml-1">AI is thinking...</span>
    </div>
);

/**
 * A component to display the list of web sources for a grounded AI message.
 * @param {object} props - Component properties.
 * @param {GroundingChunk[]} props.sources - An array of source objects.
 * @returns {JSX.Element} A formatted list of clickable source links.
 */
const MessageSources: React.FC<{ sources: GroundingChunk[] }> = ({ sources }) => (
    <div className="mt-3 pt-3 border-t border-brand-blue/20">
      <h4 className="text-xs font-bold text-brand-text-secondary mb-2">SOURCES</h4>
      <div className="space-y-1.5">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.web.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 bg-brand-surface/50 hover:bg-brand-border/50 rounded-md transition-colors"
          >
            <p className="text-xs font-semibold text-brand-blue hover:underline truncate" title={source.web.title}>
              {source.web.title || source.web.uri}
            </p>
          </a>
        ))}
      </div>
    </div>
);

/**
 * The main chat panel component.
 * It manages its own state for the input field and the web search toggle.
 * @param {ChatPanelProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered chat panel.
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /**
   * Scrolls the message container to the bottom.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea based on content.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [inputValue]);

  /**
   * Handles the form submission to send a message.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim(), isWebSearchEnabled);
      setInputValue('');
    }
  };

  /**
   * Handles the 'Enter' key press in the textarea to send messages,
   * while allowing 'Shift+Enter' for new lines.
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - The keyboard event.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl w-full h-full flex flex-col shadow-lg">
      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
        {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary">
                <SparkleIcon className="w-12 h-12 mb-4 text-brand-blue" />
                <h2 className="text-xl font-bold text-brand-text-primary">CryptoPulse AI</h2>
                <p>Your intelligent crypto market assistant.</p>
                <p className="text-sm mt-4">Toggle on 'Web Search' for real-time data.</p>
            </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 max-w-2xl ${
              message.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'ai' ? 'bg-brand-blue' : 'bg-gray-600'
              }`}
            >
              {message.sender === 'ai' ? (
                <SparkleIcon className="w-5 h-5 text-white" />
              ) : (
                <UserIcon className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`p-4 rounded-2xl prose prose-sm max-w-full break-words ${
                message.sender === 'ai'
                  ? 'bg-brand-background text-brand-text-primary'
                  : 'bg-brand-blue text-white prose-invert'
              }`}
            >
              {message.sender === 'ai' ? <MarkdownRenderer text={message.text} /> : <p className="whitespace-pre-wrap">{message.text}</p>}
              {message.sources && message.sources.length > 0 && <MessageSources sources={message.sources} />}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
                <SparkleIcon className="w-5 h-5 text-white" />
            </div>
            <div className="p-3 rounded-2xl bg-brand-background">
                <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-brand-border bg-brand-surface rounded-b-2xl">
        <form onSubmit={handleSendMessage} className="relative flex items-end">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isWebSearchEnabled ? "Ask about real-time market events..." : "Ask anything about crypto..."}
            rows={1}
            className="w-full bg-brand-background border border-brand-border rounded-lg py-3 pl-4 pr-12 text-brand-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
            disabled={isLoading}
            style={{ maxHeight: '150px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-3 bottom-2.5 p-2 rounded-full bg-brand-blue hover:bg-brand-blue-light disabled:bg-brand-border disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5 text-white" />
          </button>
        </form>
        <div className="flex items-center justify-end mt-2">
            <label htmlFor="web-search-toggle" className="flex items-center cursor-pointer group">
                <span className={`text-sm font-medium ${isWebSearchEnabled ? 'text-brand-blue' : 'text-brand-text-secondary'} group-hover:text-brand-text-primary transition-colors mr-2`}>Web Search</span>
                <div className="relative">
                    <input 
                        type="checkbox" 
                        id="web-search-toggle" 
                        className="sr-only" 
                        checked={isWebSearchEnabled}
                        onChange={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${isWebSearchEnabled ? 'bg-brand-blue' : 'bg-brand-border'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isWebSearchEnabled ? 'translate-x-4' : ''}`}></div>
                </div>
                <GlobeIcon className={`w-5 h-5 ml-2 transition-colors ${isWebSearchEnabled ? 'text-brand-blue' : 'text-brand-text-secondary'}`} />
            </label>
        </div>
      </div>
    </div>
  );
};