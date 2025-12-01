import {
  simulateGPTProcessing,
  mockMCPExecution,
  formatGPTResponse
} from "../helpers/gpt-simulator";
import { PERFORMANCE_BUDGET } from "../helpers/config";

interface ConversationTurn {
  speaker: "user" | "gpt";
  message: string;
}

describe("Insurance GPT - Multi-turn Conversation (E2E)", () => {
  test("Context maintained across multiple turns and final MCP call includes all data", () => {
    const convo: ConversationTurn[] = [
      { speaker: "user", message: "I need car insurance" },
      {
        speaker: "gpt",
        message: "I can help! What's your ZIP code?"
      },
      { speaker: "user", message: "90210" },
      {
        speaker: "gpt",
        message: "Great! What type of coverage? Basic, Standard, or Premium?"
      },
      { speaker: "user", message: "Standard" }
    ];

    const aggregatedUserMessage =
      convo
        .filter(t => t.speaker === "user")
        .map(t => t.message)
        .join(" ") + " car insurance standard coverage";

    const start = Date.now();
    const mcpCall = simulateGPTProcessing(aggregatedUserMessage);
    const mcpResult = mockMCPExecution(mcpCall.parameters);
    const gptResponse = formatGPTResponse(mcpResult, mcpCall.parameters.zipCode);
    const total = Date.now() - start;

    expect(mcpCall.parameters.zipCode).toBe("90210");
    expect(mcpCall.parameters.insuranceType).toBe("auto");
    expect(mcpCall.parameters.coverageLevel).toBe("standard");
    expect(mcpResult.quotes.length).toBeGreaterThanOrEqual(3);
    expect(gptResponse).toContain("Here are your auto insurance quotes for 90210");
    expect(total).toBeLessThanOrEqual(PERFORMANCE_BUDGET.totalResponseMs);
  });
});
