import { useEffect, useState } from "react";
import axios from "axios";
import { fetchWindData } from "../api/wind";
import { getApiError } from "../api/client";
import type { WindResponse } from "../types/wind";

type RequestState =
  | { date: string; status: "loading" }
  | { date: string; status: "success"; data: WindResponse }
  | { date: string; status: "error"; message: string };

export function useWindData(date: string) {
  const [state, setState] = useState<RequestState>({ date, status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchWindData(date, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ date, status: "success", data });
      })
      .catch((error: unknown) => {
        if (!axios.isCancel(error) && !controller.signal.aborted) {
          setState({ date, status: "error", message: getApiError(error) });
        }
      });
    return () => controller.abort();
  }, [date, attempt]);

  function reload() {
    setState({ date, status: "loading" });
    setAttempt((value) => value + 1);
  }

  // Never render results belonging to a previously selected date.
  return {
    state: state.date === date ? state : { date, status: "loading" as const },
    reload,
  };
}
