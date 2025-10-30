"""Facturación endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_facturas():
    return {"message": "List facturas - To be implemented"}
