from fastapi import APIRouter, HTTPException, Query

from app.services.forecast_service import (
    build_forecast_summary,
    build_market_comparison,
    get_dashboard_options,
    get_markets_for_commodity,
)


router = APIRouter()


@router.get("/options")
def get_options():
    return get_dashboard_options()


@router.get("/markets")
def get_markets(commodity: str = Query(..., min_length=1)):
    try:
        return get_markets_for_commodity(commodity)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/summary")
def get_forecast_summary(
    commodity: str = Query(..., min_length=1),
    market: str = Query(..., min_length=1),
    state: str = Query(..., min_length=1),
    horizon_days: int = Query(14, ge=7, le=30),
):
    try:
        return build_forecast_summary(
            commodity=commodity,
            market_name=market,
            state=state,
            horizon_days=horizon_days,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/comparison")
def get_market_comparison(
    commodity: str = Query(..., min_length=1),
    limit: int = Query(6, ge=3, le=10),
):
    try:
        return build_market_comparison(commodity=commodity, limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
