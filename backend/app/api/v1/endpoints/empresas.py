"""Empresas endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_empresas():
    return {"message": "List empresas - To be implemented"}

@router.post("/")
async def create_empresa():
    return {"message": "Create empresa - To be implemented"}
