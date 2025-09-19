# AI Agent Design

This document covers the design of the LangChain-powered AI agents in CryptoPulse AI.

## LangChain Agent Tools

The agent will be equipped with a suite of tools to interact with the market, manage user portfolios, and ensure compliance.

### Core Tools

-   `get_price(symbol)`: Fetches the live price from Binance / CoinGecko.
-   `get_orderbook(symbol, depth)`: Gets an L2 snapshot.
-   `place_order(user_id, client_order_id, symbol, side, qty, type)`: Places an order using decrypted keys and logs the results in `trades` and `audit_logs`.
-   `simulate_order(user_id, ...)`: Runs a pre-flight simulation using historical liquidity and posts simulated fills (for `DRY_RUN` mode).
-   `get_user_portfolio(user_id)`: Reads the user's portfolio from `trades` and external wallet connectors.
-   `write_audit(user_id, actor, action, reason, details)`: Appends a record to the `audit_logs`.

### Security & Ops Tools

-   `check_risk_limits(user_id, order)`: Enforces rules like `MAX_USD_PER_ORDER`, `MAX_LEVERAGE`, etc. Returns `OK` or `REJECT` with a reason.
-   `flag_anomaly(user_id, evidence)`: Pushes an anomaly record and can optionally trigger a Slack/Discord alert.
-   `require_2fa(user_id, action)`: Requires MFA confirmation for high-value trades.

### Compliance Tools

-   `match_regulation(user_id, trade, region)`: Uses RAG against stored regulatory snippets (in embeddings) to return a compliance verdict.
-   `generate_audit_report(user_id, timeframe)`: Summarizes trades, exceptions, and agent rationales using an LLM for explanations.

## Agent Flow Example: Autonomous Order

1.  The agent evaluates the market and decides to **BUY 0.1 BTC**.
2.  It calls `check_risk_limits` -> `OK`.
3.  It calls `simulate_order` -> returns expected slippage.
4.  It calls `place_order(...)`. The backend decrypts the key ephemerally, calls the Binance API, and writes to `trades` and `audit_logs`.
5.  The agent calls `write_audit(..., reason=LLM_explanation)` with a structured chain-of-thought summary.
6.  If a compliance rule is violated, the agent stops, calls `write_audit(..., action='blocked')`, and creates an anomaly.

**Important**: When writing chain-of-thought or LLM internal reasoning to logs, do not store sensitive prompts that include secret tokens. Store only structured rationales (action, data inputs, outputs, confidence).

## RAG & Supabase Embeddings

When the agent needs to check regulations or past decisions, it will use vector search.

1.  **Create Embeddings**: Policy docs, regulatory texts, past audit reasons, and news are embedded and stored (using the same model family as the reasoning agent if possible).
2.  **Query**: The agent queries for the top-K most similar documents to the current context.
3.  **Prompt**: The RAG results are provided to the LLM in the prompt with an instruction like: *"Only use these snippets for the compliance check."*

### Example RAG Query Endpoint (FastAPI)

```python
@app.post("/v1/agent/compliance_check")
def compliance_check(payload: ComplianceRequest, user=Depends(get_current_user)):
    rows = supabase.rpc('match_embeddings', {'query_vector':payload.vector,'top_k':5}).execute()
    # feed rows to LLM with prompt template
    verdict = llm.run(prompt_with_snippets)
    return verdict
```

## Coinbase Integration with LangChain

The `place_order_coinbase` function will be wrapped in a LangChain `Tool` that the agent can call.

```python
from langchain.agents import Tool

coinbase_place_tool = Tool(
    name="PlaceOrderCoinbase",
    func=place_order_coinbase, # your implementation
    description="Place a market or limit order on Coinbase Exchange for an authenticated user."
)
```

### Safety Guardrails for Coinbase Tool

-   The `place_order_coinbase` tool **must** call `check_risk_limits()` first.
-   In `MANUAL_CONFIRM` mode, the tool must return a `proposed_order` object to the frontend for confirmation without placing the order.
-   Keys are only decrypted and used if the mode is `AUTONOMOUS` and all safety checks pass.
