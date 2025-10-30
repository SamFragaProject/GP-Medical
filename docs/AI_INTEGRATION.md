# Integración de IA en GP-Medical

GP-Medical incluye capacidades avanzadas de procesamiento de documentos médicos con Inteligencia Artificial.

## 🤖 Características de IA

### 1. **Extracción de Datos de Documentos**

Sube documentos escaneados (PDF, imágenes) y la IA extrae automáticamente:

- Información del paciente
- Resultados de laboratorio
- Diagnósticos
- Medicamentos recetados
- Signos vitales

### 2. **Análisis de Laboratorios**

- Interpretación automática de resultados
- Detección de valores fuera de rango
- Sugerencias de seguimiento
- Correlación con historial del paciente

### 3. **Asistente de Diagnóstico**

- Sugerencias basadas en síntomas
- Referencias a CIE-10
- Diagnósticos diferenciales
- Alertas de interacciones medicamentosas

### 4. **Generación de Resúmenes**

- Resumen automático de historiales clínicos
- Notas SOAP generadas por IA
- Reportes para pacientes en lenguaje simple

### 5. **Normalización de Datos**

Al importar datos desde CSV/Excel, la IA:

- Detecta y corrige errores
- Normaliza nombres y direcciones
- Identifica duplicados
- Valida formatos

---

## 📝 Cómo Usar la IA

### Configuración Inicial

1. **Obtén tu API Key:**
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/

2. **Configura en `.env`:**
   ```env
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   AI_MODEL=gpt-4  # o claude-3-opus-20240229
   AI_TEMPERATURE=0.7
   AI_MAX_TOKENS=2000
   ```

### Subir Documentos para Análisis

#### Desde el Frontend:

```typescript
// Componente de upload
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'laboratorio'); // o 'receta', 'estudio', etc.

  const response = await fetch('/api/v1/upload/analyze', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  // result.extracted_data contiene los datos extraídos
};
```

#### Desde el Backend:

```python
from app.services.ai_service import analyze_document

# Analizar documento
result = await analyze_document(
    file_path="/path/to/document.pdf",
    document_type="laboratorio",
    patient_context={
        "edad": 45,
        "genero": "femenino",
        "antecedentes": ["diabetes", "hipertension"]
    }
)

# Resultado:
{
    "extracted_data": {
        "glucosa": 120,
        "colesterol": 180,
        "trigliceridos": 150
    },
    "interpretation": "Valores dentro de rango normal...",
    "recommendations": ["Mantener dieta..."],
    "urgency": "normal"
}
```

---

## 🔧 Implementación Backend

### Servicio de IA (app/services/ai_service.py)

```python
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from app.core.config import settings

class AIService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def analyze_document(
        self,
        file_content: bytes,
        document_type: str,
        patient_context: dict = None
    ) -> dict:
        """Analiza un documento médico y extrae información"""

        # Construir prompt
        prompt = f"""
        Analiza el siguiente documento médico de tipo: {document_type}

        Contexto del paciente: {patient_context}

        Extrae la siguiente información:
        - Datos estructurados (nombre, fecha, valores)
        - Interpretación clínica
        - Recomendaciones
        - Nivel de urgencia

        Formato de salida: JSON
        """

        # Usar OpenAI GPT-4 Vision para documentos con imágenes
        if settings.AI_MODEL.startswith("gpt"):
            response = await self.openai_client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un asistente médico experto en análisis de documentos clínicos."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=settings.AI_TEMPERATURE,
                max_tokens=settings.AI_MAX_TOKENS
            )

            return response.choices[0].message.content

        # Usar Claude para mejor comprensión de contexto
        else:
            response = await self.anthropic_client.messages.create(
                model=settings.AI_MODEL,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            return response.content[0].text

    async def generate_soap_note(
        self,
        patient_data: dict,
        encounter_data: dict
    ) -> dict:
        """Genera una nota SOAP basada en los datos del encuentro"""

        prompt = f"""
        Genera una nota clínica en formato SOAP basada en:

        Paciente: {patient_data}
        Datos del encuentro: {encounter_data}

        Incluye:
        - Subjetivo: Motivo de consulta, síntomas
        - Objetivo: Signos vitales, examen físico
        - Análisis: Impresión diagnóstica
        - Plan: Tratamiento y seguimiento
        """

        # ... implementación similar

    async def suggest_diagnosis(
        self,
        symptoms: list[str],
        patient_history: dict
    ) -> dict:
        """Sugiere posibles diagnósticos basados en síntomas"""

        prompt = f"""
        Basado en los siguientes síntomas: {symptoms}
        Y el historial del paciente: {patient_history}

        Proporciona:
        1. Diagnósticos diferenciales (con códigos CIE-10)
        2. Estudios recomendados
        3. Nivel de urgencia
        4. Red flags (señales de alarma)
        """

        # ... implementación

    async def check_drug_interactions(
        self,
        medications: list[str]
    ) -> dict:
        """Verifica interacciones medicamentosas"""

        prompt = f"""
        Analiza las siguientes medicaciones: {medications}

        Identifica:
        - Interacciones medicamentosas
        - Contraindicaciones
        - Nivel de severidad
        - Recomendaciones alternativas
        """

        # ... implementación
```

---

## 📊 Casos de Uso Prácticos

### 1. Importación Masiva de Pacientes

```python
# Upload CSV con datos de pacientes
csv_file = "pacientes.csv"

# La IA limpia y normaliza los datos
cleaned_data = await ai_service.normalize_import_data(
    file_path=csv_file,
    entity_type="paciente"
)

# Resultado:
# - Nombres estandarizados
# - Duplicados identificados
# - Datos faltantes completados (si es posible)
# - Errores reportados
```

### 2. Análisis de Resultados de Laboratorio

```python
# Subir PDF de laboratorio
lab_result = await ai_service.analyze_document(
    file_content=pdf_bytes,
    document_type="laboratorio",
    patient_context={
        "edad": 45,
        "genero": "femenino",
        "diagnósticos_previos": ["diabetes_tipo_2"]
    }
)

# Resultado:
{
    "valores": {
        "glucosa_ayuno": 145,
        "hba1c": 7.2,
        "colesterol_total": 220
    },
    "interpretación": "Glucosa elevada, control diabético subóptimo",
    "alertas": ["HbA1c por encima de objetivo (7.2% > 7.0%)"],
    "recomendaciones": [
        "Ajustar dosis de metformina",
        "Repetir glucosa en ayuno en 2 semanas",
        "Reforzar plan nutricional"
    ]
}
```

### 3. Generación de Receta Inteligente

```python
# Asistente de prescripción
prescription = await ai_service.generate_prescription(
    diagnosis="faringitis_aguda",
    patient={
        "edad": 28,
        "peso": 70,
        "alergias": ["penicilina"]
    }
)

# Resultado:
{
    "medicamentos": [
        {
            "nombre": "Azitromicina",
            "dosis": "500mg",
            "via": "oral",
            "frecuencia": "cada 24 horas",
            "duración": "3 días",
            "indicaciones": "Tomar con alimentos"
        }
    ],
    "justificación": "Alternativa a penicilina por alergia reportada",
    "precauciones": ["Evitar antiácidos 2 horas antes/después"]
}
```

### 4. Chat Médico con IA

```python
# Integrar un chat assistant para consultas rápidas
chat_response = await ai_service.medical_chat(
    message="¿Cuál es la dosis pediátrica de amoxicilina para un niño de 15kg?",
    context={
        "specialty": "pediatría",
        "patient_age": 4,
        "patient_weight": 15
    }
)

# Resultado:
{
    "respuesta": "Para un niño de 15kg con infección leve-moderada:
                 Amoxicilina 40-50 mg/kg/día dividido en 3 dosis.
                 Dosis calculada: 200-250mg cada 8 horas por 7-10 días.",
    "referencias": ["Guía AAP 2024", "Formulario Nacional"],
    "advertencias": ["Verificar alergias antes de prescribir"]
}
```

---

## 🔒 Privacidad y Seguridad

### Buenas Prácticas:

1. **Anonimización:**
   ```python
   # Antes de enviar a IA, remover datos sensibles
   anonymized_data = anonymize_patient_data(patient_data)
   ```

2. **Datos Encriptados:**
   - Nunca envíes datos completos sin encriptar
   - Usa solo lo necesario para el análisis

3. **Cumplimiento:**
   - HIPAA compliant (si aplica)
   - NOM-024-SSA3-2012 (México)
   - GDPR (Europa)

4. **Auditoría:**
   ```python
   # Log todas las consultas a IA
   await log_ai_query(
       user_id=current_user.id,
       query_type="diagnóstico_asistido",
       patient_id=patient.id,
       timestamp=datetime.now()
   )
   ```

---

## 💰 Costos de IA

### OpenAI GPT-4:
- Input: $0.03 / 1K tokens
- Output: $0.06 / 1K tokens
- **Estimado:** ~$0.10 por análisis de documento

### Anthropic Claude 3:
- Input: $0.015 / 1K tokens
- Output: $0.075 / 1K tokens
- **Estimado:** ~$0.08 por análisis

### Presupuesto Mensual Estimado:
- 100 análisis/día = $240-300/mes
- 500 análisis/día = $1,200-1,500/mes

---

## 🚀 Próximas Funcionalidades

- [ ] Reconocimiento de voz para dictado de notas
- [ ] Generación de reportes automáticos
- [ ] Predicción de riesgo de enfermedades
- [ ] Recomendaciones de estudios preventivos
- [ ] Chatbot para pacientes (portal)

---

## 📚 Recursos

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic Claude Docs](https://docs.anthropic.com)
- [Langchain Docs](https://python.langchain.com/docs/get_started/introduction)
- [Medical AI Best Practices](https://www.who.int/publications/i/item/9789240029200)

---

**La IA en GP-Medical está diseñada para asistir, no reemplazar, el juicio clínico profesional. Siempre verifica los resultados antes de tomar decisiones médicas.**
