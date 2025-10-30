"""CRM endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/campanas")
async def list_campanas():
    return {"message": "List campañas - To be implemented"}
