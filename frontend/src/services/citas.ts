/**
 * Citas Service
 */

import api from './api';

export interface Cita {
  id: number;
  empresa_id: number;
  sede_id: number;
  paciente_id: number;
  medico_id: number;
  recurso_id?: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  duracion_minutos: number;
  estado: string;
  motivo: string;
  notas?: string;
  tipo_cita?: string;
  especialidad?: string;
  es_primera_vez: boolean;
  es_urgencia: boolean;
  created_at: string;
  updated_at: string;
}

export const citasService = {
  async getAll(params?: {
    skip?: number;
    limit?: number;
    fecha?: string;
    medico_id?: number;
    paciente_id?: number;
    estado?: string;
  }): Promise<Cita[]> {
    const response = await api.get<Cita[]>('/citas/', { params });
    return response.data;
  },

  async getToday(medico_id?: number): Promise<Cita[]> {
    const params = medico_id ? { medico_id } : {};
    const response = await api.get<Cita[]>('/citas/today', { params });
    return response.data;
  },

  async getById(id: number): Promise<Cita> {
    const response = await api.get<Cita>(`/citas/${id}`);
    return response.data;
  },

  async create(data: Partial<Cita>): Promise<Cita> {
    const response = await api.post<Cita>('/citas/', data);
    return response.data;
  },

  async update(id: number, data: Partial<Cita>): Promise<Cita> {
    const response = await api.put<Cita>(`/citas/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/citas/${id}`);
  },
};

export default citasService;
