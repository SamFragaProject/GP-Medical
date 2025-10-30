/**
 * Recetas Service
 */

import api from './api';

export interface DetalleReceta {
  id?: number;
  medicamento: string;
  presentacion?: string;
  concentracion?: string;
  dosis: string;
  via_administracion?: string;
  frecuencia: string;
  duracion?: string;
  indicaciones: string;
  cantidad: number;
  cantidad_dispensada?: number;
  dispensada?: boolean;
  producto_id?: number;
}

export interface Receta {
  id: number;
  empresa_id: number;
  paciente_id: number;
  encuentro_id?: number;
  medico_id: number;
  folio: string;
  codigo_qr?: string;
  estado: string;
  fecha_emision: string;
  fecha_vigencia?: string;
  diagnostico?: string;
  indicaciones_generales?: string;
  firmada: boolean;
  fecha_firma?: string;
  pdf_url?: string;
  detalles: DetalleReceta[];
  paciente?: any;
  medico?: any;
  created_at: string;
  updated_at: string;
}

export interface RecetaCreate {
  paciente_id: number;
  encuentro_id?: number;
  diagnostico?: string;
  indicaciones_generales?: string;
  fecha_vigencia?: string;
  detalles: Omit<DetalleReceta, 'id' | 'cantidad_dispensada' | 'dispensada'>[];
}

export const recetasService = {
  async getAll(params?: {
    skip?: number;
    limit?: number;
    paciente_id?: number;
    medico_id?: number;
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<Receta[]> {
    const response = await api.get<Receta[]>('/recetas/', { params });
    return response.data;
  },

  async getById(id: number): Promise<Receta> {
    const response = await api.get<Receta>(`/recetas/${id}`);
    return response.data;
  },

  async create(data: RecetaCreate): Promise<Receta> {
    const response = await api.post<Receta>('/recetas/', data);
    return response.data;
  },

  async update(
    id: number,
    data: {
      diagnostico?: string;
      indicaciones_generales?: string;
      fecha_vigencia?: string;
      estado?: string;
    }
  ): Promise<Receta> {
    const response = await api.put<Receta>(`/recetas/${id}`, data);
    return response.data;
  },

  async firmar(id: number): Promise<any> {
    const response = await api.post(`/recetas/${id}/firmar`);
    return response.data;
  },

  async delete(id: number): Promise<any> {
    const response = await api.delete(`/recetas/${id}`);
    return response.data;
  },

  async addDetalle(
    receta_id: number,
    detalle: Omit<DetalleReceta, 'id' | 'cantidad_dispensada' | 'dispensada'>
  ): Promise<DetalleReceta> {
    const response = await api.post<DetalleReceta>(
      `/recetas/${receta_id}/detalles`,
      detalle
    );
    return response.data;
  },

  async deleteDetalle(detalle_id: number): Promise<any> {
    const response = await api.delete(`/recetas/detalles/${detalle_id}`);
    return response.data;
  },

  async getHistorial(paciente_id: number): Promise<Receta[]> {
    const response = await api.get<Receta[]>(
      `/recetas/paciente/${paciente_id}/historial`
    );
    return response.data;
  },

  // ============================================================================
  // ASISTENCIA CON IA
  // ============================================================================

  async aiSuggestDosage(params: {
    medicamento: string;
    diagnostico?: string;
    edad_paciente?: number;
    peso_paciente?: number;
  }): Promise<any> {
    const response = await api.post('/recetas/ai/suggest-dosage', params);
    return response.data;
  },

  async aiGenerateComplete(params: {
    diagnostico: string;
    sintomas: string;
    edad_paciente: number;
    peso_paciente?: number;
    alergias?: string;
  }): Promise<any> {
    const response = await api.post('/recetas/ai/generate-complete', params);
    return response.data;
  },
};

export default recetasService;
