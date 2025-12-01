import { runSimulatedConversationFlow } from "../helpers/gpt-simulator";
import { PERFORMANCE_BUDGET } from "../helpers/config";

describe("Insurance GPT - Minimal Input Flow (E2E)", () => {
  test("User requests auto insurance with ZIP code in natural language", async () => {
    const userMessage = "I need car insurance for ZIP 90210";

    const result = await runSimulatedConversationFlow(userMessage);

    expect(result.mcpCall.toolName).toBe("get_insurance_quotes");
    expect(result.mcpCall.parameters).toMatchObject({
      insuranceType: "auto",
      zipCode: "90210",
      coverageLevel: "standard"
    });

    expect(result.mcpResult.quotes.length).toBeGreaterThanOrEqual(3);
    expect(result.mcpResult.quotes[0]).toHaveProperty("carrier");
    expect(result.mcpResult.quotes[0]).toHaveProperty("premium");

    const response = result.gptResponse;

    expect(response).toContain("Here are your auto insurance quotes for 90210");
    expect(response).toMatch(/Progressive: \$1,180\/year/);
    expect(response).toContain("Geico");
    expect(response).toContain("State Farm");
    expect(response).toContain("🏆 **Best Value**");
    expect(response).toContain("Would you like more details on any of these?");

    expect(result.mcpResult.responseTime).toBeLessThanOrEqual(
      PERFORMANCE_BUDGET.backendMs
    );
    expect(result.totalResponseTime).toBeLessThanOrEqual(
      PERFORMANCE_BUDGET.totalResponseMs
    );
  });
});
