# API Reference

This document provides a reference for the proposed API endpoints for CryptoPulse AI.

## Authentication

### `POST /api/auth/siwe/nonce`

*   **Description**: Get a nonce for Sign-In with Ethereum (SIWE) authentication.
*   **Returns**: `{ "nonce": "..." }`

### `POST /api/auth/siwe/verify`

*   **Description**: Verify the SIWE message and create a session.
*   **Body**: `{ "message": "...", "signature": "..." }`
*   **Returns**: `{ "address": "..." }`

## Agent

### `POST /api/agent/query`

*   **Description**: Send a query to the AI agent.
*   **Body**:
    ```json
    {
      "user_id": "...",
      "prompt": "Buy 0.1 BTC",
      "dry_run": true
    }
    ```
*   **Returns**: A structured action, tool logs, and confidence score. See the example response below.

**Example Agent Query Response**

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

## Exchange

### `POST /api/exchange/link`

*   **Description**: Link a user's exchange account.
*   **Body**: `{ "provider": "binance", "key": "...", "secret": "..." }`

## Transactions

### `POST /api/tx/notify`

*   **Description**: Notify the backend of a new transaction.
*   **Body**: `{ "tx_hash": "..." }`

