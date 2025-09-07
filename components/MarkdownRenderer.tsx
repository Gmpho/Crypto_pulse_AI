/**
 * @file This file contains a simple Markdown to HTML renderer component.
 * It is specifically designed to parse the formatted text provided by the Gemini API,
 * including headings, lists, bold text, and the streaming cursor.
 */

import React from 'react';

/**
 * Parses a string with simple Markdown-like syntax into an HTML string.
 * This is a basic implementation and does not cover all Markdown features.
 * - Supports headings (`#`, `##`, `###`).
 * - Supports unordered lists (`* `).
 * - Supports ordered lists (`1. `).
 * - Supports bold text (`**text**`).
 * - Handles the streaming cursor (`▌`).
 *
 * @param {string} text - The Markdown-like text to parse.
 * @returns {string} An HTML string representation of the input text.
 */
const parseMarkdown = (text: string): string => {
  // Handle streaming cursor. We'll add it back at the end.
  const hasCursor = text.endsWith('▌');
  let content = hasCursor ? text.slice(0, -1) : text;

  const lines = content.split('\n');
  let html = '';
  let listState: 'ul' | 'ol' | null = null;

  for (const line of lines) {
    // Trim the line to handle indentation
    const processedLine = line.trim();
    
    // Reset list if there is an empty line
    if (processedLine === '') {
        if (listState) {
            html += listState === 'ul' ? '</ul>' : '</ol>';
            listState = null;
        }
        continue;
    }

    // Headings
    if (processedLine.startsWith('# ')) {
      if (listState) { html += listState === 'ul' ? '</ul>' : '</ol>'; listState = null; }
      html += `<h1>${processedLine.substring(2)}</h1>`;
    } else if (processedLine.startsWith('## ')) {
      if (listState) { html += listState === 'ul' ? '</ul>' : '</ol>'; listState = null; }
      html += `<h2>${processedLine.substring(3)}</h2>`;
    } else if (processedLine.startsWith('### ')) {
      if (listState) { html += listState === 'ul' ? '</ul>' : '</ol>'; listState = null; }
      html += `<h3>${processedLine.substring(4)}</h3>`;
    }
    // Unordered lists
    else if (processedLine.startsWith('* ')) {
      if (listState !== 'ul') {
        if (listState === 'ol') html += '</ol>';
        html += '<ul>';
        listState = 'ul';
      }
      html += `<li>${processedLine.substring(2)}</li>`;
    }
    // Ordered lists
    else if (processedLine.match(/^\d+\.\s/)) {
        if (listState !== 'ol') {
            if (listState === 'ul') html += '</ul>';
            html += '<ol>';
            listState = 'ol';
        }
        html += `<li>${processedLine.replace(/^\d+\.\s/, '')}</li>`;
    }
    // Paragraphs
    else {
      if (listState) {
        html += listState === 'ul' ? '</ul>' : '</ol>';
        listState = null;
      }
      html += `<p>${processedLine}</p>`;
    }
  }

  // Close any open lists at the end
  if (listState) {
    html += listState === 'ul' ? '</ul>' : '</ol>';
  }
  
  // Apply bold formatting to the whole HTML block
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Add cursor back if it was there
  if (hasCursor) {
    html += '<span class="animate-pulse">▌</span>';
  }

  return html;
};

/**
 * A React component that takes a Markdown-like string and renders it as HTML.
 * It uses `dangerouslySetInnerHTML` because the content is generated HTML from a trusted source (the Gemini API via the `parseMarkdown` function).
 * This is necessary to render the HTML tags for formatting.
 * @param {object} props - The component's properties.
 * @param {string} props.text - The text to be rendered.
 * @returns {JSX.Element} A div containing the rendered HTML.
 */
export const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const html = parseMarkdown(text);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};