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

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zod
*   **Backend:** Python, FastAPI, LangChain, Pydantic
*   **Database:** Supabase (PostgreSQL + pgvector)
*   **AI/ML:** Google Gemini, Ollama, OpenRouter
*   **Infrastructure:** Docker, Fly.io, GitHub Actions
*   **Protocol:** Model Context Protocol (MCP)

### Project Status (as of 2025-09-20)

*   **ADRs Created:** Three new Architectural Decision Records (ADRs) have been created to document key architectural decisions:
    *   `ADR-002: Choice of Model Context Protocol (MCP)`
    *   `ADR-003: Security and Key Management Strategy`
    *   `ADR-004: Multi-LLM Strategy`
*   **API Reference Updated:** The API reference has been updated with new endpoints and additional details for existing endpoints.
*   **New Documentation Guides:** Several new documentation guides have been created:
    *   `docs/guides/implementation-guide.md`
    *   `docs/guides/deployment-and-scaling.md`
    *   `docs/concepts/database-schema.md`
    *   `docs/guides/cicd-pipeline.md`
    *   `docs/guides/zod-validation.md`
    *   `docs/concepts/mcp-integration.md`
*   **Enhanced `README.md`:** The root `README.md` has been updated to be more comprehensive and visually appealing, with new badges and a clear structure.

## 📜 Project Rules and Best Practices

This section outlines the rules and best practices for the CryptoPulse AI project. These rules are designed to ensure that our project is built to a high standard of quality, that we can collaborate effectively, and that our codebase is easy to maintain and extend.

### 💻 Code Style and Formatting

*   **Rule:** We will use `ESLint` and `Prettier` for the frontend (TypeScript/React) and `Black` and `isort` for the backend (Python) to ensure a consistent code style.
    *   **Why it's smart:** A consistent code style makes our code easier to read and understand, which means we can work faster and make fewer mistakes. It also reduces the noise in our code reviews, so we can focus on the important stuff.
    *   **Resources:**
        *   [Setting up ESLint and Prettier for React with TypeScript](https://www.robinwieruch.de/react-eslint-prettier/)
        *   [Black: The Uncompromising Code Formatter](https://black.readthedocs.io/en/stable/)
        *   [isort: A Python utility to sort imports.](https://pycqa.github.io/isort/)

### 🧪 Testing

*   **Rule:** We will follow a comprehensive testing strategy that includes unit tests, integration tests, and end-to-end tests. We will use `Jest` for the frontend and `Pytest` for the backend.
    *   **Why it's smart:** A good test suite is like a safety net. It allows us to make changes to our code with confidence, knowing that we're not breaking anything. It also helps us to think more clearly about our code and to design it in a more modular and testable way.
    *   **Resources:**
        *   [Jest: Delightful JavaScript Testing](https://jestjs.io/)
        *   [Pytest: helps you write better programs](https://docs.pytest.org/en/7.1.x/)
        *   [Playwright: enables reliable end-to-end testing for modern web apps](https://playwright.dev/)

### 💬 Commit Messages

*   **Rule:** We will follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for our commit messages.
    *   **Why it's smart:** Conventional Commits give us a clear and consistent way to write our commit messages. This makes our commit history easy to read and allows us to automatically generate changelogs.
    *   **Resources:**
        *   [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/)

### 🌿 Branching Strategy

*   **Rule:** We will use a `GitFlow`-like branching strategy, with `main` for production, `develop` for ongoing development, and feature branches for new features.
    *   **Why it's smart:** A good branching strategy helps us to keep our codebase organized and to manage the development process effectively. It allows us to work on multiple features in parallel without stepping on each other's toes.
    *   **Resources:**
        *   [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/)

### 📚 Documentation

*   **Rule:** The documentation in the `docs` directory should always be kept up-to-date with the code.
    *   **Why it's smart:** Good documentation is essential for a successful project. It helps new developers to get up to speed quickly, and it provides a valuable resource for everyone on the team.
    *   **Resources:**
        *   [Diátaxis: A systematic framework for technical documentation authoring](https://diataxis.fr/)

### 🤖 Rules for Me (Your AI Assistant)

*   **Rule:** I will always ask for clarification if I am unsure about a request.
*   **Rule:** I will be proactive and suggest improvements to the project.
*   **Rule:** I will be transparent about my actions and decisions.
*   **Rule:** I will always follow the project's conventions and best practices.
*   **Rule:** I will keep the documentation, including this `GEMINI.md` file, up-to-date.
*   **Rule:** When faced with a problem that I cannot solve with my current knowledge, I will use web search to find a solution.
    *   **Why it's smart:** This will help us to find solutions to problems more quickly and to learn from the collective knowledge of the developer community.
    *   **Resources:**
        *   [Google Search](https://www.google.com)
        *   [Stack Overflow](https://stackoverflow.com)
        *   [GitHub](https://github.com)

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