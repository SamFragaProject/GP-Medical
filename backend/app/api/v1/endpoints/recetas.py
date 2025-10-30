"""Recetas endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_recetas():
    return {"message": "List recetas - To be implemented"}
