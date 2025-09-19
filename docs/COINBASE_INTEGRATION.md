# Coinbase Integration Guide

This document explains how to integrate Coinbase into the CryptoPulse AI platform, covering both non-custodial wallet interactions and custodial exchange trading.

## Integration Summary

There are two primary ways to integrate Coinbase:

1.  **Coinbase Wallet (Client-Side, Non-Custodial)**
    -   Uses the `@coinbase/wallet-sdk` to connect to a user's wallet (similar to MetaMask).
    -   The user retains control of their private keys.
    -   Ideal for on-chain interactions like DEX swaps, token transfers, and signing messages (e.g., Sign-In with Ethereum).

2.  **Coinbase Exchange API (Server-Side, Custodial)**
    -   Users provide their Coinbase Exchange API keys (key, secret, passphrase).
    -   Keys are stored securely on the server (encrypted via KMS/Vault, with ciphertext in Supabase).
    -   The backend uses these keys to programmatically place trades on the user's behalf.

CryptoPulse AI will support both to offer a full range of options.

## Frontend Integration: Coinbase Wallet

### Installation

```sh
npm install @coinbase/wallet-sdk ethers
```

### Connecting the Wallet

This example uses `@coinbase/wallet-sdk` to create an `ethers` provider.

```typescript
// src/services/coinbaseWallet.ts
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';

const APP_NAME = 'CryptoPulse AI';
const APP_LOGO_URL = 'https://your.app/logo.png';

export function createCoinbaseProvider(rpcUrl: string, chainId = 1) {
  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: APP_NAME,
    appLogoUrl: APP_LOGO_URL,
    darkMode: false,
  });

  // rpcUrl: your Infura/Alchemy or public RPC for the network
  const provider = coinbaseWallet.makeWeb3Provider(rpcUrl, chainId);
  return new ethers.providers.Web3Provider(provider as any);
}

// Example usage in your UI
import { createCoinbaseProvider } from './services/coinbaseWallet';

async function connectWallet() {
  try {
    const RPC_URL = import.meta.env.VITE_RPC_URL; // From .env
    const provider = createCoinbaseProvider(RPC_URL, 1);

    // Request accounts
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log('User connected', address);

    // Example: Sign a message for authentication (Sign-In with Ethereum)
    const signature = await signer.signMessage('Sign to authenticate to CryptoPulse');

    // Send signature to backend for verification
    await fetch('/api/auth/siwe', {
      method: 'POST',
      body: JSON.stringify({ address, signature }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('wallet connect error', err);
  }
}
```

## Backend Integration: Custodial Trading

The flow for handling user API keys for the Coinbase Exchange is the same as for other exchanges, prioritizing security.

### Example Order Placement (Pseudo-Python)

This pseudocode shows how the backend would place an order.

```python
# backend/tools/coinbase_tool.py (pseudo)
import hmac, hashlib, time, base64, requests, json
from app.kms import decrypt_secret  # your KMS wrapper
from app.db import supabase_client

COINBASE_API_BASE = "https://api.exchange.coinbase.com"

def _sign_cb(access_key, secret_key, timestamp, method, request_path, body=""):
    message = f'{timestamp}{method}{request_path}{body}'
    signature = base64.b64encode(hmac.new(secret_key.encode(), message.encode(), hashlib.sha256).digest()).decode()
    return signature

def place_order_coinbase(user_id, client_order_id, symbol, side, qty, price=None, order_type='market'):
    # 1. Fetch and decrypt user's API key
    key_row = supabase_client.table('user_api_keys').select('*').eq('user_id', user_id).eq('provider','coinbase').single().execute()
    ciphertext = key_row['key_ciphertext']
    creds = decrypt_secret(ciphertext)  # returns dict with api_key, api_secret, passphrase

    # 2. Create and sign the request
    ts = str(int(time.time()))
    path = "/orders"
    body = {
      "product_id": symbol,
      "side": side.lower(),
      "size": str(qty),
      "type": order_type
    }
    body_json = json.dumps(body)
    signature = _sign_cb(creds['api_key'], creds['api_secret'], ts, 'POST', path, body_json)

    headers = {
      'CB-ACCESS-KEY': creds['api_key'],
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': ts,
      'CB-ACCESS-PASSPHRASE': creds['passphrase'],
      'Content-Type': 'application/json'
    }

    # 3. Send the request
    resp = requests.post(f"{COINBASE_API_BASE}{path}", headers=headers, data=body_json)

    # 4. Log results and return
    # log resp into trades & audit_logs
    return resp.json()
```

**Notes**:

-   Coinbase Exchange signing uses HMAC with a timestamp and passphrase. Follow the official documentation precisely.
-   Use the sandbox for testing: `https://public.sandbox.exchange.coinbase.com`.

## Wallet vs. Exchange: When to Use Which

-   **On-chain interactions** (DEX swaps, ERC-20 transfers, NFTs): Use the **Coinbase Wallet SDK** (client-side).
-   **Centralized exchange trading** (order book, market orders): Use the **Coinbase Exchange API** (server-side with API keys).
-   **Authentication**: Use **Sign-In-With-Ethereum (SIWE)** via the Coinbase Wallet for a great UX to verify a user controls an address.

## Testing Tips

-   Use the Coinbase sandbox to run integration tests.
-   Create automated CI jobs that run `simulate_order` (paper trade) and `place_order` on the sandbox.
-   Add tests that assert KMS decryption and zeroization patterns to avoid memory leaks of secrets.
