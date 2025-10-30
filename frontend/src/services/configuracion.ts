/**
 * Servicio de Configuración
 * Gestión de empresas, sedes y configuración del sistema
 */

import api from './api';

// ============================================================================
// INTERFACES - EMPRESAS
// ============================================================================

export interface Empresa {
  id: number;
  nombre: string;
  razon_social: string;
  rfc: string;
  slug: string;
  email: string;
  telefono?: string;
  sitio_web?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  pais: string;
  logotipo_url?: string;
  color_primario: string;
  color_secundario: string;
  regimen_fiscal?: string;
  serie_factura: string;
  serie_nota_credito: string;
  folio_actual_factura: number;
  folio_actual_nota_credito: number;
  configuracion?: Record<string, any>;
  activo: boolean;
  plan: string;
  fecha_vencimiento_plan?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EmpresaCreate {
  nombre: string;
  razon_social: string;
  rfc: string;
  slug: string;
  email: string;
  telefono?: string;
  sitio_web?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  pais?: string;
  logotipo_url?: string;
  color_primario?: string;
  color_secundario?: string;
  regimen_fiscal?: string;
  serie_factura?: string;
  serie_nota_credito?: string;
  configuracion?: Record<string, any>;
  plan?: string;
}

export interface EmpresaUpdate {
  nombre?: string;
  razon_social?: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  sitio_web?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  logotipo_url?: string;
  color_primario?: string;
  color_secundario?: string;
  regimen_fiscal?: string;
  serie_factura?: string;
  serie_nota_credito?: string;
  configuracion?: Record<string, any>;
  plan?: string;
  activo?: boolean;
}

// ============================================================================
// INTERFACES - SEDES
// ============================================================================

export interface Sede {
  id: number;
  empresa_id: number;
  nombre: string;
  codigo: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  horario?: Record<string, any>;
  configuracion?: Record<string, any>;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SedeCreate {
  empresa_id: number;
  nombre: string;
  codigo: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  horario?: Record<string, any>;
  configuracion?: Record<string, any>;
}

export interface SedeUpdate {
  nombre?: string;
  codigo?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  horario?: Record<string, any>;
  configuracion?: Record<string, any>;
  activo?: boolean;
}

// ============================================================================
// INTERFACES - CONFIGURACIÓN
// ============================================================================

export interface ConfiguracionGeneral {
  // Notificaciones
  notificaciones_email: boolean;
  notificaciones_sms: boolean;
  notificaciones_whatsapp: boolean;

  // Citas
  duracion_cita_default: number;
  recordatorio_citas_horas: number;
  permitir_cancelacion_horas: number;

  // Facturación
  iva_default: number;
  retencion_isr: number;
  retencion_iva: number;

  // Inventario
  alerta_stock_minimo: boolean;
  alerta_caducidad_dias: number;

  // Seguridad
  sesion_timeout_minutos: number;
  requiere_2fa: boolean;

  // Idioma y formato
  idioma: string;
  zona_horaria: string;
  formato_fecha: string;
  formato_moneda: string;
}

// ============================================================================
// SERVICIO
// ============================================================================

export const configuracionService = {
  // ========== EMPRESAS ==========

  async listEmpresas(params?: {
    skip?: number;
    limit?: number;
    activo?: boolean;
    search?: string;
  }): Promise<Empresa[]> {
    const response = await api.get<Empresa[]>('/empresas', { params });
    return response.data;
  },

  async createEmpresa(empresa: EmpresaCreate): Promise<Empresa> {
    const response = await api.post<Empresa>('/empresas', empresa);
    return response.data;
  },

  async getEmpresa(empresaId: number): Promise<Empresa> {
    const response = await api.get<Empresa>(`/empresas/${empresaId}`);
    return response.data;
  },

  async updateEmpresa(empresaId: number, empresa: EmpresaUpdate): Promise<Empresa> {
    const response = await api.put<Empresa>(`/empresas/${empresaId}`, empresa);
    return response.data;
  },

  async deleteEmpresa(empresaId: number): Promise<void> {
    await api.delete(`/empresas/${empresaId}`);
  },

  // ========== SEDES ==========

  async listSedes(empresaId: number, activo?: boolean): Promise<Sede[]> {
    const response = await api.get<Sede[]>(`/empresas/${empresaId}/sedes`, {
      params: { activo },
    });
    return response.data;
  },

  async createSede(sede: SedeCreate): Promise<Sede> {
    const response = await api.post<Sede>('/empresas/sedes', sede);
    return response.data;
  },

  async getSede(sedeId: number): Promise<Sede> {
    const response = await api.get<Sede>(`/empresas/sedes/${sedeId}`);
    return response.data;
  },

  async updateSede(sedeId: number, sede: SedeUpdate): Promise<Sede> {
    const response = await api.put<Sede>(`/empresas/sedes/${sedeId}`, sede);
    return response.data;
  },

  async deleteSede(sedeId: number): Promise<void> {
    await api.delete(`/empresas/sedes/${sedeId}`);
  },

  // ========== CONFIGURACIÓN ==========

  async getConfiguracion(empresaId: number): Promise<ConfiguracionGeneral> {
    const response = await api.get<ConfiguracionGeneral>(
      `/empresas/${empresaId}/configuracion`
    );
    return response.data;
  },

  async updateConfiguracion(
    empresaId: number,
    config: ConfiguracionGeneral
  ): Promise<ConfiguracionGeneral> {
    const response = await api.put<ConfiguracionGeneral>(
      `/empresas/${empresaId}/configuracion`,
      config
    );
    return response.data;
  },
};
