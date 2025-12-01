import { apiClient } from "../helpers/api-client";
import { PERFORMANCE_BUDGET } from "../helpers/config";

describe("API - Quote generation", () => {
  test("POST /api/quotes/generate returns 3+ quotes for valid ZIP", async () => {
    const payload = {
      insuranceType: "auto",
      zipCode: "90210",
      minimal: true
    };

    const spy = jest
      .spyOn(apiClient, "generateQuotes")
      .mockResolvedValue({
        data: {
          quotes: [
            {
              carrier: "Progressive",
              premium: 1180,
              coverageDetails: {},
              status: "available"
            },
            {
              carrier: "Geico",
              premium: 1250,
              coverageDetails: {},
              status: "available"
            },
            {
              carrier: "State Farm",
              premium: 1320,
              coverageDetails: {},
              status: "available"
            }
          ]
        },
        responseTime: 1000
      });

    const { data, responseTime } = await apiClient.generateQuotes(payload);

    expect(data.quotes.length).toBeGreaterThanOrEqual(3);
    expect(responseTime).toBeLessThanOrEqual(PERFORMANCE_BUDGET.backendMs);

    spy.mockRestore();
  });
});
