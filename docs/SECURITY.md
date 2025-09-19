# Security and Compliance

This document outlines the security and compliance patterns for CryptoPulse AI.

## Secure Key Management

We enforce strong security for all secrets and keys.

*   **Backend-Only Secrets**: Never send private keys to the client. Binance and Gemini keys reside on the server and are fetched from secure storage (e.g., environment variables, a vault).
*   **Environment & Vaults**: Use `.env` files (not committed to git) or a cloud secret manager (e.g., AWS Secrets Manager, HashiCorp Vault). In Docker, pass secrets via Fly.io secrets.
*   **Least Privilege**: Create separate API keys per environment (dev, staging, prod). Binance keys should have only trading permissions (withdrawals disabled).

### Runtime Decryption & Usage

When an agent needs to place a trade:

1.  The backend retrieves the encrypted key from storage.
2.  It decrypts the key in memory using a service like AWS KMS.
3.  The plaintext key is used ephemerally by the trading tool and then immediately purged from memory.
4.  All actions are logged to `audit_logs` without including any key material.

## Network Security

*   **HTTPS**: All traffic is over HTTPS.
*   **CORS**: We configure CORS to only allow our frontend origin.
*   **Rate Limiting**: We use rate limiting and input validation on our FastAPI endpoints to prevent abuse.

## Threat Modeling (STRIDE)

We apply the STRIDE model to identify and mitigate threats:

*   **Spoofing**: A stolen private key could allow an attacker to inject fraudulent orders. 
    *   **Mitigation**: Store keys encrypted and require 2FA for admin actions. Log all API accesses for audit trails.
*   **Tampering**: An attacker could tamper with trade data.
    *   **Mitigation**: Use database-level security (like RLS) and log chained hashes of critical reports to ensure immutability.
*   **Repudiation**: A user could deny making a trade.
    *   **Mitigation**: The immutable `audit_logs` provide a clear record of every action taken by a user or an agent.
*   **Information Disclosure**: A bug could expose user data.
    *   **Mitigation**: Enforce RLS so users can only see their own data. Run regular security scans (Snyk) to find and fix vulnerabilities.
*   **Denial of Service**: An attacker could flood the API with requests.
    *   **Mitigation**: Implement strict rate limiting on all public endpoints.
*   **Elevation of Privilege**: An attacker could gain admin access.
    *   **Mitigation**: Enforce the principle of least privilege on all API keys and user roles. Secure admin endpoints with 2FA.

## LLM Safety

The AI assistant is guided to perform analysis only—it “reasons” and suggests trades but requires explicit user sign-off. We strictly sanitize user inputs in prompts and disable open-ended code execution. The function-calling interface itself prevents the LLM from inventing unauthorized actions.

## Compliance

*   **Audit Logs**: If deployed commercially, we will add KYC/AML controls. The detailed, immutable `audit_logs` are designed to support compliance and regulatory requests.
*   **GDPR/Regional Laws**: For EU users, we will ensure GDPR compliance (PII controls, data subject rights). The architecture is designed to be adaptable to regional data residency requirements.