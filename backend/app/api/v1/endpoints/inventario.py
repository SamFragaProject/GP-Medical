"""Inventario endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_inventario():
    return {"message": "List inventario - To be implemented"}
