/**
 * @file This component defines the main application sidebar.
 * It acts as a container for the ChatHistoryPanel and manages its own visibility state
 * for responsive behavior (drawer on mobile, static on desktop).
 */

import React from 'react';
import { ChatHistoryPanel } from './ChatHistoryPanel';
import { XIcon } from './icons/XIcon';
import type { Session } from '../types';

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  /** An array of all chat sessions to pass to the ChatHistoryPanel. */
  sessions: Session[];
  /** The ID of the currently active session. */
  activeSessionId: string | null;
  /** Callback function to select a session. */
  onSelectSession: (id: string) => void;
  /** Callback function to create a new chat. */
  onNewChat: () => void;
  /** Callback function to delete a session. */
  onDeleteSession: (id: string) => void;
  /** A boolean indicating if the sidebar is open (on mobile). */
  isOpen: boolean;
  /** Callback function to close the sidebar (on mobile). */
  onClose: () => void;
}

/**
 * The main sidebar component for the application.
 * It displays the chat history and provides controls for managing sessions.
 * It is responsive, appearing as a slide-out drawer on smaller screens.
 * @param {SidebarProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered sidebar and its overlay.
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, ...chatHistoryProps }) => {
  return (
    <>
      {/* Overlay for mobile, shown when the sidebar is open */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar container */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full bg-brand-surface w-72 flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-brand-border ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-4 flex justify-between items-center border-b border-brand-border flex-shrink-0">
          <h1 className="text-xl font-bold text-brand-text-primary">Chat Sessions</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-brand-text-secondary hover:text-brand-text-primary"
            aria-label="Close sidebar"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <ChatHistoryPanel {...chatHistoryProps} />
      </aside>
    </>
  );
};