"""Citas endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_citas():
    return {"message": "List citas - To be implemented"}

@router.post("/")
async def create_cita():
    return {"message": "Create cita - To be implemented"}
