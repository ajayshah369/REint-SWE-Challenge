# WindScope frontend

Single-page React + TypeScript dashboard, styled with Tailwind CSS and custom CSS.
Axios handles API requests, Recharts renders charts, and Lucide supplies icons.
AI tools (OpenAI Codex) assisted with implementation.

## Run locally

Start the Docker stack from the repository root, then run Vite from this frontend directory:

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173).
The Vite development server proxies `/api` to Docker's Nginx at
`http://127.0.0.1:80`, which forwards the request to the backend container.
This lets http://localhost:5173 use the same running stack as http://localhost.
No backend CORS change is needed for this local setup.

To run the Python backend directly on port 8000 instead, start it using the
backend README instructions and run Vite with:

```sh
API_PROXY_TARGET=http://127.0.0.1:8000 npm run dev
```

Alternatively, save `API_PROXY_TARGET=http://127.0.0.1:8000` in `.env.local`.
Restart Vite after changing environment settings. Keep `VITE_API_BASE_URL` unset
for this local setup so Axios uses `/api`.

Selecting a decision date automatically requests `GET /api/wind?date=YYYY-MM-DD`.
The initial date is 1 January 2026 to demonstrate the assessment dataset.
All valid dates are selectable, including today and future dates. The Today button
uses your browser's local calendar date. The delivery day is the following UTC day,
matching the backend contract. Far-future dates normally have no published data.

## Structure

- `src/api/client.ts`: shared Axios instance, timeout, and readable error messages.
- `src/api/wind.ts`: typed wind endpoint request.
- `src/types/wind.ts`: backend records, chart points, and analysis types.
- `src/hooks/useWindData.ts`: loading, failures, refresh, cancellation, and stale-result protection.
- `src/utils/analyzeWind.ts`: revision selection, alignment, and accuracy calculations.
- `src/utils/format.ts`: date and number formatting.
- `src/components/dashboard/`: date picker, metrics, chart section, and period table.
- `src/components/charts/`: separate line/bar components and shared chart styling.
- `src/App.tsx`: page composition.

## Comparison method

For each target generation time, use the latest forecast published on the selected
decision date, using UTC boundaries. This is an end-of-day view, not a claim about
what was available at a particular market purchase cutoff.

When all forecast target timestamps fall on full hours, show hourly comparison:
actual power is the average of the readings at HH:00 and HH:30. Both must be
present; incomplete hours stay missing. Otherwise, compare exact timestamps.
Actual revisions are deduplicated using their latest publication time.
No interpolation or zero filling is applied.

Average forecast and actual cards use their respective available periods; they
can cover different sets of periods if data is missing. Error metrics use paired
periods only. Error = forecast minus actual, MAE = mean absolute error, bias =
mean signed error, and RMSE = root mean squared error. Missing actuals produce
unavailable errors, not zero errors. Future delivery days have no actuals yet.

## Checks

```sh
npm run build
npm run lint
npm test
```

## Deployment configuration

`VITE_API_BASE_URL` can point to a deployed backend, including its `/api` suffix.
See `.env.example`. For separate frontend/backend origins, configure the backend's
CORS allowlist for that frontend origin. Alternatively, provide a same-origin
`/api` reverse proxy. Vite's development proxy is not bundled into production.
