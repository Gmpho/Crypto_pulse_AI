# CI/CD Pipeline

This guide provides a detailed overview of the CI/CD pipeline for the CryptoPulse AI project, which is managed using GitHub Actions.

## Workflow Overview

Our CI/CD pipeline is defined in the `.github/workflows/ci-cd.yml` file. It consists of several jobs that are triggered on push and pull request events.

### Jobs

*   **`test`**: This job runs the backend tests against a PostgreSQL database.
*   **`security-scan`**: This job uses Snyk to scan the codebase for vulnerabilities.
*   **`build-and-push`**: This job builds the Docker images for the frontend and backend and pushes them to the GitHub Container Registry.
*   **`deploy-staging`**: This job deploys the application to our staging environment on Fly.io.
*   **`deploy-production`**: This job deploys the application to our production environment on Fly.io.

## Workflow Configuration

Here is the complete configuration for our CI/CD pipeline:

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_crypto_pulse
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v4

    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
        pip install -r requirements-test.txt

    - name: Run tests
      run: |
        cd backend
        pytest -v --cov=app --cov-report=xml
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_crypto_pulse
        ENVIRONMENT: test

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/setup@v1
      with:
        version: '1.106.0'
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

    - name: Snyk monitor
      run: snyk test --all-projects --sarif-file=snyk-results.sarif

    - name: Upload SARIF file
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: snyk-results.sarif

  build-and-push:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        file: ./backend/Dockerfile.prod
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:${{ github.sha }}

    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        file: ./frontend/Dockerfile.prod
        push: true
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'

    steps:
    - name: Deploy to staging
      uses: superfly/flyctl-actions@1.3
      with:
        args: "deploy --config fly.staging.toml"
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  deploy-production:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Deploy to production
      uses: superfly/flyctl-actions@1.3
      with:
        args: "deploy --config fly.production.toml"
      env:
        FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

## Gemini AI Workflows

Our CI/CD pipeline is enhanced with a suite of AI-powered workflows that use Gemini to automate various development tasks.

### Workflow Overview

These workflows are defined in the `.github/workflows` directory and work together to provide a seamless AI-assisted development experience.

*   **`gemini-dispatch.yml`**: This workflow acts as the central dispatcher for all AI-related tasks. It is triggered by events like new pull requests, issues, or comments, and it routes the request to the appropriate workflow based on the command or event type.
*   **`gemini-invoke.yml`**: This is the core workflow for executing AI tasks. It runs the Gemini CLI with a specific prompt and context, allowing the AI to perform a wide range of tasks, from answering questions to generating code.
*   **`gemini-review.yml`**: This workflow automates the code review process. When a new pull request is opened, this workflow is triggered, and the AI reviews the code for correctness, security, and style.
*   **`gemini-triage.yml`**: This workflow helps to manage issues by automatically triaging them. When a new issue is created, the AI analyzes it and applies the appropriate labels.
*   **`gemini-scheduled-triage.yml`**: This workflow runs on a schedule to find any untriaged issues and then triggers the `gemini-triage.yml` workflow to triage them.

### Benefits

*   **Automation:** These workflows automate repetitive tasks like code review and issue triage, freeing up developers to focus on more creative and strategic work.
*   **Improved Code Quality:** By providing automated code reviews, the AI can help to identify potential issues early in the development process, leading to higher-quality code.
*   **Faster Development Cycles:** The automated workflows and instant feedback help to speed up the development process.
*   **AI-Powered Assistance:** Developers can interact with the AI directly in their pull requests and issues to get help with a wide range of tasks.
