from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from ..services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/research", response_model=Dict)
async def get_research_analytics():
    """
    Get comprehensive research analytics including:
    - Publication trends over time
    - Faculty distribution by department
    - Top research areas
    - Key metrics (citations, h-index, etc.)
    """
    try:
        analytics_service = AnalyticsService()
        return await analytics_service.get_research_analytics()
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching analytics data"
        )
