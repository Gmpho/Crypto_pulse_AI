/**
 * @file This component acts as a wrapper for other components to make them
 * part of a customizable, draggable dashboard layout. It provides UI for
 * dragging and removing the widget when in "edit mode".
 * @deprecated This component is part of an unused customizable dashboard feature.
 */

import React from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { GripVerticalIcon } from './icons/GripVerticalIcon';

/**
 * Props for the DashboardWidget component.
 */
interface DashboardWidgetProps {
  /** The content to be displayed inside the widget. */
  children: React.ReactNode;
  /** A boolean indicating if the dashboard is in edit mode. */
  isEditMode: boolean;
  /** Callback function to remove the widget from the dashboard. */
  onRemove: () => void;
  /** A unique identifier for the widget. */
  widgetId: string;
  /** Callback for the onDragStart event. */
  onDragStart: (e: React.DragEvent<HTMLDivElement>, widgetId: string) => void;
  /** Callback for the onDrop event. */
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => void;
  /** Callback for the onDragOver event. */
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Callback for the onDragEnd event. */
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  /** Optional additional CSS classes. */
  className?: string;
}

/**
 * A draggable and removable wrapper for dashboard widgets.
 * @param {DashboardWidgetProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered widget container.
 */
export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  children,
  isEditMode,
  onRemove,
  widgetId,
  onDragStart,
  onDrop,
  onDragOver,
  onDragEnd,
  className = '',
}) => {
  return (
    <div
      id={`widget-${widgetId}`}
      draggable={isEditMode}
      onDragStart={(e) => onDragStart(e, widgetId)}
      onDrop={(e) => onDrop(e, widgetId)}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`relative transition-all duration-300 h-full ${isEditMode ? 'ring-2 ring-brand-blue ring-dashed p-1 rounded-3xl' : ''} ${className}`}
    >
      {isEditMode && (
        <div className="absolute top-1 left-1 right-1 z-10 flex justify-between items-center p-2 bg-brand-surface/80 backdrop-blur-sm rounded-t-2xl">
          <GripVerticalIcon className="w-5 h-5 text-brand-text-secondary cursor-move" />
          <button
            onClick={onRemove}
            className="p-1 rounded-full text-brand-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors"
            aria-label="Remove widget"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )}
       <div className={`h-full ${isEditMode ? 'pt-8' : ''}`}>
         {children}
       </div>
    </div>
  );
};