# CryptoPulse AI 🤖📈

A modern, AI-powered dashboard for cryptocurrency market analysis and insights. This application provides real-time data, advanced charting, and an intelligent chat assistant powered by Google's Gemini API to help users make informed trading decisions.

*Note: This is a frontend application demonstration and does not connect to real trading backends.*

![CryptoPulse AI Dashboard Placeholder](https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png)
*(Replace this with a screenshot of your running application)*

## ✨ Key Features

*   **Real-time Crypto Tracking:** Live price updates for cryptocurrencies (Bitcoin is pre-configured), with visual feedback on price changes.
*   **Interactive Price Charts:** Responsive historical price charts from `recharts` with multiple timeframes (1H, 1D, 1W, 1M).
*   **AI Chat Assistant (Gemini Powered):**
    *   Engage in conversations about the crypto market.
    *   Generate in-depth technical and fundamental analysis for any crypto.
    *   Toggle on **Web Search** for grounded, up-to-the-minute answers on market events.
    *   Full chat history management (create, select, delete sessions), saved locally in your browser.
*   **Latest News Feed:** An integrated feed of the latest news from the crypto world, fetched from the CryptoCompare API.
*   **Robust Data Fetching:**
    *   Resilient data fetching from CoinGecko & CryptoCompare APIs.
    *   Features a circuit-breaker, CORS proxy rotation, and mock data fallbacks to ensure high availability and a smooth user experience even with network issues.
*   **Price Alerts:** Set custom price alerts for your favorite assets and get notified within the app.
*   **Wallet Integration:** A clean modal to simulate connecting/disconnecting various wallets and platforms (MetaMask, Binance, etc.).
*   **Modern & Responsive UI:**
    *   Sleek, responsive design built with Tailwind CSS.
    *   Includes a beautiful **Dark/Light mode** theme toggle.
    *   Custom toast notifications for user feedback.

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript
*   **Styling:** Tailwind CSS
*   **Charting:** Recharts
*   **AI:** Google Gemini API (`@google/genai`)
*   **Data Sources:** CoinGecko API, CryptoCompare API

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later recommended)
*   An npm-compatible package manager (npm, yarn, or pnpm)

### Installation

1.  **Clone the repo:**
    ```sh
    git clone https://github.com/Gmpho/Crypto-pulse-Ai.git
    cd Crypto-pulse-Ai
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up Environment Variables:**
    The application requires a Google Gemini API key to power the AI chat features. Without it, the chat will run in a mock mode with pre-programmed responses.

    *   Create a `.env` file in the root of your project.
    *   Add your Gemini API key to this file. **Note:** Since this is a client-side application, the environment variable needs to be prefixed (e.g., `VITE_` for Vite projects) to be exposed to the browser. Let's assume a Vite setup:
        ```.env
        VITE_API_KEY=YOUR_GEMINI_API_KEY
        ```
    *   You can get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server:**
    *If you are using Vite:*
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:5173` (or a similar port).

## 📂 Project Structure

The project is organized into a logical and scalable structure:

```
/
|-- /components/      # Reusable React components
|   |-- /icons/       # SVG icon components
|   |-- App.tsx       # Main application component and state orchestrator
|   |-- Chart.tsx     # Price chart component
|   |-- ChatPanel.tsx # Main AI chat interface
|   |-- ...etc
|-- /services/        # Modules for external API interactions
|   |-- coingeckoService.ts # CoinGecko API logic with circuit breaker
|   |-- geminiService.ts    # Google Gemini API logic
|   |-- newsService.ts      # CryptoCompare News API logic with circuit breaker
|-- types.ts          # Centralized TypeScript type definitions
|-- constants.ts      # Mock data and shared constants
|-- index.tsx         # Main React entry point
|-- index.html        # The main HTML file
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
