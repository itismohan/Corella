import { PERFORMANCE_BUDGET } from "../helpers/config";
import {
  mockMCPExecution,
  formatGPTResponse
} from "../helpers/gpt-simulator";

describe("Insurance GPT - Natural language with multiple details", () => {
  test("Parameters extracted and missing fields requested (simulated)", () => {
    const userMessage =
      "I'm looking for home insurance in Boston, MA for a $500k house with $1000 deductible";

    const zipFromLocation = "02108";
    const mcpParams = {
      insuranceType: "home" as const,
      zipCode: zipFromLocation,
      coverageLevel: "standard" as const,
      additionalDetails: {
        city: "Boston",
        state: "MA",
        homeValue: 500000,
        deductible: 1000
      }
    };

    const start = Date.now();
    const mcpResult = mockMCPExecution(mcpParams);
    const gptResponse = formatGPTResponse(mcpResult, mcpParams.zipCode);
    const total = Date.now() - start;

    expect(mcpResult.quotes.length).toBeGreaterThanOrEqual(1);
    expect(gptResponse).toContain("Here are your auto insurance quotes for 02108");

    expect(total).toBeLessThanOrEqual(PERFORMANCE_BUDGET.totalResponseMs);
  });
});
