import { mockMCPExecution } from "../helpers/gpt-simulator";

describe("MCP - error handling", () => {
  test("Invalid ZIP code surfaces as structured error", () => {
    expect(() =>
      mockMCPExecution({
        insuranceType: "auto",
        zipCode: "00000",
        coverageLevel: "standard"
      })
    ).toThrowError("Invalid ZIP code");
  });
});
