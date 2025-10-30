"""Pacientes endpoints - STUB"""
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_pacientes():
    return {"message": "List pacientes - To be implemented"}

@router.post("/")
async def create_paciente():
    return {"message": "Create paciente - To be implemented"}
