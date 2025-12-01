import { runStatefulConversation } from "../helpers/gpt-simulator";

describe("Insurance GPT - Deeper NLU extraction", () => {
  test("Extracts city, state, home value, and deductible", async () => {
    const messages = [
      "I'm looking for home insurance in Boston, MA for a $500k house with $1000 deductible"
    ];

    const result = await runStatefulConversation(messages);
    const slots = result.state.slots;

    expect(slots.insuranceType).toBe("home");
    expect(slots.location?.city).toBe("Boston");
    expect(slots.location?.state).toBe("MA");
    expect(slots.homeValue).toBe(500000);
    expect(slots.deductible).toBe(1000);
  });
});
