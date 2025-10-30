"""Encuentros endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_encuentros():
    return {"message": "List encuentros - To be implemented"}
