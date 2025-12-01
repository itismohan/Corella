import { mockMCPExecution, formatGPTResponse } from "../helpers/gpt-simulator";

describe("Error Handling - No carriers available", () => {
  test("GPT explains when no carriers cover the area", () => {
    const result = mockMCPExecution({
      insuranceType: "auto",
      zipCode: "99999",
      coverageLevel: "standard"
    });

    expect(result.quotes.length).toBe(0);

    const response = formatGPTResponse(result, "99999");
    expect(response).toContain("no carriers cover ZIP 99999");
  });
});
