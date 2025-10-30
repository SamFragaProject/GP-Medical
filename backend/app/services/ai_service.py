"""
Servicio de IA para GP-Medical
- Chatbot médico con RAG
- Asistente de recetas
- Speech-to-text
- Embeddings y Vector Store
"""

import os
import json
from typing import List, Dict, Optional, Any
from datetime import datetime
import chromadb
from chromadb.config import Settings
from openai import OpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document
import tiktoken

# Cliente OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ChromaDB Client
chroma_client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(
        anonymized_telemetry=False,
        allow_reset=True
    )
)

# Colección para documentos médicos
medical_collection = chroma_client.get_or_create_collection(
    name="medical_knowledge",
    metadata={"hnsw:space": "cosine"}
)

# Colección para documentación del sistema
system_collection = chroma_client.get_or_create_collection(
    name="system_docs",
    metadata={"hnsw:space": "cosine"}
)

# Embeddings
embeddings_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)


class AIService:
    """Servicio centralizado de IA para GP-Medical"""

    def __init__(self):
        self.client = client
        self.system_prompt = """Eres un asistente médico inteligente para GP-Medical,
        un sistema de Medicina del Trabajo. Tienes conocimiento completo del sistema
        y puedes ayudar con diagnósticos, recetas, procedimientos y uso del sistema.

        Siempre sé profesional, preciso y fundamenta tus recomendaciones médicas.
        Si no estás seguro, indícalo claramente."""

    # ============================================================================
    # CHATBOT MÉDICO CON RAG
    # ============================================================================

    async def chat_with_context(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        user_role: str = "medico",
        use_medical_kb: bool = True,
        use_system_kb: bool = True
    ) -> Dict[str, Any]:
        """
        Chatbot con RAG - Recupera contexto relevante y genera respuesta
        """
        if conversation_history is None:
            conversation_history = []

        # 1. Recuperar contexto relevante
        contexts = []
        sources = []

        if use_medical_kb:
            medical_results = medical_collection.query(
                query_texts=[user_message],
                n_results=3
            )
            if medical_results['documents'] and medical_results['documents'][0]:
                contexts.extend(medical_results['documents'][0])
                sources.extend([
                    medical_results['metadatas'][0][i]
                    for i in range(len(medical_results['documents'][0]))
                ])

        if use_system_kb:
            system_results = system_collection.query(
                query_texts=[user_message],
                n_results=2
            )
            if system_results['documents'] and system_results['documents'][0]:
                contexts.extend(system_results['documents'][0])
                sources.extend([
                    system_results['metadatas'][0][i]
                    for i in range(len(system_results['documents'][0]))
                ])

        # 2. Construir prompt con contexto
        context_text = "\n\n".join(contexts) if contexts else "No hay contexto adicional."

        system_message = f"""{self.system_prompt}

        ROL DEL USUARIO: {user_role}

        CONTEXTO RELEVANTE:
        {context_text}

        Usa este contexto para enriquecer tus respuestas, pero no lo menciones explícitamente
        a menos que sea relevante."""

        # 3. Preparar mensajes
        messages = [{"role": "system", "content": system_message}]
        messages.extend(conversation_history[-10:])  # Últimos 10 mensajes
        messages.append({"role": "user", "content": user_message})

        # 4. Generar respuesta
        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        assistant_message = response.choices[0].message.content

        return {
            "response": assistant_message,
            "sources": sources,
            "tokens_used": response.usage.total_tokens,
            "model": response.model
        }

    # ============================================================================
    # ASISTENTE DE RECETAS
    # ============================================================================

    async def suggest_prescription(
        self,
        medicamento: str,
        diagnostico: Optional[str] = None,
        edad_paciente: Optional[int] = None,
        peso_paciente: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Sugiere dosis, frecuencia y duración para un medicamento
        """
        prompt = f"""Como médico, sugiere la prescripción para:

        MEDICAMENTO: {medicamento}
        {'DIAGNÓSTICO: ' + diagnostico if diagnostico else ''}
        {'EDAD PACIENTE: ' + str(edad_paciente) + ' años' if edad_paciente else ''}
        {'PESO PACIENTE: ' + str(peso_paciente) + ' kg' if peso_paciente else ''}

        Proporciona en formato JSON:
        {{
            "dosis": "cantidad y unidad (ej: 500mg)",
            "frecuencia": "cada cuántas horas (ej: cada 8 horas)",
            "duracion": "por cuánto tiempo (ej: 7 días)",
            "via_administracion": "oral/IV/IM/etc",
            "indicaciones_adicionales": "tomar con alimentos, etc",
            "advertencias": "contraindicaciones o precauciones importantes"
        }}

        IMPORTANTE: Solo proporciona el JSON, sin texto adicional."""

        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "Eres un médico experto. Responde solo con JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        suggestion = json.loads(response.choices[0].message.content)
        return suggestion

    async def generate_complete_prescription(
        self,
        diagnostico: str,
        sintomas: str,
        edad_paciente: int,
        peso_paciente: Optional[float] = None,
        alergias: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Genera una receta completa basada en diagnóstico y síntomas
        """
        prompt = f"""Como médico, genera una receta completa para:

        DIAGNÓSTICO: {diagnostico}
        SÍNTOMAS: {sintomas}
        EDAD: {edad_paciente} años
        {'PESO: ' + str(peso_paciente) + ' kg' if peso_paciente else ''}
        {'ALERGIAS: ' + alergias if alergias else ''}

        Proporciona un array JSON de medicamentos recomendados:
        {{
            "medicamentos": [
                {{
                    "nombre": "nombre del medicamento",
                    "dosis": "cantidad",
                    "frecuencia": "cada X horas",
                    "duracion": "X días",
                    "via": "oral/IV/etc",
                    "indicaciones": "instrucciones"
                }}
            ],
            "recomendaciones_generales": "reposo, hidratación, etc",
            "signos_alarma": "cuándo acudir a urgencias"
        }}

        Solo JSON, sin texto adicional."""

        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "Eres un médico experto. Responde solo con JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            response_format={"type": "json_object"}
        )

        prescription = json.loads(response.choices[0].message.content)
        return prescription

    # ============================================================================
    # ASISTENTE DE DIAGNÓSTICO
    # ============================================================================

    async def assist_diagnosis(
        self,
        sintomas: str,
        signos_vitales: Optional[Dict] = None,
        antecedentes: Optional[str] = None,
        exploracion_fisica: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Asiste en el diagnóstico basado en síntomas y signos
        """
        prompt = f"""Como médico, analiza el siguiente caso:

        SÍNTOMAS: {sintomas}
        {'SIGNOS VITALES: ' + json.dumps(signos_vitales) if signos_vitales else ''}
        {'ANTECEDENTES: ' + antecedentes if antecedentes else ''}
        {'EXPLORACIÓN FÍSICA: ' + exploracion_fisica if exploracion_fisica else ''}

        Proporciona:
        {{
            "diagnosticos_diferenciales": [
                {{
                    "nombre": "nombre del diagnóstico",
                    "codigo_cie10": "código CIE-10",
                    "probabilidad": "alta/media/baja",
                    "razonamiento": "por qué consideras este diagnóstico"
                }}
            ],
            "estudios_recomendados": ["lista de estudios"],
            "plan_diagnostico": "siguiente paso recomendado"
        }}

        Solo JSON."""

        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "Eres un médico experto en diagnóstico. Responde solo con JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            response_format={"type": "json_object"}
        )

        diagnosis_assist = json.loads(response.choices[0].message.content)
        return diagnosis_assist

    # ============================================================================
    # SPEECH-TO-TEXT
    # ============================================================================

    async def transcribe_audio(
        self,
        audio_file_path: str,
        language: str = "es"
    ) -> Dict[str, str]:
        """
        Transcribe audio a texto usando Whisper
        """
        with open(audio_file_path, "rb") as audio_file:
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language,
                response_format="verbose_json"
            )

        return {
            "text": transcript.text,
            "language": transcript.language,
            "duration": transcript.duration
        }

    async def improve_clinical_note(
        self,
        transcription: str,
        note_type: str = "soap"
    ) -> Dict[str, Any]:
        """
        Mejora una nota clínica transcrita, estructurándola correctamente
        """
        if note_type == "soap":
            prompt = f"""Estructura la siguiente transcripción de nota clínica en formato SOAP:

            TRANSCRIPCIÓN:
            {transcription}

            Proporciona:
            {{
                "subjetivo": "lo que el paciente refiere",
                "objetivo": "hallazgos objetivos, signos vitales, exploración",
                "analisis": "análisis e impresión diagnóstica",
                "plan": "plan de tratamiento y seguimiento"
            }}

            Solo JSON."""
        else:
            prompt = f"""Mejora y estructura la siguiente nota clínica:

            TRANSCRIPCIÓN:
            {transcription}

            Hazla más clara, profesional y completa. Devuelve JSON:
            {{
                "nota_mejorada": "texto mejorado",
                "sugerencias": ["sugerencias de información adicional que podría agregarse"]
            }}"""

        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "Eres un médico experto en documentación clínica. Responde solo con JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        improved = json.loads(response.choices[0].message.content)
        return improved

    # ============================================================================
    # KNOWLEDGE BASE MANAGEMENT
    # ============================================================================

    async def add_document_to_kb(
        self,
        document_text: str,
        metadata: Dict[str, Any],
        collection_type: str = "medical"  # "medical" or "system"
    ) -> Dict[str, str]:
        """
        Agrega un documento a la knowledge base
        """
        # 1. Dividir documento en chunks
        chunks = text_splitter.split_text(document_text)

        # 2. Generar embeddings
        embeddings = embeddings_model.embed_documents(chunks)

        # 3. Seleccionar colección
        collection = medical_collection if collection_type == "medical" else system_collection

        # 4. Generar IDs únicos
        timestamp = datetime.utcnow().isoformat()
        ids = [f"{metadata.get('filename', 'doc')}_{i}_{timestamp}" for i in range(len(chunks))]

        # 5. Preparar metadatos para cada chunk
        metadatas = [
            {
                **metadata,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "added_at": timestamp
            }
            for i in range(len(chunks))
        ]

        # 6. Agregar a ChromaDB
        collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

        return {
            "status": "success",
            "chunks_added": len(chunks),
            "collection": collection_type
        }

    async def search_knowledge_base(
        self,
        query: str,
        collection_type: str = "medical",
        n_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Busca en la knowledge base
        """
        collection = medical_collection if collection_type == "medical" else system_collection

        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )

        if not results['documents'] or not results['documents'][0]:
            return []

        formatted_results = []
        for i in range(len(results['documents'][0])):
            formatted_results.append({
                "text": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i] if 'distances' in results else None
            })

        return formatted_results

    async def get_kb_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas de la knowledge base
        """
        medical_count = medical_collection.count()
        system_count = system_collection.count()

        return {
            "medical_documents": medical_count,
            "system_documents": system_count,
            "total_documents": medical_count + system_count
        }

    async def clear_collection(self, collection_type: str) -> Dict[str, str]:
        """
        Limpia una colección completamente
        """
        global medical_collection, system_collection

        if collection_type == "medical":
            chroma_client.delete_collection("medical_knowledge")
            medical_collection = chroma_client.create_collection(
                name="medical_knowledge",
                metadata={"hnsw:space": "cosine"}
            )
        else:
            chroma_client.delete_collection("system_docs")
            system_collection = chroma_client.create_collection(
                name="system_docs",
                metadata={"hnsw:space": "cosine"}
            )

        return {"status": "success", "message": f"Collection {collection_type} cleared"}


# Instancia global del servicio
ai_service = AIService()
