import { mcpClient, UserProfile } from "../helpers/mcp-client";
import userProfiles from "../mocks/user-profiles.json";
import { mockMCPExecution, formatGPTResponse } from "../helpers/gpt-simulator";

describe("Insurance GPT - Authenticated user flow", () => {
  test("Pre-fills data from MCP user profile and saves quotes", async () => {
    const profile = userProfiles["authenticated"] as UserProfile;

    const mcpSpy = jest
      .spyOn(mcpClient, "getResource")
      .mockResolvedValue(profile);

    const params = {
      insuranceType: "auto" as const,
      zipCode: profile.zipCode,
      coverageLevel: "standard" as const,
      additionalDetails: {
        vehicle: profile.vehicles?.[0]
      }
    };

    const result = mockMCPExecution(params);
    const gptResponse = formatGPTResponse(result, params.zipCode);

    expect(mcpSpy).toHaveBeenCalledWith("experian://user/profile");
    expect(gptResponse).toContain("Here are your auto insurance quotes for 90210");

    mcpSpy.mockRestore();
  });
});
