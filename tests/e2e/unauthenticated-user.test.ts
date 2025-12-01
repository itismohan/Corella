import { ApiClient } from "../helpers/api-client";

describe("Insurance GPT - Unauthenticated user flow", () => {
  test("Session initialised as guest, no profile lookup", async () => {
    const apiClient = new ApiClient("http://localhost:5000");

    const mock = jest
      .spyOn(apiClient, "initSession")
      .mockResolvedValue({
        sessionId: "anon-session",
        userType: "guest"
      });

    const session = await apiClient.initSession(false);

    expect(session.sessionId).toBe("anon-session");
    expect(session.userType).toBe("guest");

    mock.mockRestore();
  });
});
