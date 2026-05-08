# MCP Testing Framework

This repo contains a Jest + TypeScript based testing framework for an **Insurance GPT** that runs over **MCP (Model Context Protocol)** and returns multi-carrier quotes directly inside ChatGPT.

## What this provides

- Layered tests:
  - **E2E conversation flows** (simulated GPT + MCP + backend)
  - **MCP protocol tests**
  - **Backend API tests**
  - **Integration tests**
  - **Error and edge-case tests**
- MCP client and API client helpers
- GPT conversation simulator (for deterministic tests)
- Mock data for carriers and users
- Clear configuration and extension points

> Note: This is structured so you can plug in your **real MCP server** and **real backend** by changing environment variables.

---

## Getting Started

```bash
npm install
npm test
```

### Environment Variables

Create a `.env` or export these when you run tests:

- `MCP_BASE_URL` – base URL of your MCP server  
  Example: `http://localhost:4000`
- `API_BASE_URL` – base URL of your DomainGPT backend  
  Example: `http://localhost:5000`

If these are not set, tests will default to `http://localhost:4000` and `http://localhost:5000`.

---

## Folder Structure

```text
tests/
  e2e/
  mcp/
  api/
  integration/
  helpers/
  mocks/
```

Each directory contains focused tests as described in the main ChatGPT prompt.

### Adding New Tests

1. Add a new `*.test.ts` file in the appropriate folder.
2. Reuse helpers from `tests/helpers` where possible.
3. Add mock data under `tests/mocks` if needed.
4. Run `npm test` and ensure all tests pass in under 5 minutes.

---
