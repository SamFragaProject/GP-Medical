"""Roles endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_roles():
    return {"message": "List roles - To be implemented"}
