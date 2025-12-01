import { runSimulatedConversationFlow } from "../helpers/gpt-simulator";

describe("Integration - Data consistency", () => {
  test("No data loss between MCP result and GPT formatted response", async () => {
    const flow = await runSimulatedConversationFlow(
      "I need car insurance for ZIP 90210"
    );

    const availableCarriers = flow.mcpResult.quotes
      .filter(q => q.status === "available")
      .map(q => q.carrier);

    for (const carrier of availableCarriers) {
      expect(flow.gptResponse).toContain(carrier);
    }
  });
});
