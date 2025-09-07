/**
 * @file This component renders a responsive area chart for displaying price history.
 * It uses the 'recharts' library for charting and includes a custom styled tooltip.
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PriceDataPoint } from '../types';

/**
 * Props for the Chart component.
 */
interface ChartProps {
  /** An array of data points to be plotted on the chart. */
  data: PriceDataPoint[];
}

/**
 * A custom tooltip component for the chart to match the application's theme.
 * @param {any} props - Props passed by the recharts Tooltip component.
 * @returns {JSX.Element | null} The rendered custom tooltip.
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-background/80 backdrop-blur-sm p-2 border border-brand-border rounded-md shadow-lg">
          <p className="text-brand-text-secondary text-sm">{`Time: ${label}`}</p>
          <p className="text-brand-text-primary font-bold">{`Price: $${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`}</p>
        </div>
      );
    }
  
    return null;
  };

/**
 * Renders a responsive area chart for visualizing cryptocurrency price data.
 * @param {ChartProps} props - The properties for the component.
 * @returns {JSX.Element} A responsive chart container with the area chart.
 */
export const Chart: React.FC<ChartProps> = ({ data }) => {
  // FIX: Use 'as const' to ensure TypeScript infers a tuple type, which is required by the recharts 'domain' prop.
  // This calculates a small buffer around the min/max data points for better visual spacing.
  const yAxisDomain = [
    (dataMin: number) => (dataMin * 0.98),
    (dataMax: number) => (dataMax * 1.02)
  ] as const;

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
            </defs>
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#8B949E', fontSize: 12 }} />
          <YAxis domain={yAxisDomain} hide />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: 'var(--color-text-secondary)', strokeDasharray: '3 3' }} 
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3B82F6" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorPrice)"
            activeDot={{ r: 6, strokeWidth: 2, fill: '#3B82F6', stroke: 'var(--color-background)' }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};