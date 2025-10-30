/**
 * Pacientes Service
 */

import api from './api';

export interface Paciente {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: string;
  email?: string;
  telefono?: string;
  celular?: string;
  numero_expediente: string;
  created_at: string;
  updated_at: string;
}

export const pacientesService = {
  async getAll(params?: {
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<Paciente[]> {
    const response = await api.get<Paciente[]>('/pacientes/', { params });
    return response.data;
  },

  async getById(id: number): Promise<Paciente> {
    const response = await api.get<Paciente>(`/pacientes/${id}`);
    return response.data;
  },

  async create(data: Partial<Paciente>): Promise<Paciente> {
    const response = await api.post<Paciente>('/pacientes/', data);
    return response.data;
  },

  async update(id: number, data: Partial<Paciente>): Promise<Paciente> {
    const response = await api.put<Paciente>(`/pacientes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/pacientes/${id}`);
  },
};

export default pacientesService;
