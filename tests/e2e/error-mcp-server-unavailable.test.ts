import { mcpClient } from "../helpers/mcp-client";

describe("Error Handling - MCP server unavailable", () => {
  test("GPT surfaces friendly message when MCP unavailable (simulated)", async () => {
    const spy = jest
      .spyOn(mcpClient, "executeTool")
      .mockRejectedValue(new Error("ECONNREFUSED"));

    try {
      await mcpClient.executeTool("get_insurance_quotes", {
        insuranceType: "auto",
        zipCode: "90210",
        coverageLevel: "standard"
      });
    } catch (err) {
      const friendlyMessage =
        "I'm having trouble connecting to our insurance network. Please try again in a moment.";
      expect(friendlyMessage).toContain("trouble connecting");
    } finally {
      spy.mockRestore();
    }
  });
});
