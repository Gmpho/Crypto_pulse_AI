# Getting Started

This guide will walk you through the process of setting up your development environment and running the full-stack CryptoPulse AI application.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: v18 or later recommended.
*   **npm-compatible package manager**: npm, yarn, or pnpm.
*   **Python**: v3.9 or later.
*   **Git**: For cloning the repository.

## 2. Clone the Repository

First, clone the project repository to your local machine:

```sh
git clone https://github.com/Gmpho/Crypto-pulse-Ai.git
cd Crypto-pulse-Ai
```

## 3. Environment Setup

This project requires a `.env` file for environment variables. We've included a `.env.example` file to make this easy.

1.  Make a copy of `.env.example` and name it `.env`.
2.  Fill in the required values in the new `.env` file. At a minimum, you will need to provide the `VITE_API_KEY` for the frontend and the `DATABASE_URL` and `SUPABASE_` keys for the backend.

## 4. Backend Setup (Python)

1.  **Create a Virtual Environment**: From the root of the project, create a Python virtual environment.

    ```sh
    python -m venv .venv
    ```

2.  **Activate the Virtual Environment**:

    *   On Windows:
        ```sh
        .venv\Scripts\activate
        ```
    *   On macOS/Linux:
        ```sh
        source .venv/bin/activate
        ```

3.  **Install Dependencies**: Install the required Python packages.

    > **Note:** This project uses a `requirements.txt` file to manage Python dependencies. Please ensure this file is present and up-to-date.

    ```sh
    pip install -r requirements.txt
    ```

## 5. Frontend Setup (React)

1.  **Install Dependencies**: In a new terminal, navigate to the project root and install the npm dependencies.

    ```sh
    npm install
    ```

## 6. Running the Application

To run the full-stack application, you will need to run the backend and frontend servers in separate terminals.

*   **Run the Backend Server** (in your first terminal with the virtual environment activated):

    ```sh
    uvicorn main:app --reload
    ```

*   **Run the Frontend Server** (in your second terminal):

    ```sh
    npm run dev
    ```

The frontend application should now be running on `http://localhost:5173`, and it will be able to communicate with your backend server.
