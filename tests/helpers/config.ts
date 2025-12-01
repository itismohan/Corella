export const MCP_BASE_URL = process.env.MCP_BASE_URL || "http://localhost:4000";
export const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

export const PERFORMANCE_BUDGET = {
  totalResponseMs: 12000,
  mcpToolMs: 10000,
  backendMs: 8000,
  gptFormatMs: 2000
};
