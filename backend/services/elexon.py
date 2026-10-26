"""Fetch next-day wind forecasts and actuals from Elexon."""

import asyncio
from datetime import date, datetime, time, timedelta, timezone

import httpx
from pydantic import TypeAdapter, ValidationError

from schemas import ActualRecord, ForecastRecord, WindResponse

BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1"


class ElexonError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


class ElexonService:
    def __init__(self, client: httpx.AsyncClient):
        self.client = client

    async def _fetch(self, dataset: str, params: dict, record_type: type):
        try:
            response = await self.client.get(
                f"{BASE_URL}/datasets/{dataset}/stream", params=params
            )
            response.raise_for_status()
            return TypeAdapter(list[record_type]).validate_python(response.json())
        except httpx.TimeoutException as exc:
            raise ElexonError(f"Elexon {dataset} request timed out", 504) from exc
        except httpx.HTTPStatusError as exc:
            raise ElexonError(
                f"Elexon {dataset} returned HTTP {exc.response.status_code}"
            ) from exc
        except httpx.RequestError as exc:
            raise ElexonError(f"Unable to reach Elexon {dataset}") from exc
        except (ValueError, ValidationError) as exc:
            raise ElexonError(f"Elexon {dataset} returned invalid data") from exc

    async def get_wind_data(self, decision_date: date) -> WindResponse:
        delivery_date = decision_date + timedelta(days=1)
        published_from = datetime.combine(decision_date, time.min, tzinfo=timezone.utc)
        published_until = published_from + timedelta(days=1)
        delivery_start = published_until
        delivery_end = delivery_start + timedelta(days=1)

        forecasts, actuals = await asyncio.gather(
            self._fetch(
                "WINDFOR",
                {
                    "publishDateTimeFrom": published_from.isoformat(),
                    "publishDateTimeTo": (published_until - timedelta(seconds=1)).isoformat(),
                },
                ForecastRecord,
            ),
            self._fetch(
                "FUELHH",
                {
                    "settlementDateFrom": delivery_date.isoformat(),
                    "settlementDateTo": delivery_date.isoformat(),
                    "fuelType": "WIND",
                },
                ActualRecord,
            ),
        )
        return WindResponse(
            decision_date=decision_date,
            delivery_date=delivery_date,
            forecasts=sorted(
                [record for record in forecasts
                 if delivery_start <= record.startTime < delivery_end
                 and published_from <= record.publishTime < published_until],
                key=lambda record: (record.startTime, record.publishTime),
            ),
            actuals=sorted(
                [record for record in actuals
                 if record.fuelType == "WIND"
                 and delivery_start <= record.startTime < delivery_end],
                key=lambda record: record.startTime,
            ),
        )
