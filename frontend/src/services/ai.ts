/**
 * AI Services
 * - Chatbot médico
 * - Asistente de diagnóstico
 * - Asistente de recetas
 * - Speech-to-text
 * - Knowledge base
 */

import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  use_medical_kb?: boolean;
  use_system_kb?: boolean;
}

export interface ChatResponse {
  response: string;
  sources?: any[];
  tokens_used: number;
  model: string;
}

export interface DiagnosisAssistRequest {
  sintomas: string;
  signos_vitales?: any;
  antecedentes?: string;
  exploracion_fisica?: string;
}

export interface PrescriptionSuggestion {
  dosis: string;
  frecuencia: string;
  duracion: string;
  via_administracion: string;
  indicaciones_adicionales: string;
  advertencias: string;
}

export interface CompletePrescriptionRequest {
  diagnostico: string;
  sintomas: string;
  edad_paciente: number;
  peso_paciente?: number;
  alergias?: string;
}

export interface TranscriptionResponse {
  text: string;
  language: string;
  duration: number;
}

export interface KBStats {
  medical_documents: number;
  system_documents: number;
  total_documents: number;
}

export const aiService = {
  // ============================================================================
  // CHATBOT
  // ============================================================================

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/ai/chat', request);
    return response.data;
  },

  async quickChat(message: string): Promise<{ response: string }> {
    const response = await api.post('/ai/chat/quick', null, {
      params: { message }
    });
    return response.data;
  },

  // ============================================================================
  // ASISTENTE DE DIAGNÓSTICO
  // ============================================================================

  async assistDiagnosis(request: DiagnosisAssistRequest): Promise<any> {
    const response = await api.post('/ai/diagnosis/assist', request);
    return response.data;
  },

  // ============================================================================
  // ASISTENTE DE RECETAS
  // ============================================================================

  async suggestPrescription(params: {
    medicamento: string;
    diagnostico?: string;
    edad_paciente?: number;
    peso_paciente?: number;
  }): Promise<PrescriptionSuggestion> {
    const response = await api.post<PrescriptionSuggestion>(
      '/ai/prescription/suggest',
      params
    );
    return response.data;
  },

  async generateCompletePrescription(
    request: CompletePrescriptionRequest
  ): Promise<any> {
    const response = await api.post('/ai/prescription/generate', request);
    return response.data;
  },

  // ============================================================================
  // SPEECH-TO-TEXT
  // ============================================================================

  async transcribeAudio(
    audioFile: File,
    language: string = 'es'
  ): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);

    const response = await api.post<TranscriptionResponse>(
      '/ai/speech/transcribe',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async improveNote(params: {
    transcription: string;
    note_type: 'soap' | 'general';
  }): Promise<any> {
    const response = await api.post('/ai/speech/improve-note', params);
    return response.data;
  },

  // ============================================================================
  // KNOWLEDGE BASE (Solo Admin)
  // ============================================================================

  async uploadDocument(params: {
    file: File;
    collection_type: 'medical' | 'system';
    title: string;
    category: string;
    tags: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('collection_type', params.collection_type);
    formData.append('title', params.title);
    formData.append('category', params.category);
    formData.append('tags', params.tags);

    const response = await api.post('/ai/kb/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async searchKB(params: {
    query: string;
    collection_type: 'medical' | 'system';
    n_results: number;
  }): Promise<any> {
    const response = await api.post('/ai/kb/search', params);
    return response.data;
  },

  async getKBStats(): Promise<KBStats> {
    const response = await api.get<KBStats>('/ai/kb/stats');
    return response.data;
  },

  async clearCollection(
    collection_type: 'medical' | 'system'
  ): Promise<any> {
    const response = await api.delete(`/ai/kb/clear/${collection_type}`);
    return response.data;
  },
};

export default aiService;
