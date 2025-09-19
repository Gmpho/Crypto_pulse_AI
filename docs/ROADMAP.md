# Development Roadmap & Testing

This document outlines the proposed development roadmap and testing strategy for CryptoPulse AI.

## Roadmap & Prioritization (12-Week Plan)

### Phase 0 (Week 0) — Scaffolding & Supabase Integration

-   [ ] Set up Supabase project, RLS policies, basic schema, and auth flows.
-   [ ] Create simple backend FastAPI endpoints and a frontend login.

### Phase 1 (Weeks 1–3) — Agent + Data

-   [ ] Implement basic LangChain agent tools: `get_price`, `simulate_order`, `get_portfolio`.
-   [ ] Integrate with CoinGecko and Binance testnet.
-   [ ] Add `trades` ledger and `audit_logs` tables.

### Phase 2 (Weeks 4–6) — Secure Keys + Dry Run Mode

-   [ ] Integrate KMS/Vault for encrypting user keys, plus rotate/revoke endpoints.
-   [ ] Implement `DRY_RUN` and `MANUAL_CONFIRM` flows.
-   [ ] Set up a CI pipeline with Snyk for security scanning.

### Phase 3 (Weeks 7–9) — Autonomy & Safety

-   [ ] Implement `AUTONOMOUS` mode with policy limits, the `check_risk_limits` tool, and a panic kill-switch.
-   [ ] Add a basic fraud rules engine and the `anomalies` table.
-   [ ] Build UI screens for manual review of anomalies.

### Phase 4 (Weeks 10–12) — Supabase AI & RAG + Scale

-   [ ] Embed documents and policy text into the vector store.
-   [ ] Use RAG for compliance checks.
-   [ ] Add a `compliance_agent` for daily checks and an audit report generator.
-   [ ] Conduct end-to-end tests, a pen-test, and deploy from staging to production.

## Testing Strategy

-   **Unit Tests**: Test each tool and DB function (using `pytest` + mocks for external APIs).
-   **Integration Tests**: Use Binance testnet keys in a CI staging environment to run `simulate_order` and `place_order` in a sandbox.
-   **E2E Tests**: Use Playwright or Cypress for the UI to simulate a manual confirmation trade and its full lifecycle.
-   **Backtesting & Paper Trading**: Run offline historical backtests and live paper trading with small amounts or on a testnet.
-   **Security Tests**: Run Snyk scans and scheduled secret scanning to detect accidental key commits. Conduct a pen test and code audit before mainnet use.
-   **Chaos Tests**: Simulate network failures and exchange downtime to ensure retries and safe failure modes.

## Observability & Runbook

-   **Metrics**: Monitor order latency, order failure rate, anomaly rate, LLM latency, and agent decision latency.
-   **Alerts**: Set up alerts for critical order failures, increases in the anomaly rate, and errors in decrypting keys.
-   **Runbook**: In case of a critical alert, the plan is to set `TRADING_PAUSED=true`, revoke suspicious API keys, review `audit_logs`, contact affected users, and run a postmortem.
