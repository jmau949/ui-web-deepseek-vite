import { api } from "../api";
import { handleApiError } from "@/lib/utils";

export interface SupportRequest {
  email: string;
  name: string;
  subject: string;
  message: string;
  category: string;
}

/**
 * Submits a support request to the API
 * @param supportData The support request data
 * @returns A promise that resolves when the request is successful
 */
export const submitSupportRequest = async (
  supportData: SupportRequest
): Promise<void> => {
  try {
    await api.post(
      "/api/v1/support/contact",
      { supportRequest: supportData },
      { withCredentials: true }
    );
  } catch (error: any) {
    handleApiError(
      error,
      "Failed to submit support request. Please try again later."
    );
    throw error;
  }
};
