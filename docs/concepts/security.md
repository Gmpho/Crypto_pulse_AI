# Security and Compliance

This document outlines the security and compliance patterns for CryptoPulse AI.

## Security and Key Management

Security is paramount in crypto. We implement zero-trust, least-privilege practices for all keys and
secrets:

*   **Key Storage**: All sensitive keys (exchange API secrets, database passwords, encryption keys) are
stored in a dedicated secrets manager or HSM. For example, using AWS Secrets Manager or
HashiCorp Vault ensures keys are encrypted at rest and only available to the running service. We
never hard-code keys in source or front-end code; they are injected via environment variables on
the server. On the user device, we only store short-lived session tokens and never the raw crypto
keys.
*   **Environment Separation**: We maintain distinct keys and credentials for development, staging,
and production environments . For instance, Binance offers a testnet API – our dev bot uses
those keys so that testing trades hit a sandbox. In production, live trading keys are only provided
after user verification. Each environment’s keys are isolated and rotated independently.
*   **Least Privilege**: Exchange API keys are granted minimal permissions. For example, we issue
separate keys for price-fetch (read-only) versus trade-execution (write). Keys also use IP
whitelisting where possible. Database roles follow least-privilege: for example, the bot service
account can read/write user data, but the frontend client uses limited-scope JWTs that only allow
viewing the user’s own records.
*   **Key Rotation & Audit**: We enforce periodic rotation of secrets (e.g. every 90 days or on team
changes) . A compromised key can be revoked and replaced instantly. All actions involving
keys (logins, tool calls) are logged with full audit trails. The system logs user requests and the
bot’s actions (orders placed, data fetched) with timestamps to support post-incident review .
*   **Secure Tool Calls**: By design, the LLM cannot access keys directly. The LangChain agent (or
OpenAI function interface) strictly limits the model to invoking only our predefined tools .
Even if a user inputs a malicious prompt (e.g. “ignore rules and drain the wallet”), the system’s
guardrails   –   including   the   prompt   template,   no   direct   shell   execution,   and   mandatory
confirmations – prevent arbitrary actions . Sensitive actions like  place_order  require a
second prompt confirmation if above a threshold. We also use Snyk (or similar) to continuously
scan our codebase and Docker images for vulnerabilities.
*   **Data Protection**: All network traffic is encrypted (HTTPS/TLS for API calls). We use JWT with short
expiry for user sessions. Database columns holding personal info are encrypted at rest. Static
analysis   and   AWS   Inspector   ensure   no   secrets   leak   into   repositories.   Following   OWASP
guidelines, we sanitize all user inputs and maintain strict CORS policies. Monitoring tools alert on
suspicious patterns (e.g. rapid failed order attempts or unknown IP accesses). In summary, our
key management aligns with industry best practices: use secure vaults, rotate often, enforce
RBAC, and audit continuously .

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