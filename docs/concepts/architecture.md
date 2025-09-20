# System Architecture

This document outlines the system architecture for CryptoPulse AI, designed to be a full-stack finance agent platform.

## System Architecture Overview

The system has three layers: 

*   **Frontend (TypeScript/React)**: A chat/dash- board UI (browser or mobile app) where users speak
or type commands, see text responses, and view charts or alerts. We use React (with Vite) for
performance and flexibility. The UI supports voice I/O (via Web Audio and Text-to-Speech), a
conversation view, and embeds images (charts) in chat. For rapid prototyping we might start
with Gradio/Streamlit, but production uses React or React Native . 
*   **Backend (Python FastAPI + LangChain)**: A FastAPI server handles API requests from the
frontend and runs the AI agent. FastAPI is chosen for its high performance and type-checked
request/response models . We containerize the backend (Docker) for scalability. A LangChain-
based agent (using an   AgentExecutor ) acts as the “brain” – it routes user intents to
specialized tools in a secure, sandboxed manner . Each tool is a Python function (wrapped for
LangChain)   –   for   example,   get_price() ,   place_order() ,   generate_chart() ,   or
retrieve_news() . The agent loops: the LLM core interprets a query and may output a
function call (e.g.  PlaceOrder("BTCUSDT", "BUY", 0.1) ) . The AgentExecutor executes

that call (after any needed confirmation) and returns results to the LLM for final response
generation. This “ReAct” loop (thinking → tool call → observation → answer) is managed by
LangChain . 
*   **Data & Services**: External APIs provide market data and execution. We integrate major
exchanges via their REST/WebSocket APIs (e.g. Binance, Coinbase). Using a unified library like
CCXT simplifies multi-exchange support (CCXT wraps Binance/Coinbase endpoints for price fetch
and order placement) . For example, CCXT’s  exchange.fetch_ticker("ETH/USDT")
or  exchange.create_order(...)  can be called from our tools . We also ingest data from
providers like CoinGecko or CryptoCompare for price histories, and news/sentiment APIs (e.g.
Twitter, CoinDesk headlines) to gauge market mood. Real-time data flows (via WebSockets) and
historical queries feed the agent. A vector database (e.g. Chroma or Pinecone) may store recent
news and FAQs – the LLM can do retrieval-augmented generation (RAG) by querying this
knowledge base . All user accounts and preferences are stored in a secure database (e.g.
Supabase/Postgres with row-level security); swap secrets like API keys are kept encrypted. 

### MCP Servers

The LangChain AgentExecutor communicates with MCP servers via HTTP calls to perform actions like database queries and UI automation. For more information, see the [Model Context Protocol (MCP) Integration](./mcp-integration.md) guide.

### Supporting Services and Tools:

*   **Data & Exchange APIs**: Real-time crypto prices and order book data come from Binance (via WebSockets) and CoinGecko. Orders are placed on Binance (global liquidity) using user-provided API keys. (We design for extensibility: additional exchanges or DEXes could be added as plug-in connectors.)
*   **Database and Auth (Supabase)**: Supabase (hosted Postgres) stores user profiles, settings, portfolios, and trade logs. It provides built-in Authentication. Crucially, we enforce Row-Level Security (RLS) policies so that each user can only access their own data, enhancing multi-tenant security.
*   **Deployment & Ops**: All components run in Docker containers. CI/CD is managed by GitHub Actions: on each push we run linting, unit tests (pytest for Python, Jest for TS), Snyk scans for vulnerabilities, and then build/deploy containers. We deploy globally via Fly.io, which allows multi-region cloud pods. (Fly’s free tiers can cover initial usage.) Containers include health checks and logs.
*   **Monitoring & Alerts**: We integrate Sentry in both Python and JS code to catch crashes and exceptions. We also use a metrics pipeline (e.g. Prometheus + Grafana or Fly’s built-in metrics) to track bot performance and trading activity. Alerts notify devops if errors spike or trading deviates significantly (e.g. sudden loss).

Overall, the architecture cleanly separates concerns: the AI agent in Python handles all “brains”, the TS frontend handles UI/UX, and connecting glue is well-defined via REST or WebSockets. This hybrid approach ensures we can leverage rich ML tooling in Python (LangChain, ML libraries) while delivering a modern, responsive web interface in TS.

## Key Features and Components

*   **LLM Agent Execution (Python/FastAPI)**: Upon receiving a user query or scheduled task, FastAPI invokes a LangChain AgentExecutor. For example, the agent might process “Analyze BTC trend and consider placing trades.” It will call tools (Binance price fetch, technical analysis scripts, etc.) and return a plan. The system supports multi-step actions: e.g. “check 10-day MA, if MA rising and RSI <30, place buy order”. We can also integrate voice or multimodal I/O in the future. All AI interactions respect context and (if enabled) memory of the user’s portfolio.
*   **Trade Execution**: The platform supports fully-automated trading of pre-approved strategies. In practice, the bot will generate trade orders using Binance’s REST API (with HMAC-signed keys). It tracks every order state (open, filled, cancelled) and updates internal context. As Hummingbot engineering advises, the bot “must track what happened to a user’s overall position” and handle partial fills or API errors gracefully. We ensure trades execute at market-leading speed by preferring WebSocket price feeds and only using REST when necessary. Each executed trade is logged and visible in the user dashboard.
*   **Manual vs Autonomous Modes**: By default, CryptoPulse AI operates in semi-automated mode: the AI proposes orders and displays them for user confirmation. This aligns with regulatory best practices (e.g. MiFID II’s “pre-trade controls” and kill-switch). However, power users can opt into fully autonomous mode once they trust the strategy, allowing the bot to place trades immediately. In either case, a global “panic switch” can halt all trading instantly. (We implement this via a webhook or flag the agent checks before executing any new order.)
*   **Security & Key Management**: We never store exchange API secrets in plaintext or source code. Instead, keys are saved encrypted (e.g. using Fly.io secrets or a KMS). Even during runtime, secrets are loaded only into environment variables, not logged. In line with best practices, embedding keys in code or .env files is avoided. We plan to use a cloud KMS (e.g. AWS KMS or HashiCorp Vault) to store these keys and decrypt them at use-time. Similarly, user passwords and tokens are hashed and managed by Supabase Auth. All web traffic is HTTPS, and the backend enforces RBAC via JWTs. We also scan dependencies with Snyk to catch vulnerabilities early.
## Deployment, Scalability, and Compliance
We target a global rollout with attention to regional requirements. The Fly.io deployment can spawn
instances in multiple regions (North America, EU, Asia, Africa). For performance and compliance, we can
enable region-specific hosting so that data of EU users remains in EU clouds, etc. Supabase also offers
multi-region deployments for data residency. 
Legal/regulatory constraints vary by jurisdiction . In the US, crypto trading bots must obey SEC/
CFTC rules and often require user disclaimers and risk warnings . The U.S. regulators emphasize
anti-manipulation and proper supervision of algorithmic systems . In the EU, MiFID II explicitly
requires pre-trade testing and a kill switch for algorithmic trading , and the upcoming EU AI Act will
impose stringent rules on high-risk AI (likely including trading bots) . In practice, we ensure
CryptoPulse’s design can meet these: e.g. all automated strategies can be audited, and the manual-
override satisfies the “human-in-the-loop” expectations. For each launch region (U.S., EU, UK, South
Africa, etc.), we document necessary compliance steps (KYC, tax reporting, disclaimers). As regulators
globally take “different philosophical approaches” , we remain flexible: U.S./UK releases might
require registration as an investment adviser or robust AML checks, while other regions may have
simpler crypto-exchange licensing.

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
|  |      MCP Servers            |  |  +-----------------------------------------+ |
|  | (Supabase, Playwright, etc.)|  |  |              Auth (GoTrue)              | |
|  +-----------------------------+  |  |        (JWT / RLS Policies)             | |
|                                     |  +-----------------------------------------+ |
|  +-----------------------------+  |  |            Realtime Engine              | |
|  |   Market Data Services      |  |  | (WebSockets for live updates)           | |
|  | (CoinGecko / CryptoCompare) |  |  +-----------------------------------------+ |
|  +-----------------------------+  |                                              |
|                                     |  +-----------------------------------------+ |
|  +-----------------------------+  |  |     Exchange Interface      | |
|  |          (CCXT)             |  |  |          (CCXT)             | |
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