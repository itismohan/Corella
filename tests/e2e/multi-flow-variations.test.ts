
import { runSimulatedConversationFlow } from "../helpers/gpt-simulator";
import { SAMPLE_USER_MESSAGES } from "../mocks/gpt-responses";

describe("Insurance GPT - Multi-flow Variations", () => {
  SAMPLE_USER_MESSAGES.forEach((msg, idx) => {
    test(`Flow variation #${idx+1}`, async () => {
      const flow = await runSimulatedConversationFlow(msg);
      expect(flow.gptResponse.length).toBeGreaterThan(10);
    });
  });
});
