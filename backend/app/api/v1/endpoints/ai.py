"""
Endpoints de IA para GP-Medical
- Chatbot médico
- Asistente de diagnóstico
- Speech-to-text
- Gestión de knowledge base
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import os
import aiofiles
from datetime import datetime

from app.db.session import get_db
from app.services.ai_service import ai_service
from app.core.deps import get_current_user

router = APIRouter()


# ============================================================================
# SCHEMAS
# ============================================================================

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    use_medical_kb: bool = True
    use_system_kb: bool = True


class ChatResponse(BaseModel):
    response: str
    sources: List[dict] = []
    tokens_used: int
    model: str


class DiagnosisAssistRequest(BaseModel):
    sintomas: str
    signos_vitales: Optional[dict] = None
    antecedentes: Optional[str] = None
    exploracion_fisica: Optional[str] = None


class PrescriptionSuggestionRequest(BaseModel):
    medicamento: str
    diagnostico: Optional[str] = None
    edad_paciente: Optional[int] = None
    peso_paciente: Optional[float] = None


class CompletePrescriptionRequest(BaseModel):
    diagnostico: str
    sintomas: str
    edad_paciente: int
    peso_paciente: Optional[float] = None
    alergias: Optional[str] = None


class ImproveNoteRequest(BaseModel):
    transcription: str
    note_type: str = "soap"  # "soap" or "general"


class KBSearchRequest(BaseModel):
    query: str
    collection_type: str = "medical"  # "medical" or "system"
    n_results: int = 5


# ============================================================================
# CHATBOT MÉDICO
# ============================================================================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Chatbot médico con RAG
    Contexto: conocimiento médico + documentación del sistema
    """
    try:
        # Convertir historial a formato dict
        history = [msg.model_dump() for msg in request.conversation_history]

        result = await ai_service.chat_with_context(
            user_message=request.message,
            conversation_history=history,
            user_role=current_user.get("rol", "medico"),
            use_medical_kb=request.use_medical_kb,
            use_system_kb=request.use_system_kb
        )

        return ChatResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en chatbot: {str(e)}")


@router.post("/chat/quick")
async def quick_chat(
    message: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Chat rápido sin contexto (para preguntas simples)
    """
    try:
        result = await ai_service.chat_with_context(
            user_message=message,
            conversation_history=[],
            user_role=current_user.get("rol", "medico"),
            use_medical_kb=False,
            use_system_kb=False
        )

        return {"response": result["response"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ============================================================================
# ASISTENTE DE DIAGNÓSTICO
# ============================================================================

@router.post("/diagnosis/assist")
async def assist_diagnosis(
    request: DiagnosisAssistRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Asiste en el diagnóstico diferencial
    """
    try:
        result = await ai_service.assist_diagnosis(
            sintomas=request.sintomas,
            signos_vitales=request.signos_vitales,
            antecedentes=request.antecedentes,
            exploracion_fisica=request.exploracion_fisica
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en asistencia de diagnóstico: {str(e)}")


# ============================================================================
# ASISTENTE DE RECETAS
# ============================================================================

@router.post("/prescription/suggest")
async def suggest_prescription(
    request: PrescriptionSuggestionRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sugiere dosis, frecuencia y duración para un medicamento
    """
    try:
        result = await ai_service.suggest_prescription(
            medicamento=request.medicamento,
            diagnostico=request.diagnostico,
            edad_paciente=request.edad_paciente,
            peso_paciente=request.peso_paciente
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en sugerencia de receta: {str(e)}")


@router.post("/prescription/generate")
async def generate_complete_prescription(
    request: CompletePrescriptionRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Genera una receta completa basada en diagnóstico
    """
    try:
        result = await ai_service.generate_complete_prescription(
            diagnostico=request.diagnostico,
            sintomas=request.sintomas,
            edad_paciente=request.edad_paciente,
            peso_paciente=request.peso_paciente,
            alergias=request.alergias
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando receta: {str(e)}")


# ============================================================================
# SPEECH-TO-TEXT
# ============================================================================

@router.post("/speech/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form("es"),
    current_user: dict = Depends(get_current_user),
):
    """
    Transcribe audio a texto usando Whisper
    Formatos soportados: mp3, mp4, mpeg, mpga, m4a, wav, webm
    """
    try:
        # Validar formato
        allowed_formats = ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"]
        file_ext = audio.filename.split(".")[-1].lower()
        if file_ext not in allowed_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Formato no soportado. Use: {', '.join(allowed_formats)}"
            )

        # Guardar archivo temporal
        temp_path = f"/tmp/audio_{datetime.utcnow().timestamp()}.{file_ext}"

        async with aiofiles.open(temp_path, 'wb') as out_file:
            content = await audio.read()
            await out_file.write(content)

        # Transcribir
        result = await ai_service.transcribe_audio(temp_path, language)

        # Eliminar archivo temporal
        os.remove(temp_path)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en transcripción: {str(e)}")


@router.post("/speech/improve-note")
async def improve_clinical_note(
    request: ImproveNoteRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mejora y estructura una nota clínica transcrita
    """
    try:
        result = await ai_service.improve_clinical_note(
            transcription=request.transcription,
            note_type=request.note_type
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error mejorando nota: {str(e)}")


# ============================================================================
# KNOWLEDGE BASE MANAGEMENT (Solo Admin)
# ============================================================================

@router.post("/kb/upload-document")
async def upload_document_to_kb(
    file: UploadFile = File(...),
    collection_type: str = Form("medical"),
    title: str = Form(...),
    category: str = Form("general"),
    tags: str = Form(""),
    current_user: dict = Depends(get_current_user),
):
    """
    Sube un documento a la knowledge base
    Solo para administradores
    Formatos soportados: txt, pdf, docx
    """
    # Validar rol admin
    if current_user.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden gestionar KB")

    try:
        # Validar formato
        allowed_formats = ["txt", "pdf", "docx"]
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in allowed_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Formato no soportado. Use: {', '.join(allowed_formats)}"
            )

        # Leer contenido
        content = await file.read()

        # Extraer texto según formato
        if file_ext == "txt":
            document_text = content.decode('utf-8')
        elif file_ext == "pdf":
            from pypdf import PdfReader
            import io
            pdf_reader = PdfReader(io.BytesIO(content))
            document_text = "\n".join([page.extract_text() for page in pdf_reader.pages])
        elif file_ext == "docx":
            from docx import Document
            import io
            doc = Document(io.BytesIO(content))
            document_text = "\n".join([para.text for para in doc.paragraphs])

        # Metadata
        metadata = {
            "filename": file.filename,
            "title": title,
            "category": category,
            "tags": tags.split(",") if tags else [],
            "uploaded_by": current_user.get("id"),
            "file_type": file_ext
        }

        # Agregar a KB
        result = await ai_service.add_document_to_kb(
            document_text=document_text,
            metadata=metadata,
            collection_type=collection_type
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subiendo documento: {str(e)}")


@router.post("/kb/search")
async def search_knowledge_base(
    request: KBSearchRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Busca en la knowledge base
    """
    try:
        results = await ai_service.search_knowledge_base(
            query=request.query,
            collection_type=request.collection_type,
            n_results=request.n_results
        )

        return {"results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en búsqueda: {str(e)}")


@router.get("/kb/stats")
async def get_kb_stats(
    current_user: dict = Depends(get_current_user),
):
    """
    Obtiene estadísticas de la knowledge base
    """
    try:
        stats = await ai_service.get_kb_stats()
        return stats

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo stats: {str(e)}")


@router.delete("/kb/clear/{collection_type}")
async def clear_knowledge_base(
    collection_type: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Limpia completamente una colección de la KB
    Solo para administradores
    """
    # Validar rol admin
    if current_user.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden gestionar KB")

    if collection_type not in ["medical", "system"]:
        raise HTTPException(status_code=400, detail="collection_type debe ser 'medical' o 'system'")

    try:
        result = await ai_service.clear_collection(collection_type)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error limpiando KB: {str(e)}")
