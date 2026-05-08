#CORELLA- MCP Testing Framework

This repo contains a Jest + TypeScript based testing framework for a **Domain GPT** that runs over **MCP (Model Context Protocol)** and returns multi-carrier quotes directly inside ChatGPT.

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

## ✅ Implementation Summary

### **Core Infrastructure**
1. **Type System** (`src/types/domain.ts`)
   - `DomainConfig` interface for consistent structure
   - `MCPToolDefinition` for tool schemas
   - `TestContext` for test execution
   - `DomainValidator` for custom validation

2. **Domain Loader** (`src/config/domain-loader.ts`)
   - Dynamic configuration loading via `DOMAIN_CONFIG` env var
   - Automatic validation of domain configs
   - Support for multiple domains without code changes

3. **Domain Base Factory** (`src/config/domain-base.ts`)
   - `createBaseDomainConfig()` - Reduces boilerplate
   - `createMCPTool()` - Consistent tool definitions
   - `createMockDataGenerator()` - Reusable factory pattern

### **Pre-Built Domain Configurations**

1. **Insurance** (`insurance.config.ts`) - Multi-carrier quotes
2. **Healthcare** (`healthcare.config.ts`) - Patient care coordination  
3. **E-Commerce** (`ecommerce.config.ts`) - Product catalog & orders

Each includes:
- Domain-specific MCP tools
- Mock data generators
- Custom validators
- Configurable endpoints

### **Enhanced package.json**
- New npm scripts for domain-specific testing:
  - `npm run test:domain:healthcare`
  - `npm run test:domain:ecommerce`
  - `npm run test:all-domains`
- Updated metadata reflecting domain-agnostic nature
- Performance testing support

### **Documentation**
- **README.md** - Complete guide with examples for all domains
- **domain-configs/README.md** - Custom domain creation guide
- **.env.example** - Environment variable reference

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

## 🎯 Key Benefits

✅ **Write tests once** - Works across any domain  
✅ **Switch domains** - Just change `DOMAIN_CONFIG` env variable  
✅ **Extensible** - Create custom domains in minutes  
✅ **Type-safe** - Full TypeScript support  
✅ **Zero boilerplate** - Use provided base factories  
✅ **Production-ready** - Layered testing with real protocols  

Now your framework supports **Insurance, Healthcare, E-Commerce, or any custom domain** you need!
