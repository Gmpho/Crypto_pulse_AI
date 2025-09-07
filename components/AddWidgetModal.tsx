/**
 * @file This component defines a modal dialog that allows users to add new
 * widgets to a customizable dashboard.
 * @deprecated This component is part of an unused customizable dashboard feature.
 */

import React from 'react';
import type { WidgetType } from '../types';
import { PlusIcon } from './icons/PlusIcon';

/**
 * Props for the AddWidgetModal component.
 */
interface AddWidgetModalProps {
  /** Whether the modal is currently visible. */
  isOpen: boolean;
  /** Callback function to close the modal. */
  onClose: () => void;
  /** Callback function to add a selected widget to the dashboard. */
  onAddWidget: (widgetId: WidgetType) => void;
  /** A list of widgets that are not yet on the dashboard and are available to be added. */
  availableWidgets: { id: WidgetType, name: string }[];
}

/**
 * A modal that displays a list of available widgets to add to the dashboard.
 * @param {AddWidgetModalProps} props - The properties for the component.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAddWidget,
  availableWidgets,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-sm shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-brand-text-primary">Add Widget</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary text-2xl">&times;</button>
        </div>
        <div className="space-y-3">
          {availableWidgets.length > 0 ? (
            availableWidgets.map(widget => (
              <button
                key={widget.id}
                onClick={() => onAddWidget(widget.id)}
                className="w-full flex items-center justify-between p-4 bg-brand-background hover:bg-brand-border/50 rounded-lg transition-colors text-left"
              >
                <span className="font-semibold text-brand-text-primary">{widget.name}</span>
                <PlusIcon className="w-5 h-5 text-brand-blue" />
              </button>
            ))
          ) : (
            <p className="text-brand-text-secondary text-center">All widgets are already on the dashboard.</p>
          )}
        </div>
      </div>
    </div>
  );
};