# API Reference

This document provides a reference for the proposed API endpoints for CryptoPulse AI.

## Example Endpoints (OpenAPI Style)

This is the minimal set of proposed endpoints.

-   `POST /v1/keys`
    -   **Description**: Store a user's exchange API key. The backend encrypts the key before storage.
    -   **Body**: `{ "provider": "binance", "key": "...", "secret": "..." }`

-   `GET /v1/trades`
    -   **Description**: List the current user's trades. Access is controlled by RLS.

-   `POST /v1/agent/query`
    -   **Description**: Send a query to the AI agent.
    -   **Body**: `{ "query": "Buy 0.1 BTC" }`
    -   **Returns**: A structured action, tool logs, and confidence score. See the example response below.

-   `POST /v1/trade/confirm`
    -   **Description**: Confirm a trade that was proposed by the agent when in `MANUAL_CONFIRM` mode.
    -   **Body**: `{ "trade_id": "..." }`

-   `POST /v1/admin/pause_trading`
    -   **Description**: Operator-only endpoint to act as a kill switch to pause all trading activity.

## Example Agent Query Response

An example response from the `POST /v1/agent/query` endpoint:

```json
{
  "status": "proposed",
  "action": "place_order",
  "payload": {
    "symbol": "BTCUSDT",
    "side": "BUY",
    "qty": 0.01
  },
  "confidence": 0.87,
  "tool_log": [
    {
      "tool": "get_price",
      "output": "BTC 63,200"
    }
  ],
  "audit_hint": "signal based on MA crossover and negative sentiment decline"
}
```
