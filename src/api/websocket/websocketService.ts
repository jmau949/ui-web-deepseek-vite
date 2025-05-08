import { api } from "../api";
import { handleApiError } from "@/lib/utils";

interface WsTokenResponse {
  token: string;
}

export const getWsToken = async (): Promise<string> => {
  try {
    const response = await api.get<WsTokenResponse>("/api/v1/auth/ws-token", {
      withCredentials: true,
    });
    return response.data.token;
  } catch (error: any) {
    handleApiError(
      error,
      "Failed to get WebSocket token. Please try again later."
    );
    throw error;
  }
};
