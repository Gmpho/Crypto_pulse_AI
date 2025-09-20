# ADR-002: Choice of Model Context Protocol (MCP)

**Date:** 2025-09-20

**Status:** Accepted

## Context

The CryptoPulse AI platform requires a secure and standardized way for the LLM-based agent to communicate with various internal and external services, such as the database, UI automation tools, and third-party APIs. The communication protocol needs to be secure, auditable, and extensible.

## Decision

We have decided to adopt the Model Context Protocol (MCP) for communication between the LLM agent and the various services in our platform. MCP provides a standardized and secure way for LLM-based clients to call servers that expose data, actions, and tools.

## Rationale

The decision to use MCP is based on the following factors:

*   **Standardization:** MCP provides a standard way for LLM agents to communicate with services, which avoids the need for custom-built integrations and improves the reliability and auditability of the system.
*   **Security:** MCP is designed with security in mind, providing features like authentication, authorization, and audit logging. This is crucial for a financial application like CryptoPulse AI, where security is a top priority.
*   **Discoverability:** MCP servers can be registered with a service like Smithery.ai, making them discoverable to other services and clients. This will make it easier to extend the platform with new services in the future.
*   **Ecosystem:** The MCP ecosystem is growing, with support from companies like Supabase and a growing number of community-driven projects. This provides a solid foundation for building our platform.

## Consequences

*   **Positive:**
    *   Improved security and auditability of the system.
    *   Easier integration of new services.
    *   Better separation of concerns between the LLM agent and the services.
*   **Negative:**
    *   Introduces a new technology to the stack, which requires learning and maintenance.
    *   Adds a small amount of overhead to the communication between the agent and the services.
