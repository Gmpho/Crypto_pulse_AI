# Getting Started

This guide will walk you through the process of setting up your development environment and running the CryptoPulse AI application.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: v18 or later recommended.
*   **npm-compatible package manager**: npm, yarn, or pnpm.
*   **Git**: For cloning the repository.

## 1. Clone the Repository

First, clone the project repository to your local machine:

```sh
git clone https://github.com/Gmpho/Crypto-pulse-Ai.git
cd Crypto-pulse-Ai
```

## 2. Install Dependencies

Next, install the necessary dependencies for the frontend application:

```sh
npm install
```

## 3. Set Up Environment Variables

The application requires a Google Gemini API key to power the AI chat features. Without it, the chat will run in a mock mode with pre-programmed responses.

1.  Create a `.env` file in the root of your project.
2.  Add your Gemini API key to this file. Since this is a client-side application, the environment variable needs to be prefixed with `VITE_` to be exposed to the browser.

    ```.env
    VITE_API_KEY=YOUR_GEMINI_API_KEY
    ```

3.  You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## 4. Run the Development Server

Now you can run the frontend development server:

```sh
npm run dev
```

The application should now be running on `http://localhost:5173` (or a similar port).

## Next Steps

Now that you have the application running, here are some resources to help you get more familiar with the project:

*   **[Project Concepts](./concepts/README.md)**: Learn about the core concepts and architecture of the project.
*   **[Guides](./guides/README.md)**: Explore our practical guides for specific tasks.