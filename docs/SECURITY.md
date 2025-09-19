# Security and Compliance

This document outlines the security and compliance patterns for CryptoPulse AI.

## Key Management

A secure and auditable key management system is critical.

1.  **User Input**: User supplies an exchange key via a secure frontend form. The frontend submits it to the backend over HTTPS. Raw keys are **never** stored in frontend `localStorage`.
2.  **Encryption**: The backend receives the key and uses a cloud KMS (or Vault) to encrypt it: `ciphertext = KMS.encrypt(plaintext)`.
3.  **Storage**: The resulting `ciphertext` is stored in the `user_api_keys` table in Supabase.

### Runtime Decryption

When an agent needs to place a trade:

1.  The backend calls `KMS.decrypt(ciphertext)` to get the plaintext key in memory.
2.  The plaintext key is used only in an ephemeral agent tool, then immediately purged from memory.
3.  All actions are logged to `audit_logs` (without including any key material).

### Key Rotation & Revocation

Provide an endpoint to rotate keys (re-encrypt) or revoke them (delete from the database and call `KMS.revoke`).

### CI/CD Security

CI secrets (e.g., Fly.io/KMS tokens) live in GitHub Secrets. No developer machine should hold production keys.

### Example KMS Pseudocode

Example Python (pseudo) for storing & decrypting using an AWS KMS-like API:

```python
from aws_kms import KMSClient
kms = KMSClient()

def store_user_key(user_id, provider, raw_key):
    ciphertext = kms.encrypt(raw_key)
    supabase.table('user_api_keys').insert({...,'key_ciphertext':ciphertext})

def use_key_and_place_order(api_key_row):
    raw_key = kms.decrypt(api_key_row['key_ciphertext'])  # in memory
    try:
        client = BinanceClient(api_key=raw_key['api_key'], secret=raw_key['secret'])
        res = client.create_order(...)
    finally:
        zero_memory(raw_key)  # best-effort zeroization
```

## Fraud Detection & Anomaly Architecture

-   **Data Sources**: Incoming trades, failed API calls, user login history, deposit/withdrawal patterns.
-   **Fast Rules Engine (First Line)**: Immediate flags for threshold breaches (e.g., order > X USD) and blacklisted IPs.
-   **ML/LLM Anomaly Detector (Second Line)**: Use RAG and embeddings. Feed the last N trades and user profile into an LLM to create an anomaly score. A supervised model over historic labeled fraud data can also be used for a scoring model (optional).
-   **Response**: If `anomaly_score > threshold`, mark it as an anomaly, quarantine user actions (pause autonomous mode), notify the operator, and require manual review.
-   **Human Review UI**: Anomaly page with evidence and LLM-suggested rationale for reviewers to accept/reject. Reviews are marked in `audit_logs`.

## Compliance & Continuous Audit

-   **Immutable Logs**: Keep an immutable `audit_logs` row for every decision and action: who (agent or user), what (order id), why (LM summary), evidence (tool outputs), and timestamp. This creates traceability for regulatory requests.
-   **Automated Compliance Agent**: A background `compliance_agent` periodically runs `match_regulation` for each user region and posts exceptions.
-   **Reporting**: Provide downloadable CSV/PDF audit reports for regulators. Include chained hashes (optionally on-chain) to prove immutability for critical reports.

## Region-Specific Regulatory Checklist

-   **US**: AML/KYC needed for fiat/custodial services. Advise KYC for high-dollar users even if non-custodial. Retain audit logs.
-   **EU**: Adhere to MiFID II (algorithmic trading rules, kill switch). Prepare for the EU AI Act (classify agents as high-risk). Comply with GDPR (PII controls, data subject rights).
-   **Africa (including South Africa)**: Rules are variable (check FSCA, NCA). Implement region-specific compliance plugins. Follow FATF guidance for AML/KYC for larger accounts.

## Coinbase Integration Security

-   **No Secret Logging**: Never log secret key material or include raw keys in audit logs. Log only order IDs, metadata, tool results, and LLM rationales.
-   **KMS/Vault**: Encrypt/decrypt keys using KMS/Vault. Store ciphertext in Supabase, decrypt on-demand, and purge.
-   **RLS**: Use Row Level Security on Supabase tables so users can only read their own keys/trades.
-   **2FA/MFA**: Require 2FA/MFA for large trades.
-   **Sandbox**: Use the Coinbase sandbox or testnet for development and CI integration tests.
-   **Rate Limiting**: Implement retry logic; Coinbase rate limits can be strict, so handle 429 errors gracefully.
-   **Audit Trails**: Store `audit_logs` for every agent decision and trade action.
