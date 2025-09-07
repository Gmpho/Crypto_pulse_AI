/**
 * @file This service handles all interactions with the Google Gemini API.
 * It provides functionalities for chat sessions and generating grounded (web-searched) responses.
 * It includes mock implementations for use when an API key is not available.
 */
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { GroundingChunk } from '../types';

/**
 * The API key for the Google Gemini API, loaded from environment variables.
 * @constant
 */
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Mock services will be used.");
}

/**
 * The singleton instance of the GoogleGenAI client.
 * It is initialized only if the API_KEY is present.
 * @constant
 */
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * A map to store and manage active chat session instances, keyed by a unique session ID.
 * This allows for multiple, independent conversations.
 * @constant
 */
const chatSessions = new Map<string, Chat>();

/**
 * Creates a mock chat object for use when the Gemini API is not configured.
 * This simulates a streamed response to allow the UI to function without a real backend.
 * @returns {Chat} A mock Chat instance with a `sendMessageStream` method.
 */
const createMockChat = (): Chat => ({
  sendMessageStream: async function* (params: { message: string }) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockResponse = `This is a mock streamed response to: "${params.message}". The API key is not configured, so this is simulated data.`;
    for (const word of mockResponse.split(' ')) {
      yield { text: word + ' ' };
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
} as unknown as Chat);

/**
 * Creates a real chat instance using the Gemini API.
 * It is configured with a system instruction to act as a professional crypto trading analyst.
 * @throws {Error} If the Gemini AI client is not initialized.
 * @returns {Chat} A real Chat instance connected to the Gemini API.
 */
const createRealChat = (): Chat => {
  if (!ai) {
    throw new Error("Gemini AI not initialized. Check API_KEY.");
  }
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a professional crypto trading analyst. Your goal is to provide comprehensive and well-structured market analysis.

When a user asks for an analysis of a cryptocurrency, you must provide a detailed report covering the following sections:

1.  **Executive Summary:** A brief, high-level overview of the current market sentiment and key takeaways.
2.  **Technical Analysis:**
    *   **Moving Averages (MA):** Analyze key moving averages (e.g., 50-day, 200-day) to determine the long-term and short-term trends.
    *   **Relative Strength Index (RSI):** Evaluate the RSI to identify overbought or oversold conditions.
    *   **MACD (Moving Average Convergence Divergence):** Analyze the MACD line, signal line, and histogram to identify momentum and potential trend reversals.
3.  **Fundamental Analysis:**
    *   **Recent News:** Summarize any significant recent news that could impact the asset's price.
    *   **Project Developments:** Mention any recent updates, partnerships, or roadmap progress for the project.
4.  **Overall Outlook:** Conclude with a balanced outlook, considering both bullish and bearish scenarios based on the analysis.

Always use Markdown for clear formatting, including headings, bold text, and lists.`,
    },
  });
};

/**
 * Retrieves or creates a chat session for a given session ID.
 * If a session already exists, it's returned; otherwise, a new one is created.
 * @param {string} sessionId - The unique identifier for the chat session.
 * @returns {Chat} The Chat instance for the given session ID.
 */
export const getChatSession = (sessionId: string): Chat => {
  if (chatSessions.has(sessionId)) {
    return chatSessions.get(sessionId)!;
  }

  console.log(`Creating new chat session for ID: ${sessionId}`);
  const newChat = API_KEY ? createRealChat() : createMockChat();
  chatSessions.set(sessionId, newChat);
  return newChat;
};

/**
 * Removes a chat session from the active sessions map to free up resources.
 * This should be called when a user deletes a session from the UI.
 * @param {string} sessionId - The ID of the session to remove.
 */
export const removeChatSession = (sessionId: string) => {
    if (chatSessions.has(sessionId)) {
        chatSessions.delete(sessionId);
        console.log(`Removed chat session for ID: ${sessionId}`);
    }
};

/**
 * Interface for the structured response from a grounded (web-searched) query.
 */
interface GroundedResponse {
    /** The textual response from the AI. */
    text: string;
    /** An array of web sources used to generate the response. */
    sources: GroundingChunk[];
}

/**
 * Generates a mock grounded response for use when the API key is not available.
 * @param {string} prompt - The user's input prompt.
 * @returns {Promise<GroundedResponse>} A promise that resolves to a mock grounded response.
 */
const generateMockGroundedResponse = async (prompt: string): Promise<GroundedResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        text: `This is a mock grounded response for "${prompt}". Web search is not available without an API key. I would normally search the web for real-time crypto market data to answer this.`,
        sources: [
            { web: { uri: 'https://mock.dev/source1', title: 'Mock Source 1: Real-Time Crypto News' } },
            { web: { uri: 'https://mock.dev/source2', title: 'Mock Source 2: Market Analysis Today' } },
        ]
    };
};

/**
 * Generates a response from the Gemini API using Google Search for grounding.
 * This is used for queries that require up-to-date, real-time information from the web.
 * If no API key is available, it returns a mock response.
 * @param {string} prompt - The user's prompt.
 * @returns {Promise<GroundedResponse>} A promise that resolves to the AI's response and its sources.
 */
export const generateGroundedResponse = async (prompt: string): Promise<GroundedResponse> => {
    if (!ai) {
        return generateMockGroundedResponse(prompt);
    }
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
    });

    const text = response.text;
    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[]) || [];

    return { text, sources };
};