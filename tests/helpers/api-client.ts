import axios from "axios";
import { API_BASE_URL } from "./config";

export interface SessionInitResponse {
  sessionId: string;
  userType: "guest" | "authenticated";
  userId?: string;
}

export interface QuoteSaveResponse {
  quoteId: string;
  status: "saved";
}

export class ApiClient {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  async initSession(
    authenticated: boolean
  ): Promise<SessionInitResponse> {
    const { data } = await axios.post(`${this.baseUrl}/api/session/init`, {
      authenticated
    });
    return data;
  }

  async generateQuotes(payload: Record<string, unknown>) {
    const start = Date.now();
    const { data } = await axios.post(
      `${this.baseUrl}/api/quotes/generate`,
      payload
    );
    const responseTime = Date.now() - start;
    return { data, responseTime };
  }

  async saveQuote(
    sessionId: string,
    quote: Record<string, unknown>
  ): Promise<QuoteSaveResponse> {
    const { data } = await axios.post(
      `${this.baseUrl}/api/quotes/save`,
      { sessionId, quote }
    );
    return data;
  }
}

export const apiClient = new ApiClient();
