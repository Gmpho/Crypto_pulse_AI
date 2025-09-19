# CryptoPulse AI 🤖📈

![CryptoPulse AI Dashboard Placeholder](https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png)
*(Replace this with a screenshot of your running application)*

## Project Vision

CryptoPulse AI is evolving into a full-stack finance agent platform. It leverages Supabase AI, vector search, event-streaming, and specialized LangChain tools to enable AI agents to:

1.  Detect fraud and anomalies in real-time.
2.  Generate compliance audits and reports.
3.  Perform automated portfolio management.

All while keeping keys secure, auditable, and regionally compliant.

## 📚 Documentation

This project is documented in the `docs` directory. Here are some key documents to get you started:

-   **[System Architecture](./docs/ARCHITECTURE.md)**: The high-level architecture, Supabase integration, and database schemas.
-   **[AI Agent Design](./docs/AGENT_DESIGN.md)**: The design of the LangChain-powered AI agents.
-   **[Security and Compliance](./docs/SECURITY.md)**: The security and compliance patterns.
-   **[Development Roadmap](./docs/ROADMAP.md)**: The proposed development roadmap and testing strategy.
-   **[API Reference](./docs/API_REFERENCE.md)**: The proposed API endpoints.
-   **[Coinbase Integration](./docs/COINBASE_INTEGRATION.md)**: How to integrate Coinbase into the platform.
-   **[Competitive Analysis](./docs/COMPETITIVE_ANALYSIS.md)**: An analysis of similar platforms in the market.

## ✨ Key Features

### Current Frontend Features:

*   **Real-time Crypto Tracking:** Live price updates for cryptocurrencies.
*   **Interactive Price Charts:** Responsive historical price charts.
*   **AI Chat Assistant (Gemini Powered):** Engage in conversations about the crypto market.
*   **Latest News Feed:** An integrated feed of the latest crypto news.
*   **Price Alerts:** Set custom price alerts.
*   **Wallet Integration Simulation:** A modal to simulate connecting various wallets.
*   **Modern & Responsive UI:** Built with Tailwind CSS, including a Dark/Light mode.

### Planned Backend Features:

*   **Full-Stack Financial Agents:** Autonomous agents for trading and analysis.
*   **Real-time Fraud Detection:** Anomaly detection on transactions.
*   **Automated Portfolio Management:** AI-driven investment strategies.
-   **Continuous Audit & Compliance:** Automated compliance checks and reporting.
*   **Secure Key Management:** Using KMS/Vault for API key storage.
*   **Multi-Exchange Support:** Starting with Binance and Coinbase.

## 🛠️ Tech Stack

### Frontend:

*   **Framework:** React, TypeScript
*   **Styling:** Tailwind CSS
*   **Charting:** Recharts
*   **AI:** Google Gemini API (`@google/genai`)
*   **Data Sources:** CoinGecko API, CryptoCompare API

### Backend (Planned):

*   **Framework:** Python (FastAPI)
*   **AI/Agents:** LangChain
*   **Database:** Supabase (Postgres + pgvector)
*   **Security:** Cloud KMS / HashiCorp Vault
*   **Infrastructure:** Fly.io (or similar)

## 🚀 Getting Started (Frontend)

To get the current frontend running locally, follow these steps.

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
    Create a `.env` file in the root of your project and add your Vite-prefixed Gemini API key:
    ```.env
    VITE_API_KEY=YOUR_GEMINI_API_KEY
    ```
    You can get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

## 📂 Project Structure

```
/
|-- /docs/              # Detailed project documentation
|-- /components/        # Reusable React components
|   |-- /icons/         # SVG icon components
|-- /services/          # Modules for external API interactions
|-- App.tsx             # Main application component
|-- types.ts            # Centralized TypeScript type definitions
|-- constants.ts        # Mock data and shared constants
|-- ...etc
```

## 🤝 Contributing

Contributions are greatly appreciated. Please fork the repo and create a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request