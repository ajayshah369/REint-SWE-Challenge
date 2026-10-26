"""FastAPI entry point. Run from backend: uvicorn index:app --reload."""

from contextlib import asynccontextmanager
from typing import Annotated

import httpx
from fastapi import Depends, FastAPI, HTTPException, Query, Request

from schemas import WindQuery, WindResponse
from services.elexon import ElexonError, ElexonService


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(60.0, connect=10.0),
        headers={"Accept": "application/json"},
    ) as client:
        app.state.elexon = ElexonService(client)
        yield


app = FastAPI(title="Wind Generation API", lifespan=lifespan)


def get_elexon_service(request: Request) -> ElexonService:
    return request.app.state.elexon


@app.get("/api/wind", response_model=WindResponse)
async def get_wind(
    query: Annotated[WindQuery, Query()],
    service: Annotated[ElexonService, Depends(get_elexon_service)],
):
    """Return next-day wind data and all forecast revisions issued on the decision date."""
    try:
        return await service.get_wind_data(query.date)
    except ElexonError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
