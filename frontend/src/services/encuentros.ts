/**
 * Encuentros Clínicos Service
 */

import api from './api';

export interface SignoVital {
  id?: number;
  encuentro_id: number;
  registrado_por_id: number;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  presion_sistolica?: number;
  presion_diastolica?: number;
  saturacion_oxigeno?: number;
  peso?: number;
  altura?: number;
  imc?: number;
  glucosa?: number;
  escala_dolor?: number;
  notas?: string;
  fecha_hora_registro?: string;
}

export interface Diagnostico {
  id?: number;
  encuentro_id: number;
  codigo_cie10: string;
  descripcion: string;
  tipo: 'PRESUNTIVO' | 'CONFIRMADO' | 'DIFERENCIAL';
  es_principal: boolean;
  notas?: string;
}

export interface NotaClinica {
  id?: number;
  encuentro_id: number;
  medico_id: number;
  subjetivo?: string;
  objetivo?: string;
  analisis?: string;
  plan?: string;
  exploracion_fisica?: string;
  estudios_gabinete?: string;
  impresion_diagnostica?: string;
  tratamiento?: string;
  recomendaciones?: string;
  firmada: boolean;
  bloqueada: boolean;
  fecha_firma?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Procedimiento {
  id?: number;
  encuentro_id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  realizado_por_id?: number;
  resultado?: string;
  complicaciones?: string;
  precio?: number;
}

export interface EncuentroClinico {
  id: number;
  empresa_id: number;
  paciente_id: number;
  cita_id?: number;
  medico_id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  duracion_minutos?: number;
  tipo_encuentro: string;
  motivo_consulta: string;
  estado: 'EN_PROGRESO' | 'COMPLETADO' | 'CERRADO';
  resumen?: string;
  paciente?: any;
  medico?: any;
  notas_clinicas?: NotaClinica[];
  signos_vitales?: SignoVital[];
  diagnosticos?: Diagnostico[];
  procedimientos?: Procedimiento[];
  created_at: string;
  updated_at: string;
}

export const encuentrosService = {
  // ============================================================================
  // ENCUENTROS CLÍNICOS
  // ============================================================================

  async getAll(params?: {
    skip?: number;
    limit?: number;
    paciente_id?: number;
    medico_id?: number;
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<EncuentroClinico[]> {
    const response = await api.get<EncuentroClinico[]>('/encuentros/', { params });
    return response.data;
  },

  async getById(id: number): Promise<EncuentroClinico> {
    const response = await api.get<EncuentroClinico>(`/encuentros/${id}`);
    return response.data;
  },

  async create(data: Partial<EncuentroClinico>): Promise<EncuentroClinico> {
    const response = await api.post<EncuentroClinico>('/encuentros/', data);
    return response.data;
  },

  async update(id: number, data: Partial<EncuentroClinico>): Promise<EncuentroClinico> {
    const response = await api.put<EncuentroClinico>(`/encuentros/${id}`, data);
    return response.data;
  },

  async cerrar(id: number): Promise<EncuentroClinico> {
    const response = await api.post<EncuentroClinico>(`/encuentros/${id}/cerrar`);
    return response.data;
  },

  // ============================================================================
  // NOTAS CLÍNICAS (SOAP)
  // ============================================================================

  async getNotas(encuentro_id: number): Promise<NotaClinica[]> {
    const response = await api.get<NotaClinica[]>(`/encuentros/${encuentro_id}/notas`);
    return response.data;
  },

  async createNota(encuentro_id: number, data: Partial<NotaClinica>): Promise<NotaClinica> {
    const response = await api.post<NotaClinica>(`/encuentros/${encuentro_id}/notas`, data);
    return response.data;
  },

  async updateNota(nota_id: number, data: Partial<NotaClinica>): Promise<NotaClinica> {
    const response = await api.put<NotaClinica>(`/encuentros/notas/${nota_id}`, data);
    return response.data;
  },

  async firmarNota(nota_id: number): Promise<NotaClinica> {
    const response = await api.post<NotaClinica>(`/encuentros/notas/${nota_id}/firmar`);
    return response.data;
  },

  // ============================================================================
  // SIGNOS VITALES
  // ============================================================================

  async getSignosVitales(encuentro_id: number): Promise<SignoVital[]> {
    const response = await api.get<SignoVital[]>(`/encuentros/${encuentro_id}/signos-vitales`);
    return response.data;
  },

  async createSignosVitales(encuentro_id: number, data: Partial<SignoVital>): Promise<SignoVital> {
    const response = await api.post<SignoVital>(`/encuentros/${encuentro_id}/signos-vitales`, data);
    return response.data;
  },

  // ============================================================================
  // DIAGNÓSTICOS
  // ============================================================================

  async getDiagnosticos(encuentro_id: number): Promise<Diagnostico[]> {
    const response = await api.get<Diagnostico[]>(`/encuentros/${encuentro_id}/diagnosticos`);
    return response.data;
  },

  async createDiagnostico(encuentro_id: number, data: Partial<Diagnostico>): Promise<Diagnostico> {
    const response = await api.post<Diagnostico>(`/encuentros/${encuentro_id}/diagnosticos`, data);
    return response.data;
  },

  async deleteDiagnostico(diagnostico_id: number): Promise<void> {
    await api.delete(`/encuentros/diagnosticos/${diagnostico_id}`);
  },

  // ============================================================================
  // PROCEDIMIENTOS
  // ============================================================================

  async getProcedimientos(encuentro_id: number): Promise<Procedimiento[]> {
    const response = await api.get<Procedimiento[]>(`/encuentros/${encuentro_id}/procedimientos`);
    return response.data;
  },

  async createProcedimiento(encuentro_id: number, data: Partial<Procedimiento>): Promise<Procedimiento> {
    const response = await api.post<Procedimiento>(`/encuentros/${encuentro_id}/procedimientos`, data);
    return response.data;
  },

  // ============================================================================
  // CERTIFICADOS
  // ============================================================================

  async getCertificadoAptitud(encuentro_id: number): Promise<any> {
    const response = await api.get(`/encuentros/${encuentro_id}/certificado-aptitud`);
    return response.data;
  },
};

export default encuentrosService;
