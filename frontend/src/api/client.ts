import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 70_000,
  headers: { Accept: "application/json" },
});

export function getApiError(error: unknown): string {
  if (!axios.isAxiosError(error))
    return "Something went wrong. Please try again.";
  const detail: unknown = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (error.response?.status === 422)
    return "Please select a valid date in YYYY-MM-DD format.";
  if (error.code === "ECONNABORTED")
    return "The request timed out. Please try again.";
  if (!error.response)
    return "Unable to reach the backend. Check that the Python API is running.";
  return `Unable to load generation data (HTTP ${error.response.status}). Please try again.`;
}
