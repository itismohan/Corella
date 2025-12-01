import { runStatefulConversation } from "../helpers/gpt-simulator";

describe("Insurance GPT - Message repair logic", () => {
  test("Incomplete ZIP triggers clarification", async () => {
    const messages = [
      "I need car insurance",
      "My zip is 9021",
      "90210"
    ];

    const result = await runStatefulConversation(messages);
    const transcriptText = result.transcript.map(t => `${t.speaker}: ${t.message}`).join("\n");

    expect(transcriptText).toMatch(/ZIP code seems invalid|didn't catch your ZIP code/i);
    expect(result.mcpCall.parameters.zipCode).toBe("90210");
  });

  test("Invalid ZIP 00000 triggers friendly error then repair", async () => {
    const messages = [
      "Get quotes for ZIP 00000",
      "Sorry, the ZIP is 90210 instead"
    ];

    const result = await runStatefulConversation(messages);
    const transcriptText = result.transcript.map(t => `${t.speaker}: ${t.message}`).join("\n");

    expect(transcriptText).toMatch(/ZIP code seems invalid/i);
    expect(result.mcpCall.parameters.zipCode).toBe("90210");
  });
});
