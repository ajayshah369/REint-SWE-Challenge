"""Validated request and response data for the wind-generation API."""

from datetime import date as Date
import re

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, field_validator


class WindQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    date: Date = Field(description="Decision date in YYYY-MM-DD format", examples=["2026-01-01"])

    @field_validator("date", mode="before")
    @classmethod
    def validate_date(cls, value):
        if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            raise ValueError("Use a date in YYYY-MM-DD format")
        if value == "9999-12-31":
            raise ValueError("Date must allow a following delivery day")
        return value


class ForecastRecord(BaseModel):
    dataset: str
    publishTime: AwareDatetime
    startTime: AwareDatetime
    generation: float


class ActualRecord(ForecastRecord):
    settlementDate: Date
    settlementPeriod: int
    fuelType: str


class WindResponse(BaseModel):
    decision_date: Date
    delivery_date: Date
    forecasts: list[ForecastRecord]
    actuals: list[ActualRecord]
