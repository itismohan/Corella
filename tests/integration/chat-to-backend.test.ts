import { runSimulatedConversationFlow } from "../helpers/gpt-simulator";
import { apiClient } from "../helpers/api-client";

describe("Integration - Chat to backend", () => {
  test("Data flows consistently from chat to backend payload", async () => {
    const userMessage = "Get me auto insurance quotes for ZIP 90210";

    const flow = await runSimulatedConversationFlow(userMessage);

    const spy = jest
      .spyOn(apiClient, "generateQuotes")
      .mockResolvedValue({
        data: { quotes: flow.mcpResult.quotes },
        responseTime: flow.mcpResult.responseTime
      });

    const payload = {
      insuranceType: flow.mcpCall.parameters.insuranceType,
      zipCode: flow.mcpCall.parameters.zipCode,
      minimal: true
    };

    const { data } = await apiClient.generateQuotes(payload);

    expect(data.quotes.length).toBe(flow.mcpResult.quotes.length);
    expect(flow.gptResponse).toContain("Here are your auto insurance quotes for 90210");

    spy.mockRestore();
  });
});
