# System Architecture

This document outlines the system architecture for CryptoPulse AI, designed to be a full-stack finance agent platform.

## Overview

CryptoPulse AI is a modern, AI-driven cryptocurrency trading platform. It couples a React/TypeScript frontend with a Python FastAPI backend that runs LLM-based agents (via LangChain) to analyze markets and execute trades.

###  Architectural Principles

*   **Separation of Concerns**: The frontend is responsible for the user interface, while the backend handles all business logic, data processing, and AI reasoning.
*   **Security First**: The system is designed with security as a top priority, with a focus on secure key management, threat modeling, and compliance.
*   **Scalability & Resilience**: The architecture is designed to be scalable and resilient, using containerization, cloud deployment, and best practices like circuit breakers and caching.

## Architecture Diagram

```
+------------------------------------------------------------------------------------+
|                                     User Interface                                     |
|                                (React / TypeScript / Vite)                               |
+------------------------------------------------------------------------------------+
|                                                                                    |
| <------------------------------------ HTTPS (API Calls) ----------------------------> |
|                                                                                    |
+-------------------------------------+----------------------------------------------+
|                                     |                                              |
|      Backend Services (Python)      |             Data & Auth Platform             |
|        (FastAPI / Docker)           |                  (Supabase)                  |
|                                     |                                              |
+-------------------------------------+----------------------------------------------+
|                                     |                                              |
|  +-----------------------------+  |  +-----------------------------------------+ |
|  |      AI Chat Agent          |  |  |          Postgres Database              | |
|  |    (LangChain / Gemini)     |  |  | (Users, Trades, Logs, Embeddings)       | |
|  +-----------------------------+  |  +-----------------------------------------+ |
|                                     |                                              |
|  +-----------------------------+  |  +-----------------------------------------+ |
|  |   Market Data Services      |  |  |              Auth (GoTrue)              | |
|  | (CoinGecko / CryptoCompare) |  |  |        (JWT / RLS Policies)             | |
|  +-----------------------------+  |  +-----------------------------------------+ |
|                                     |                                              |
|  +-----------------------------+  |  +-----------------------------------------+ |
|  |     Exchange Interface      |  |  |            Realtime Engine              | |
|  |          (CCXT)             |  |  | (WebSockets for live updates)           | |
|  +-----------------------------+  |  +-----------------------------------------+ |
|                                     |                                              |
+-------------------------------------+----------------------------------------------+
|                                     |                                              |
| <-------------> | <-------------> | <------------------ External ------------------> |
|      CI/CD      | Observability |                 Third-Party APIs                 |
| (GitHub Actions)  |   (Sentry)    |          (Binance, KMS/Vault, etc.)          |
+-----------------+---------------+------------------------------------------------+

```

## Visual Architecture Diagrams

Below are some additional diagrams illustrating the project architecture.

### Architecture Design 1

<img src="../Argtecture design1.png" alt="Architecture Design 1" width="100%">

<br>

### Project Architecture 2

<img src="../project achitecture2.png" alt="Project Architecture 2" width="100%">

<br>

### Project Architecture 3

<img src="../project architecture3.png" alt="Project Architecture 3" width="100%">


## Components

### Frontend

*   **Framework**: React with TypeScript and Vite.
*   **Responsibilities**: Renders the user interface, handles user input, and communicates with the backend via a RESTful API.

### Backend

*   **Framework**: Python with FastAPI, running in Docker containers.
*   **Responsibilities**: Exposes the API, handles business logic, and orchestrates the AI agents.

#### Backend Sub-components:

*   **AI Chat Agent**: Uses LangChain and the Google Gemini API to understand user queries and execute actions using a suite of tools.
*   **Market Data Services**: Fetches and caches data from external sources like CoinGecko and CryptoCompare.
*   **Exchange Interface**: A secure wrapper (using CCXT) for interacting with cryptocurrency exchanges like Binance.

### Data & Auth Platform

*   **Platform**: [Supabase](https://supabase.com)
*   **Database**: Postgres for all persistent data, including user profiles, trades, audit logs, and vector embeddings (`pgvector`).
*   **Authentication**: Supabase Auth (GoTrue) for user management, issuing JWTs, and enforcing Row-Level Security (RLS).
*   **Realtime**: Supabase Realtime for pushing live updates to the client over WebSockets.

## Data Flow

1.  The user interacts with the React frontend.
2.  The frontend sends API requests to the FastAPI backend.
3.  The backend processes the request, authenticating the user with Supabase Auth.
4.  If the request requires AI reasoning, the backend invokes the LangChain agent.
5.  The agent may use its tools to fetch data from market data services or place trades via the exchange interface.
6.  The backend interacts with the Supabase database to store or retrieve data.
7.  The backend returns a response to the frontend.

## Database Schema

ℹ️ **Note:** The following schemas are a representative sample. The final implementation may vary.

```sql
-- Users (Supabase Auth manages primary auth)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Encrypted API keys (ciphertext only)
CREATE TABLE user_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  provider text, -- e.g., 'binance', 'gemini'
  key_ciphertext bytea NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Trades ledger
CREATE TABLE trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  symbol text,
  side text,
  qty numeric,
  price numeric,
  status text,
  executed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Audit logs for agent and user actions
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  actor text, -- 'agent', 'user', or 'system'
  action text,
  reason text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Vector store for RAG embeddings
CREATE TABLE embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  source text,
  doc_id text,
  embedding vector(1536), -- Vector size depends on the model
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

### Row-Level Security (RLS)

⚠️ **Critical:** RLS must be enabled on all tables containing user-specific data to ensure data isolation.

```sql
-- Example RLS policy for the trades table
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own trades." ON trades
  FOR SELECT
  USING (user_id = auth.uid());
```