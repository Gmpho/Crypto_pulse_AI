# System Architecture

This document outlines the system architecture for CryptoPulse AI, designed to be a full-stack finance agent platform.

## High-Level Summary

Extend CryptoPulse AI into a full-stack finance agent platform by adding Supabase AI + vector search, event-streaming, compliance/fraud tooling, and specialized LangChain tools so LLM agents can (1) detect fraud & anomalies in realtime, (2) generate compliance audits and reports, (3) perform automated portfolio management, while keeping keys secure, auditable, and regionally compliant.

## Major Architectural Additions

-   **Supabase AI + pgvector**: Store embeddings for news, audit logs, policy docs and use RAG for LLM context (regulatory rules, past trades, explanations).
-   **Streaming & Event Layer**: WebSocket or message broker (Redis Streams, RabbitMQ) to capture every trade event, webhook and LLM tool call for real-time detection and audit.
-   **Fraud & Anomaly Service**: Lightweight rules engine + LLM anomaly detector (uses behavioral baselines + embeddings + supervised signals).
-   **Compliance & Continuous Audit Module**: Background agent that compares transactions vs. applicable policies and writes exception rationales to `audit_logs`.
-   **Strategy Execution Sandbox & Gating**: Multi-tier modes: `DRY_RUN`, `MANUAL_CONFIRM`, `AUTONOMOUS` with operator gating and `MAINNET_ENABLE` boolean.
-   **Secrets / KMS**: Move all keys into KMS/Vault, store only ciphertext in Supabase; decrypt at runtime in memory only.
-   **Observability & Alerts**: Sentry + Prometheus metrics for latency, order failures, anomaly rate; Slack/Discord alerts for critical exceptions.

## Supabase Integration

Supabase will be used for Auth, Postgres, Realtime, and pgvector.

-   **Auth**: Supabase Auth (JWT) for users. Use RLS policies for per-user isolation.
-   **Data**: Postgres tables for `users`, `api_keys` (ciphertext), `trades`, `audit_logs`, `anomalies`, `embeddings`.
-   **Vector Search**: `pgvector` for news embeddings, past reports, to support RAG for agents.
-   **Edge Functions (optional)**: Small serverless functions to validate webhooks or pre-process data before inserting into Postgres.
-   **Realtime**: Supabase Realtime to push trade & agent events to the frontend or ops channels.

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

Allow users to only access their own rows.

```sql
-- example RLS for trades
alter table trades enable row level security;
create policy "user_is_owner" on trades
  using (user_id = auth.uid());
```
