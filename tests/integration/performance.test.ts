import { runSimulatedConversationFlow } from "../helpers/gpt-simulator";
import { PERFORMANCE_BUDGET } from "../helpers/config";

describe("Integration - Performance", () => {
  test("End-to-end simulated flow under performance budgets", async () => {
    const flow = await runSimulatedConversationFlow(
      "I need car insurance for ZIP 90210"
    );

    expect(flow.totalResponseTime).toBeLessThanOrEqual(
      PERFORMANCE_BUDGET.totalResponseMs
    );
    expect(flow.mcpResult.responseTime).toBeLessThanOrEqual(
      PERFORMANCE_BUDGET.backendMs
    );
  });
});
