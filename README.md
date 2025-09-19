# CryptoPulse AI 🤖📈

![CryptoPulse AI Dashboard Placeholder](https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png)
*(Replace this with a screenshot of your running application)*

## Project Vision

CryptoPulse AI is an AI-powered cryptocurrency trading platform designed to be a full-stack finance agent platform. It uses LLM-based agents to analyze markets, execute trades, detect fraud, and ensure compliance.

## 📚 Documentation

**For a complete overview of the project, including architecture, concepts, and guides, please see our [full documentation](./docs/README.md).**

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
|-- /src/               # Main application source code
|   |-- /components/    # Reusable React components
|   |-- /services/      # Modules for external API interactions
|-- ...etc
```

## 🤝 Contributing

Contributions are greatly appreciated. Please see our [contributing guide](./docs/guides/roadmap-and-contributing.md) for more details.