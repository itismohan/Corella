import { runStatefulConversation } from "../helpers/gpt-simulator";

describe("Insurance GPT - True multi-turn state machine", () => {
  test("Gradual slot filling for auto insurance", async () => {
    const messages = [
      "I need car insurance",
      "90210",
      "Standard"
    ];

    const result = await runStatefulConversation(messages);

    expect(result.mcpCall.parameters.insuranceType).toBe("auto");
    expect(result.mcpCall.parameters.zipCode).toBe("90210");
    expect(result.mcpCall.parameters.coverageLevel).toBe("standard");

    // Ensure at least one GPT clarification/confirmation turn happened
    const gptTurns = result.transcript.filter(t => t.speaker === "gpt");
    expect(gptTurns.length).toBeGreaterThanOrEqual(1);
  });
});
