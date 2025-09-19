# System Architecture

This document outlines the system architecture for CryptoPulse AI, designed to be a full-stack finance agent platform.

## Overview

We propose a modern, AI-driven cryptocurrency trading platform that couples a React/TypeScript frontend with a Python FastAPI backend running LLM-based agents (via LangChain) to analyze markets and execute trades. The frontend dashboard (CryptoPulse AI) presents real-time charts and an AI chat assistant; the backend handles data aggregation, LLM reasoning (Google Gemini), and secure order execution.

### Key Attributes:

*   **Hybrid Python–TypeScript Stack**: React + Tailwind CSS on the client; Python (FastAPI) for AI and trading logic. This separation lets us leverage Python’s AI ecosystem while providing a responsive web UI.
*   **LLM Integration**: We use Google’s Gemini API (via Google AI Studio) for large-context market analysis, with fallbacks to open models (Ollama/OpenRouter) for resiliency.
*   **Secure Key Management**: All API keys are stored only on the server side, encrypted at rest or in a vault.
*   **Cloud Deployment & CI/CD**: Services are containerized (Docker) and deployed on Fly.io for global low-latency delivery. GitHub Actions pipelines handle linting, testing, security scans, and automated deployment.
*   **Observability & Security**: We integrate Sentry for error/performance monitoring and follow best practices like rate limits and audit logs.

## High-Level Architecture

The system has two tiers: a **Client** (React/TS dashboard) and a **Server** (Python API + agents).

*   **AI Chat Agent (Backend)**: A Python service that uses LangChain’s `AgentExecutor` to give the LLM access to tools for market tasks.
*   **Market Data Services**: Python modules that fetch cryptocurrency prices (e.g., CoinGecko) and news (e.g., CryptoCompare). These services implement circuit breakers and caching.
*   **Exchange Interface**: A secure wrapper (e.g., CCXT) for exchange APIs like Binance to handle trades.
*   **Data & Auth (Supabase)**: We use Supabase (Postgres) for user and session data. Supabase Auth issues JWTs and enforces Row-Level Security (RLS).
*   **Infrastructure & CI/CD**: Components run in Docker. GitHub Actions automates testing, scanning, building, and deployment to Fly.io.

## Data and API Integration

We aggregate data from multiple sources:

*   **Price Data**: CoinGecko and exchange APIs for live and historical prices (OHLCV).
*   **News & Social Feeds**: CryptoCompare News API, RSS feeds, or Twitter for market news.
*   **Exchange (Binance)**: The Binance spot API powers order execution and account queries. We also monitor Binance’s websockets for real-time fill/status updates.
*   **Database (Supabase/Postgres)**: All persistent data lives in a Postgres DB, including user profiles, chat transcripts, trade history, and configurations.

## Database Schema

Here are the concrete schemas for Postgres via Supabase.

```sql
-- Users (Supabase Auth will manage primary auth, but we keep a profile)
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  role text default 'user',
  created_at timestamptz default now()
);

-- Encrypted API keys (ciphertext only)
create table user_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  provider text, -- 'binance','gemini','openrouter'
  key_ciphertext bytea not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- Trades ledger
create table trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  client_order_id text,
  exchange_order_id text,
  symbol text,
  side text,
  qty numeric,
  price numeric,
  status text,
  executed_at timestamptz,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Audit logs & rationales
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  actor text, -- 'agent','user','system'
  action text,
  reason text,
  details jsonb,
  created_at timestamptz default now()
);

-- Anomalies / fraud events
create table anomalies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  model_score numeric,
  category text,
  evidence jsonb,
  reviewed boolean default false,
  created_at timestamptz default now()
);

-- Vector store: embeddings for files/news/agent memory
create table embeddings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  source text,
  doc_id text,
  embedding vector(1536), -- model dependent
  metadata jsonb,
  created_at timestamptz default now()
);
```

### Row Level Security (RLS) Example

```sql
-- example RLS for trades
alter table trades enable row level security;
create policy "user_is_owner" on trades
  using (user_id = auth.uid());
```