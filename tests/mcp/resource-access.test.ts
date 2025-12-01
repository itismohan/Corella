import { mcpClient, UserProfile } from "../helpers/mcp-client";

describe("MCP - resource:user_profile", () => {
  test("Accessible for authenticated users", async () => {
    const mockProfile: UserProfile = {
      userId: "user123",
      zipCode: "90210",
      vehicles: [{ year: 2020, make: "Honda", model: "Civic" }]
    };

    const spy = jest
      .spyOn(mcpClient, "getResource")
      .mockResolvedValue(mockProfile);

    const profile = await mcpClient.getResource<UserProfile>(
      "experian://user/profile"
    );

    expect(profile.userId).toBe("user123");
    expect(profile.zipCode).toBe("90210");
    expect(profile.vehicles?.[0].model).toBe("Civic");

    spy.mockRestore();
  });
});
