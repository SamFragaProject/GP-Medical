"""Upload endpoints - STUB"""
from fastapi import APIRouter, UploadFile, File
router = APIRouter()

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    return {"message": "Upload - To be implemented", "filename": file.filename}
