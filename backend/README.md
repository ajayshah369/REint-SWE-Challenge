# Wind Generation API

Uses FastAPI, Pydantic and HTTPX. AI tools (OpenAI Codex) assisted with implementation.

## Start

From the backend directory:

```sh
source .env/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn index:app --reload
```

Open http://127.0.0.1:8000/docs for interactive API documentation.

## Request

`GET http://127.0.0.1:8000/api/wind?date=2026-01-01`

The sole query parameter is a required date in YYYY-MM-DD format. Invalid dates,
datetimes, and additional query parameters return HTTP 422.

The date is the decision date. The response contains `decision_date`,
`delivery_date` (the following day), `forecasts`, and `actuals`.

- `services/elexon.py`: calls WINDFOR/stream for forecasts published on the decision
  date and FUELHH/stream for WIND actuals on the delivery date. Filters target
  startTime to the delivery day and sorts the results.
- `schemas.py`: Pydantic request and upstream/response models.
- `index.py`: route, shared HTTP client lifecycle, and upstream error responses.
- `tests/test_api.py`: mocked upstream integration and input-validation tests.

Dates currently use UTC day boundaries, which match UK local time in January.
The API accepts dates outside January as well; the assessment UI can restrict its
selection to January 2026. Future dates may return empty actuals; empty arrays are
returned unchanged, without fabricated data.

All forecast revisions published that day are returned. This does not yet select
an as-of decision cutoff or calculate errors. The caller must not treat late-day
revisions as available at an earlier purchase cutoff. Forecast and actual records
may have different time resolutions; they are returned separately without
interpolation or aggregation. Generation values are in MW.

Elexon timeouts return HTTP 504; other upstream failures or invalid upstream data
return HTTP 502. This endpoint does not require an Elexon API key.

## Tests

```sh
python -m unittest discover -s tests -v
```
