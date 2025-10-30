/**
 * Servicio de Reportes y Estadísticas
 * Generación de reportes operativos, financieros y médicos
 */

import api from './api';

// ============================================================================
// INTERFACES
// ============================================================================

export interface PeriodoReporte {
  desde: string;
  hasta: string;
}

export interface ReporteCitas {
  periodo: PeriodoReporte;
  total_citas: number;
  citas_por_estado: Record<string, number>;
  citas_por_mes: Array<{
    año: number;
    mes: number;
    total: number;
  }>;
  citas_por_medico: Array<{
    medico: string;
    total_citas: number;
  }>;
  tasa_asistencia: number;
  tasa_cancelacion: number;
}

export interface ReporteIngresos {
  periodo: PeriodoReporte;
  total_facturado: number;
  total_cobrado: number;
  total_pendiente: number;
  ingresos_por_mes: Array<{
    año: number;
    mes: number;
    total: number;
  }>;
  ingresos_por_servicio: Array<{
    servicio: string;
    total: number;
  }>;
  metodos_pago: Array<{
    metodo: string;
    cantidad: number;
    total: number;
  }>;
}

export interface ReporteOperativo {
  periodo: PeriodoReporte;
  total_pacientes: number;
  nuevos_pacientes: number;
  total_consultas: number;
  total_recetas: number;
  total_estudios: number;
  productividad_medicos: Array<{
    medico: string;
    total_consultas: number;
  }>;
  tiempo_promedio_atencion?: number;
}

export interface ReporteMedico {
  periodo: PeriodoReporte;
  diagnosticos_frecuentes: Array<{
    diagnostico: string;
    frecuencia: number;
  }>;
  medicamentos_recetados: Array<{
    medicamento: string;
    cantidad: number;
  }>;
  estudios_solicitados: Array<{
    tipo: string;
    total: number;
  }>;
  cie10_frecuentes: Array<{
    codigo: string;
    nombre: string;
    frecuencia: number;
  }>;
}

export interface DashboardEjecutivo {
  citas_hoy: number;
  ingresos_ultima_semana: number;
  pendiente_cobro: number;
  pacientes_atendidos_semana: number;
  fecha_actualizacion: string;
}

// ============================================================================
// SERVICIO
// ============================================================================

export const reportesService = {
  // ========== REPORTES DE CITAS ==========

  async getReporteCitas(
    fecha_desde?: string,
    fecha_hasta?: string
  ): Promise<ReporteCitas> {
    const response = await api.get<ReporteCitas>('/reportes/citas', {
      params: { fecha_desde, fecha_hasta },
    });
    return response.data;
  },

  // ========== REPORTES FINANCIEROS ==========

  async getReporteIngresos(
    fecha_desde?: string,
    fecha_hasta?: string
  ): Promise<ReporteIngresos> {
    const response = await api.get<ReporteIngresos>('/reportes/ingresos', {
      params: { fecha_desde, fecha_hasta },
    });
    return response.data;
  },

  // ========== REPORTES OPERATIVOS ==========

  async getReporteOperativo(
    fecha_desde?: string,
    fecha_hasta?: string
  ): Promise<ReporteOperativo> {
    const response = await api.get<ReporteOperativo>('/reportes/operativo', {
      params: { fecha_desde, fecha_hasta },
    });
    return response.data;
  },

  // ========== REPORTES MÉDICOS ==========

  async getReporteMedico(
    fecha_desde?: string,
    fecha_hasta?: string
  ): Promise<ReporteMedico> {
    const response = await api.get<ReporteMedico>('/reportes/medico', {
      params: { fecha_desde, fecha_hasta },
    });
    return response.data;
  },

  // ========== DASHBOARD EJECUTIVO ==========

  async getDashboardEjecutivo(): Promise<DashboardEjecutivo> {
    const response = await api.get<DashboardEjecutivo>(
      '/reportes/dashboard-ejecutivo'
    );
    return response.data;
  },

  // ========== EXPORTACIÓN ==========

  async exportarExcel(
    tipo_reporte: 'citas' | 'ingresos' | 'operativo' | 'medico',
    fecha_desde?: string,
    fecha_hasta?: string
  ): Promise<Blob> {
    const response = await api.get('/reportes/exportar/excel', {
      params: { tipo_reporte, fecha_desde, fecha_hasta },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportarPDF(
    tipo_reporte: 'citas' | 'ingresos' | 'operativo' | 'medico',
    fecha_desde?: string,
    fecha_hasta?: string
  ): Promise<Blob> {
    const response = await api.get('/reportes/exportar/pdf', {
      params: { tipo_reporte, fecha_desde, fecha_hasta },
      responseType: 'blob',
    });
    return response.data;
  },
};
