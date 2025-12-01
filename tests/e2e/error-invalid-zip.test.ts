import { runSimulatedConversationFlow, simulateGPTProcessing, mockMCPExecution } from "../helpers/gpt-simulator";

describe("Error Handling - Invalid ZIP", () => {
  test("GPT prompts for valid ZIP when invalid provided (simulated)", () => {
    expect(() => {
      simulateGPTProcessing("Get quotes for ZIP 00000");
    }).not.toThrow(); // ZIP present syntactically

    expect(() =>
      mockMCPExecution({
        insuranceType: "auto",
        zipCode: "00000",
        coverageLevel: "standard"
      })
    ).toThrowError("Invalid ZIP code");
  });
});
