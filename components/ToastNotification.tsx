/**
 * @file This component displays a "toast" notification that appears and then automatically fades out.
 * It's used for providing temporary feedback to the user, such as confirming an action.
 */

import React, { useEffect, useState } from 'react';
import type { Notification } from '../types';

/**
 * Props for the ToastNotification component.
 */
interface ToastNotificationProps {
  /** The notification object containing the message and type. */
  notification: Notification;
  /** Callback function to remove the notification from the parent's state once it's dismissed. */
  onDismiss: (id: string) => void;
}

/**
 * A self-dismissing notification component.
 * It manages its own visibility and animation state.
 * @param {ToastNotificationProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered toast notification.
 */
export const ToastNotification: React.FC<ToastNotificationProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Effect to handle the lifecycle of the toast: animate in, wait, animate out, and dismiss.
  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Set a timer to animate out and then dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(notification.id), 300); // Wait for fade out
    }, 5000); // 5 seconds visible

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  /**
   * Handles manual dismissal of the toast by the user clicking the close button.
   */
  const handleManualDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(notification.id), 300);
  };
  
  const bgColor = notification.type === 'success' ? 'bg-brand-green/90' : 'bg-brand-blue/90';

  return (
    <div
      className={`w-full max-w-sm rounded-lg shadow-2xl p-4 text-white ${bgColor} backdrop-blur-sm border border-white/20 transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold">{notification.message}</p>
        <button
          onClick={handleManualDismiss}
          className="text-white/70 hover:text-white"
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
};