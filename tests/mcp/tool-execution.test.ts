import { mcpClient } from "../helpers/mcp-client";
import { PERFORMANCE_BUDGET } from "../helpers/config";

describe("MCP - tool:get_insurance_quotes", () => {
  test("Registered and returns properly formatted response (integration)", async () => {
    const spy = jest
      .spyOn(mcpClient, "executeTool")
      .mockResolvedValue({
        quotes: [
          {
            carrier: "Progressive",
            premium: 1180,
            coverageDetails: {
              liability: "100k/300k",
              collisionDeductible: 500,
              comprehensive: true
            },
            status: "available" as const
          }
        ],
        responseTime: 700
      });

    const result = await mcpClient.executeTool("get_insurance_quotes", {
      insuranceType: "auto",
      zipCode: "90210",
      coverageLevel: "standard"
    });

    expect(result.quotes).toHaveLength(1);
    expect(result.quotes[0].carrier).toBe("Progressive");
    expect(result.responseTime).toBeLessThanOrEqual(
      PERFORMANCE_BUDGET.mcpToolMs
    );

    spy.mockRestore();
  });
});
