import axios from "axios";
import { MCP_BASE_URL } from "./config";

export type InsuranceType = "auto" | "home" | "life" | "renters";
export type CoverageLevel = "basic" | "standard" | "premium";

export interface GetInsuranceQuotesParams {
  insuranceType: InsuranceType;
  zipCode: string;
  coverageLevel?: CoverageLevel;
  additionalDetails?: Record<string, unknown>;
}

export interface Quote {
  carrier: string;
  premium: number;
  coverageDetails: {
    liability?: string;
    collisionDeductible?: number;
    comprehensive?: boolean;
    [key: string]: unknown;
  };
  status: "available" | "unavailable" | "timeout";
  reason?: string;
}

export interface GetInsuranceQuotesResult {
  quotes: Quote[];
  responseTime: number;
}

export interface UserProfile {
  userId: string;
  zipCode: string;
  vehicles?: Array<{ year: number; make: string; model: string }>;
  properties?: Array<{ type: string; value: number; location: string }>;
}

export class MCPClient {
  constructor(private readonly baseUrl: string = MCP_BASE_URL) {}

  async executeTool(
    toolName: string,
    params: Record<string, unknown>
  ): Promise<GetInsuranceQuotesResult> {
    const start = Date.now();
    const url = `${this.baseUrl}/tools/${toolName}/invoke`;

    const { data } = await axios.post(url, {
      name: toolName,
      arguments: params
    });

    const responseTime = Date.now() - start;

    return {
      quotes: data.quotes,
      responseTime
    };
  }

  async getResource<T = unknown>(uri: string): Promise<T> {
    const url = `${this.baseUrl}/resources`;
    const { data } = await axios.get(url, { params: { uri } });
    return data as T;
  }
}

export const mcpClient = new MCPClient();
