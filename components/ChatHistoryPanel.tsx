/**
 * @file This component displays a list of past chat sessions.
 * It allows users to start a new chat, switch between existing chats,
 * and delete chats they no longer need.
 */

import React from 'react';
import type { Session } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

/**
 * Props for the ChatHistoryPanel component.
 */
interface ChatHistoryPanelProps {
  /** An array of all chat sessions. */
  sessions: Session[];
  /** The ID of the currently active session, or null if none is active. */
  activeSessionId: string | null;
  /** Callback function to select and activate a chat session. */
  onSelectSession: (id: string) => void;
  /** Callback function to create a new chat session. */
  onNewChat: () => void;
  /** Callback function to delete a chat session. */
  onDeleteSession: (id:string) => void;
}

/**
 * A panel that lists all saved chat sessions, allowing for interaction.
 * Typically used within a sidebar.
 * @param {ChatHistoryPanelProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered chat history panel.
 */
export const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession
}) => {

  /**
   * Handles the click event for deleting a session.
   * Prevents the click from also selecting the session.
   * @param {React.MouseEvent} e - The mouse event.
   * @param {string} id - The ID of the session to delete.
   */
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent session selection when deleting
    onDeleteSession(id);
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden p-4">
      <button
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 w-full bg-brand-blue hover:bg-brand-blue-light text-white font-bold py-2 px-4 rounded-lg mb-4 transition-colors flex-shrink-0"
      >
        <PlusIcon className="w-5 h-5" />
        New Chat
      </button>
      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {sessions.length > 0 ? sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSessionId === session.id
                ? 'bg-brand-blue/30'
                : 'hover:bg-brand-border/50'
            }`}
          >
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-brand-text-primary truncate">{session.title}</p>
                <p className="text-xs text-brand-text-secondary">{new Date(session.timestamp).toLocaleString()}</p>
            </div>
            <button 
                onClick={(e) => handleDelete(e, session.id)} 
                className="ml-2 p-1 rounded-md text-brand-text-secondary hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete session"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )) : (
            <div className="text-center text-brand-text-secondary text-sm pt-4">
                No chat history. Start a new chat to begin.
            </div>
        )}
      </div>
    </div>
  );
};