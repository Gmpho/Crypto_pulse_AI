# ADR-004: Multi-LLM Strategy

**Date:** 2025-09-20

**Status:** Accepted

## Context

The CryptoPulse AI platform relies on a Large Language Model (LLM) to power its AI agent. The choice of LLM can have a significant impact on the performance, cost, and reliability of the platform. Relying on a single LLM provider can also introduce a single point of failure.

## Decision

We have decided to adopt a multi-LLM strategy with fallback logic. Our primary LLM will be Google's Gemini, but we will also integrate with other LLM providers, such as OpenRouter and Ollama, to provide fallback options in case of an outage or performance degradation with our primary provider.

## Rationale

The decision to use a multi-LLM strategy is based on the following factors:

*   **Reliability:** By having multiple LLM providers, we can ensure that our platform remains available even if one of our providers experiences an outage.
*   **Performance:** We can use different LLMs for different tasks, depending on the performance requirements of each task. For example, we can use a faster, less expensive LLM for simple tasks, and a more powerful, more expensive LLM for complex tasks.
*   **Cost:** We can optimize our costs by using the most cost-effective LLM for each task.
*   **Flexibility:** A multi-LLM strategy gives us the flexibility to switch between different LLMs as new models become available and as the performance and cost of existing models change.

## Consequences

*   **Positive:**
    *   Improved reliability and availability of the platform.
    *   Improved performance and cost-effectiveness.
    *   Greater flexibility to adapt to changes in the LLM market.
*   **Negative:**
    *   Adds complexity to the development and maintenance of the platform.
    *   Requires careful management of the different LLM providers and their APIs.
