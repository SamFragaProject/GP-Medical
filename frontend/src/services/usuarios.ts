/**
 * Servicio de Gestión de Usuarios
 * Maneja todas las operaciones relacionadas con usuarios del sistema
 */

import api from './api';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Usuario {
  id: number;
  empresa_id: number;
  email: string;
  username: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  celular?: string;
  cedula_profesional?: string;
  especialidad?: string;
  subespecialidad?: string;
  is_active: boolean;
  is_superuser: boolean;
  ultimo_acceso?: string;
  created_at: string;
  updated_at: string;
}

export interface UsuarioWithRoles extends Usuario {
  roles: Array<{
    id: number;
    nombre: string;
    descripcion?: string;
  }>;
}

export interface UsuarioCreate {
  email: string;
  username: string;
  password: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  celular?: string;
  cedula_profesional?: string;
  especialidad?: string;
  subespecialidad?: string;
  empresa_id: number;
  rol_id?: number;
}

export interface UsuarioUpdate {
  email?: string;
  username?: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  telefono?: string;
  celular?: string;
  cedula_profesional?: string;
  especialidad?: string;
  subespecialidad?: string;
  is_active?: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ResetPasswordRequest {
  new_password: string;
}

export interface UsuarioFilters {
  skip?: number;
  limit?: number;
  search?: string;
  rol_id?: number;
  is_active?: boolean;
  especialidad?: string;
}

export interface UsuarioStats {
  total: number;
  activos: number;
  inactivos: number;
  medicos: number;
}

// ============================================================================
// SERVICIO
// ============================================================================

export const usuariosService = {
  /**
   * Lista todos los usuarios con filtros opcionales
   */
  async list(filters: UsuarioFilters = {}): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>('/usuarios/', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtiene un usuario por ID con sus roles
   */
  async getById(id: number): Promise<UsuarioWithRoles> {
    const response = await api.get<UsuarioWithRoles>(`/usuarios/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo usuario
   */
  async create(data: UsuarioCreate): Promise<Usuario> {
    const response = await api.post<Usuario>('/usuarios/', data);
    return response.data;
  },

  /**
   * Actualiza un usuario existente
   */
  async update(id: number, data: UsuarioUpdate): Promise<Usuario> {
    const response = await api.put<Usuario>(`/usuarios/${id}`, data);
    return response.data;
  },

  /**
   * Desactiva un usuario (soft delete)
   */
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/usuarios/${id}`);
    return response.data;
  },

  /**
   * Cambia la contraseña del usuario actual
   */
  async changePassword(
    userId: number,
    passwords: ChangePasswordRequest
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/usuarios/${userId}/change-password`,
      passwords
    );
    return response.data;
  },

  /**
   * Resetea la contraseña de un usuario (solo admin)
   */
  async resetPassword(
    userId: number,
    passwords: ResetPasswordRequest
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/usuarios/${userId}/reset-password`,
      passwords
    );
    return response.data;
  },

  /**
   * Activa un usuario desactivado
   */
  async activate(id: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/usuarios/${id}/activate`
    );
    return response.data;
  },

  /**
   * Desactiva un usuario
   */
  async deactivate(id: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/usuarios/${id}/deactivate`
    );
    return response.data;
  },

  /**
   * Busca médicos (usuarios con cédula profesional)
   */
  async searchMedicos(
    search?: string,
    especialidad?: string,
    limit: number = 50
  ): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>('/usuarios/search/medicos', {
      params: {
        search,
        especialidad,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Obtiene estadísticas de usuarios
   */
  async getStats(): Promise<UsuarioStats> {
    const response = await api.get<UsuarioStats>('/usuarios/stats/summary');
    return response.data;
  },
};
