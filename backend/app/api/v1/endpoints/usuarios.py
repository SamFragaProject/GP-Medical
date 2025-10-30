"""Usuarios endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_usuarios():
    return {"message": "List usuarios - To be implemented"}

@router.post("/")
async def create_usuario():
    return {"message": "Create usuario - To be implemented"}
