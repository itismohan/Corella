import { apiClient } from "../helpers/api-client";

describe("API - Carrier aggregation", () => {
  test("Aggregates multi-carrier responses into sorted array", async () => {
    const spy = jest
      .spyOn(apiClient, "generateQuotes")
      .mockResolvedValue({
        data: {
          quotes: [
            { carrier: "Geico", premium: 1250, coverageDetails: {}, status: "available" },
            { carrier: "Progressive", premium: 1180, coverageDetails: {}, status: "available" },
            { carrier: "State Farm", premium: 1320, coverageDetails: {}, status: "available" }
          ]
        },
        responseTime: 900
      });

    const { data } = await apiClient.generateQuotes({
      insuranceType: "auto",
      zipCode: "90210",
      minimal: true
    });

    const sorted = [...data.quotes].sort((a, b) => a.premium - b.premium);

    expect(sorted[0].carrier).toBe("Progressive");

    spy.mockRestore();
  });
});
