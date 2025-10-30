/**
 * Servicio de CRM
 * Gestión de campañas, mensajes y tareas de seguimiento
 */

import api from './api';

// ============================================================================
// ENUMS
// ============================================================================

export enum TipoCampana {
  SEGUIMIENTO = 'seguimiento',
  RECORDATORIO = 'recordatorio',
  VACUNACION = 'vacunacion',
  CHEQUEO = 'chequeo',
  PROMOCIONAL = 'promocional',
  INFORMATIVA = 'informativa',
}

export enum EstadoCampana {
  BORRADOR = 'borrador',
  ACTIVA = 'activa',
  PAUSADA = 'pausada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export enum CanalMensaje {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  NOTIFICACION = 'notificacion',
}

export enum EstadoMensaje {
  PENDIENTE = 'pendiente',
  ENVIANDO = 'enviando',
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  LEIDO = 'leido',
  FALLIDO = 'fallido',
}

export enum EstadoTarea {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

export enum PrioridadTarea {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

// ============================================================================
// INTERFACES - CAMPAÑAS
// ============================================================================

export interface Campana {
  id: number;
  empresa_id: number;
  creada_por_id: number;
  nombre: string;
  tipo: TipoCampana;
  descripcion?: string;
  estado: EstadoCampana;
  segmentacion?: Record<string, any>;
  fecha_inicio?: string;
  fecha_fin?: string;
  programada: boolean;
  canal: CanalMensaje;
  asunto?: string;
  plantilla?: string;
  variables?: Record<string, any>;
  total_destinatarios: number;
  total_enviados: number;
  total_entregados: number;
  total_abiertos: number;
  total_clicks: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CampanaCreate {
  nombre: string;
  tipo: TipoCampana;
  descripcion?: string;
  estado?: EstadoCampana;
  segmentacion?: Record<string, any>;
  fecha_inicio?: string;
  fecha_fin?: string;
  programada?: boolean;
  canal: CanalMensaje;
  asunto?: string;
  plantilla?: string;
  variables?: Record<string, any>;
}

export interface CampanaUpdate {
  nombre?: string;
  tipo?: TipoCampana;
  descripcion?: string;
  estado?: EstadoCampana;
  segmentacion?: Record<string, any>;
  fecha_inicio?: string;
  fecha_fin?: string;
  programada?: boolean;
  canal?: CanalMensaje;
  asunto?: string;
  plantilla?: string;
  variables?: Record<string, any>;
}

export interface CampanaEstadisticas {
  total_campanas: number;
  campanas_activas: number;
  campanas_completadas: number;
  total_mensajes_enviados: number;
  tasa_entrega_promedio: number;
  tasa_apertura_promedio: number;
}

// ============================================================================
// INTERFACES - MENSAJES
// ============================================================================

export interface Mensaje {
  id: number;
  empresa_id: number;
  campana_id?: number;
  paciente_id?: number;
  enviado_por_id?: number;
  canal: CanalMensaje;
  destinatario: string;
  asunto?: string;
  contenido: string;
  estado: EstadoMensaje;
  fecha_programada?: string;
  fecha_envio?: string;
  fecha_entrega?: string;
  fecha_lectura?: string;
  proveedor?: string;
  proveedor_id?: string;
  intentos: number;
  error?: string;
  abierto: boolean;
  clicks: number;
  fecha_creacion: string;
}

export interface MensajeCreate {
  campana_id?: number;
  paciente_id?: number;
  canal: CanalMensaje;
  destinatario: string;
  asunto?: string;
  contenido: string;
  fecha_programada?: string;
}

export interface MensajeUpdate {
  estado?: EstadoMensaje;
  fecha_programada?: string;
}

// ============================================================================
// INTERFACES - TAREAS CRM
// ============================================================================

export interface TareaCRM {
  id: number;
  empresa_id: number;
  paciente_id?: number;
  asignada_a_id: number;
  creada_por_id: number;
  titulo: string;
  descripcion?: string;
  tipo: string;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  fecha_vencimiento?: string;
  fecha_completada?: string;
  recordatorio: boolean;
  fecha_recordatorio?: string;
  resultado?: string;
  notas?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface TareaCRMCreate {
  paciente_id?: number;
  asignada_a_id: number;
  titulo: string;
  descripcion?: string;
  tipo: string;
  estado?: EstadoTarea;
  prioridad?: PrioridadTarea;
  fecha_vencimiento?: string;
  recordatorio?: boolean;
  fecha_recordatorio?: string;
  resultado?: string;
  notas?: string;
}

export interface TareaCRMUpdate {
  titulo?: string;
  descripcion?: string;
  tipo?: string;
  estado?: EstadoTarea;
  prioridad?: PrioridadTarea;
  asignada_a_id?: number;
  paciente_id?: number;
  fecha_vencimiento?: string;
  recordatorio?: boolean;
  fecha_recordatorio?: string;
  resultado?: string;
  notas?: string;
}

export interface CompletarTareaRequest {
  resultado?: string;
  notas?: string;
}

// ============================================================================
// SERVICIO
// ============================================================================

export const crmService = {
  // ========== CAMPAÑAS ==========

  async listCampanas(params?: {
    skip?: number;
    limit?: number;
    tipo?: TipoCampana;
    estado?: EstadoCampana;
    canal?: CanalMensaje;
  }): Promise<Campana[]> {
    const response = await api.get<Campana[]>('/crm/campanas', { params });
    return response.data;
  },

  async createCampana(campana: CampanaCreate): Promise<Campana> {
    const response = await api.post<Campana>('/crm/campanas', campana);
    return response.data;
  },

  async getCampana(campanaId: number): Promise<Campana> {
    const response = await api.get<Campana>(`/crm/campanas/${campanaId}`);
    return response.data;
  },

  async updateCampana(
    campanaId: number,
    campana: CampanaUpdate
  ): Promise<Campana> {
    const response = await api.put<Campana>(
      `/crm/campanas/${campanaId}`,
      campana
    );
    return response.data;
  },

  async deleteCampana(campanaId: number): Promise<void> {
    await api.delete(`/crm/campanas/${campanaId}`);
  },

  async activarCampana(campanaId: number): Promise<Campana> {
    const response = await api.post<Campana>(
      `/crm/campanas/${campanaId}/activar`
    );
    return response.data;
  },

  async pausarCampana(campanaId: number): Promise<Campana> {
    const response = await api.post<Campana>(
      `/crm/campanas/${campanaId}/pausar`
    );
    return response.data;
  },

  async getEstadisticasCampanas(): Promise<CampanaEstadisticas> {
    const response = await api.get<CampanaEstadisticas>(
      '/crm/campanas/estadisticas'
    );
    return response.data;
  },

  // ========== MENSAJES ==========

  async listMensajes(params?: {
    skip?: number;
    limit?: number;
    campana_id?: number;
    canal?: CanalMensaje;
    estado?: EstadoMensaje;
    paciente_id?: number;
  }): Promise<Mensaje[]> {
    const response = await api.get<Mensaje[]>('/crm/mensajes', { params });
    return response.data;
  },

  async createMensaje(mensaje: MensajeCreate): Promise<Mensaje> {
    const response = await api.post<Mensaje>('/crm/mensajes', mensaje);
    return response.data;
  },

  async getMensaje(mensajeId: number): Promise<Mensaje> {
    const response = await api.get<Mensaje>(`/crm/mensajes/${mensajeId}`);
    return response.data;
  },

  async updateMensaje(
    mensajeId: number,
    mensaje: MensajeUpdate
  ): Promise<Mensaje> {
    const response = await api.put<Mensaje>(
      `/crm/mensajes/${mensajeId}`,
      mensaje
    );
    return response.data;
  },

  async enviarMensaje(mensajeId: number): Promise<Mensaje> {
    const response = await api.post<Mensaje>(
      `/crm/mensajes/${mensajeId}/enviar`
    );
    return response.data;
  },

  async deleteMensaje(mensajeId: number): Promise<void> {
    await api.delete(`/crm/mensajes/${mensajeId}`);
  },

  // ========== TAREAS CRM ==========

  async listTareas(params?: {
    skip?: number;
    limit?: number;
    asignada_a_id?: number;
    paciente_id?: number;
    estado?: EstadoTarea;
    prioridad?: PrioridadTarea;
    tipo?: string;
    vencidas?: boolean;
  }): Promise<TareaCRM[]> {
    const response = await api.get<TareaCRM[]>('/crm/tareas', { params });
    return response.data;
  },

  async createTarea(tarea: TareaCRMCreate): Promise<TareaCRM> {
    const response = await api.post<TareaCRM>('/crm/tareas', tarea);
    return response.data;
  },

  async getTarea(tareaId: number): Promise<TareaCRM> {
    const response = await api.get<TareaCRM>(`/crm/tareas/${tareaId}`);
    return response.data;
  },

  async updateTarea(tareaId: number, tarea: TareaCRMUpdate): Promise<TareaCRM> {
    const response = await api.put<TareaCRM>(`/crm/tareas/${tareaId}`, tarea);
    return response.data;
  },

  async completarTarea(
    tareaId: number,
    data: CompletarTareaRequest
  ): Promise<TareaCRM> {
    const response = await api.post<TareaCRM>(
      `/crm/tareas/${tareaId}/completar`,
      data
    );
    return response.data;
  },

  async deleteTarea(tareaId: number): Promise<void> {
    await api.delete(`/crm/tareas/${tareaId}`);
  },

  async getMisTareas(estado?: EstadoTarea): Promise<TareaCRM[]> {
    const response = await api.get<TareaCRM[]>('/crm/tareas/mis-tareas', {
      params: { estado },
    });
    return response.data;
  },
};
