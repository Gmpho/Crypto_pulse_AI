/**
 * @file This component provides a simple panel with a button to trigger
 * an AI-powered market analysis for a selected cryptocurrency.
 */

import React from 'react';
import { SparkleIcon } from './icons/SparkleIcon';

/**
 * Props for the AnalysisPanel component.
 */
interface AnalysisPanelProps {
  /** 
   * Callback function that is invoked when the user requests an analysis.
   * It passes the generated prompt string to the parent component.
   */
  onGenerateAnalysis: (prompt: string) => void;
  /** The symbol of the coin to be analyzed (e.g., 'BTC'). */
  coinSymbol?: string;
}

/**
 * A UI panel that allows users to request a detailed market analysis from the AI.
 * @param {AnalysisPanelProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered analysis panel.
 */
export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onGenerateAnalysis, coinSymbol = 'BTC' }) => {
  const handleGenerateClick = () => {
    onGenerateAnalysis(`Please provide a full market analysis for ${coinSymbol}.`);
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 w-full shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-3 mb-3">
            <SparkleIcon className="w-6 h-6 text-brand-blue" />
            <h4 className="text-lg font-bold text-brand-text-primary">AI Market Analysis</h4>
        </div>
        <p className="text-brand-text-secondary text-sm mb-6">
          Get an in-depth, AI-powered technical and fundamental analysis for the currently selected asset.
        </p>
      </div>
      <button
        onClick={handleGenerateClick}
        className="w-full bg-brand-blue hover:bg-brand-blue-light text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <SparkleIcon className="w-5 h-5" />
        Generate Analysis for {coinSymbol}
      </button>
    </div>
  );
};