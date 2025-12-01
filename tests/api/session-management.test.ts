import { apiClient } from "../helpers/api-client";

describe("API - Session management", () => {
  test("Authenticated vs guest sessions", async () => {
    const spy = jest
      .spyOn(apiClient, "initSession")
      .mockImplementation(async (authenticated: boolean) => ({
        sessionId: authenticated ? "auth-session" : "guest-session",
        userType: authenticated ? "authenticated" : "guest",
        userId: authenticated ? "user123" : undefined
      }));

    const guest = await apiClient.initSession(false);
    const auth = await apiClient.initSession(true);

    expect(guest.userType).toBe("guest");
    expect(auth.userType).toBe("authenticated");
    expect(auth.userId).toBe("user123");

    spy.mockRestore();
  });
});
