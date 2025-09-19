# Gemini Project Context & Operational Playbook

This file contains context for the Gemini AI assistant to help it understand the project, its goals, and how to best assist in its development.

## Project: CryptoPulse AI

CryptoPulse AI is an AI-powered cryptocurrency trading platform.

### Vision

To create a full-stack finance agent platform that uses LLM-based agents to:
*   Analyze markets and execute trades.
*   Detect fraud and anomalies in real-time.
*   Generate compliance audits and reports.

### Core Differentiators

*   **Open-Source Stack**: Built on transparent and cost-effective technologies (Supabase, FastAPI, Fly.io).
*   **Security-First**: Emphasizes threat modeling, secure key management, and continuous monitoring.
*   **Production-Ready**: Designed as a robust microservices architecture with full CI/CD and observability.

### Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **Backend**: Python, FastAPI, LangChain
*   **Database**: Supabase (Postgres + pgvector)
*   **Deployment**: Docker, Fly.io

### Project Status (as of 2025-09-19)

*   **Comprehensive Documentation:** The project now has a well-structured and comprehensive documentation suite in the `docs` directory, including architectural diagrams, ADRs, and a full-stack getting started guide.
*   **Enhanced `README.md`:** The main `README.md` has been enhanced to be a visually appealing and informative entry point for the project.
*   **Robust `.gitignore`:** The project has a comprehensive `.gitignore` file that is aligned with the full-stack nature of the project.
*   **`.env.example`:** An example environment file has been created to facilitate project setup.

## Gemini's Role & Operational Principles

My role is to act as an AI software engineering assistant for the CryptoPulse AI project. I will adhere to the following principles:

*   **Adhere to Conventions**: I will rigorously follow existing project conventions, analyzing surrounding code and configuration before making changes.
*   **Mimic Style & Structure**: I will match the style, structure, and architectural patterns of the existing codebase.
*   **Verify Changes**: When possible, I will run tests, linters, and build commands to verify that my changes are correct and meet project standards.
*   **Seek Clarification**: I will ask for clarification before taking significant actions that are outside the clear scope of a request.

## User Preferences

*(You can add your preferences here. For example:)*
*   *Please always run the linter after making code changes.*
*   *I prefer smaller, more frequent commits.*