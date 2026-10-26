import { apiClient } from "./client";
import type { WindResponse } from "../types/wind";

export async function fetchWindData(
  date: string,
  signal: AbortSignal,
): Promise<WindResponse> {
  const response = await apiClient.get<WindResponse>("/wind", {
    params: { date },
    signal,
  });
  return response.data;
}
