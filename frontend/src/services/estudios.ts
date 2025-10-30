/**
 * Órdenes de Estudios Service
 * Laboratorio, Imagenología y Gabinete
 */

import api from './api';

export interface EstudioItem {
  id: string;
  nombre: string;
}

export interface OrdenEstudio {
  id: number;
  empresa_id: number;
  paciente_id: number;
  encuentro_id?: number;
  medico_solicitante_id: number;
  folio: string;
  tipo: string;
  categoria: string;
  estudios: EstudioItem[];
  indicaciones_clinicas?: string;
  preparacion?: string;
  estado: string;
  fecha_solicitud: string;
  fecha_programada?: string;
  fecha_realizacion?: string;
  urgente: boolean;
  pdf_url?: string;
  paciente?: any;
  medico_solicitante?: any;
  resultados: ResultadoEstudio[];
  created_at: string;
  updated_at: string;
}

export interface ResultadoEstudio {
  id: number;
  orden_id: number;
  cargado_por_id: number;
  nombre_estudio: string;
  interpretacion?: string;
  observaciones?: string;
  archivo_url?: string;
  archivo_nombre?: string;
  archivo_tipo?: string;
  datos?: any;
  fecha_resultado: string;
  fecha_carga: string;
  notificado_medico: boolean;
  notificado_paciente: boolean;
  fecha_notificacion?: string;
  validado_por_id?: number;
  fecha_validacion?: string;
}

export interface OrdenEstudioCreate {
  paciente_id: number;
  encuentro_id?: number;
  tipo: string;
  categoria: string;
  estudios: EstudioItem[];
  indicaciones_clinicas?: string;
  preparacion?: string;
  fecha_programada?: string;
  urgente?: boolean;
}

export interface ResultadoEstudioCreate {
  nombre_estudio: string;
  interpretacion?: string;
  observaciones?: string;
  datos?: any;
  fecha_resultado: string;
}

export const estudiosService = {
  // ============================================================================
  // CATÁLOGO
  // ============================================================================

  async getCatalogo(): Promise<any> {
    const response = await api.get('/estudios/catalogo');
    return response.data;
  },

  async getCatalogoPorTipo(tipo: string): Promise<any> {
    const response = await api.get(`/estudios/catalogo/${tipo}`);
    return response.data;
  },

  async getEstudiosPorCategoria(
    tipo: string,
    categoria: string
  ): Promise<any> {
    const response = await api.get(`/estudios/catalogo/${tipo}/${categoria}`);
    return response.data;
  },

  // ============================================================================
  // ÓRDENES CRUD
  // ============================================================================

  async getAll(params?: {
    skip?: number;
    limit?: number;
    paciente_id?: number;
    medico_id?: number;
    tipo?: string;
    estado?: string;
    urgente?: boolean;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<OrdenEstudio[]> {
    const response = await api.get<OrdenEstudio[]>('/estudios/', { params });
    return response.data;
  },

  async getById(id: number): Promise<OrdenEstudio> {
    const response = await api.get<OrdenEstudio>(`/estudios/${id}`);
    return response.data;
  },

  async create(data: OrdenEstudioCreate): Promise<OrdenEstudio> {
    const response = await api.post<OrdenEstudio>('/estudios/', data);
    return response.data;
  },

  async update(
    id: number,
    data: {
      estado?: string;
      fecha_programada?: string;
      fecha_realizacion?: string;
      urgente?: boolean;
    }
  ): Promise<OrdenEstudio> {
    const response = await api.put<OrdenEstudio>(`/estudios/${id}`, data);
    return response.data;
  },

  async cancel(id: number): Promise<any> {
    const response = await api.delete(`/estudios/${id}`);
    return response.data;
  },

  async completar(id: number): Promise<any> {
    const response = await api.post(`/estudios/${id}/completar`);
    return response.data;
  },

  // ============================================================================
  // RESULTADOS
  // ============================================================================

  async getResultados(orden_id: number): Promise<ResultadoEstudio[]> {
    const response = await api.get<ResultadoEstudio[]>(
      `/estudios/${orden_id}/resultados`
    );
    return response.data;
  },

  async createResultado(
    orden_id: number,
    data: ResultadoEstudioCreate
  ): Promise<ResultadoEstudio> {
    const response = await api.post<ResultadoEstudio>(
      `/estudios/${orden_id}/resultados`,
      data
    );
    return response.data;
  },

  async uploadArchivoResultado(
    orden_id: number,
    resultado_id: number,
    archivo: File
  ): Promise<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const response = await api.post(
      `/estudios/${orden_id}/resultados/${resultado_id}/archivo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // ============================================================================
  // HISTORIAL
  // ============================================================================

  async getHistorial(paciente_id: number): Promise<OrdenEstudio[]> {
    const response = await api.get<OrdenEstudio[]>(
      `/estudios/paciente/${paciente_id}/historial`
    );
    return response.data;
  },
};

export default estudiosService;
