/**
 * Servicio de Inventario y Farmacia
 * Gestión completa de productos, lotes, movimientos y proveedores
 */

import api from './api';

// ============================================================================
// INTERFACES - PRODUCTOS
// ============================================================================

export enum TipoProducto {
  MEDICAMENTO = 'medicamento',
  MATERIAL_CURACION = 'material_curacion',
  INSUMO_MEDICO = 'insumo_medico',
  EQUIPO = 'equipo',
  OTRO = 'otro',
}

export interface Producto {
  id: number;
  empresa_id: number;
  codigo: string;
  nombre: string;
  nombre_generico?: string;
  descripcion?: string;
  tipo: TipoProducto;
  categoria?: string;
  subcategoria?: string;
  principio_activo?: string;
  concentracion?: string;
  presentacion?: string;
  via_administracion?: string;
  laboratorio?: string;
  fabricante?: string;
  codigo_barras?: string;
  registro_sanitario?: string;
  requiere_lote: boolean;
  requiere_caducidad: boolean;
  manejo_controlado: boolean;
  requiere_refrigeracion: boolean;
  stock_minimo: number;
  stock_maximo?: number;
  punto_reorden?: number;
  precio_compra?: number;
  precio_venta?: number;
  iva: number;
  unidad_medida: string;
  imagen_url?: string;
  activo: boolean;
  stock_actual: number;
  lotes_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductoCreate {
  empresa_id: number;
  codigo: string;
  nombre: string;
  nombre_generico?: string;
  descripcion?: string;
  tipo: TipoProducto;
  categoria?: string;
  subcategoria?: string;
  principio_activo?: string;
  concentracion?: string;
  presentacion?: string;
  via_administracion?: string;
  laboratorio?: string;
  fabricante?: string;
  codigo_barras?: string;
  registro_sanitario?: string;
  requiere_lote?: boolean;
  requiere_caducidad?: boolean;
  manejo_controlado?: boolean;
  requiere_refrigeracion?: boolean;
  stock_minimo?: number;
  stock_maximo?: number;
  punto_reorden?: number;
  precio_compra?: number;
  precio_venta?: number;
  iva?: number;
  unidad_medida?: string;
  imagen_url?: string;
  activo?: boolean;
}

export interface ProductoUpdate {
  nombre?: string;
  nombre_generico?: string;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
  stock_minimo?: number;
  stock_maximo?: number;
  punto_reorden?: number;
  precio_compra?: number;
  precio_venta?: number;
  iva?: number;
  activo?: boolean;
}

// ============================================================================
// INTERFACES - LOTES
// ============================================================================

export interface Lote {
  id: number;
  producto_id: number;
  proveedor_id?: number;
  numero_lote: string;
  fecha_fabricacion?: string;
  fecha_caducidad?: string;
  cantidad_inicial: number;
  cantidad_actual: number;
  fecha_compra?: string;
  precio_compra_unitario?: number;
  numero_factura_compra?: string;
  ubicacion?: string;
  activo: boolean;
  bloqueado: boolean;
  motivo_bloqueo?: string;
  dias_para_caducar?: number;
  estado_caducidad: 'vigente' | 'proximo' | 'caducado';
  created_at: string;
  updated_at: string;
}

export interface LoteCreate {
  producto_id: number;
  proveedor_id?: number;
  numero_lote: string;
  fecha_fabricacion?: string;
  fecha_caducidad?: string;
  cantidad_inicial: number;
  fecha_compra?: string;
  precio_compra_unitario?: number;
  numero_factura_compra?: string;
  ubicacion?: string;
  activo?: boolean;
}

export interface LoteUpdate {
  ubicacion?: string;
  activo?: boolean;
  bloqueado?: boolean;
  motivo_bloqueo?: string;
}

// ============================================================================
// INTERFACES - MOVIMIENTOS
// ============================================================================

export enum TipoMovimiento {
  ENTRADA_COMPRA = 'entrada_compra',
  ENTRADA_DEVOLUCION = 'entrada_devolucion',
  ENTRADA_AJUSTE = 'entrada_ajuste',
  SALIDA_VENTA = 'salida_venta',
  SALIDA_USO = 'salida_uso',
  SALIDA_MERMA = 'salida_merma',
  SALIDA_AJUSTE = 'salida_ajuste',
  TRANSFERENCIA = 'transferencia',
}

export interface Movimiento {
  id: number;
  empresa_id: number;
  producto_id: number;
  lote_id?: number;
  usuario_id: number;
  tipo: TipoMovimiento;
  cantidad: number;
  cantidad_anterior?: number;
  cantidad_nueva?: number;
  referencia?: string;
  motivo?: string;
  notas?: string;
  fecha_movimiento: string;
  created_at: string;
}

export interface MovimientoCreate {
  empresa_id: number;
  usuario_id: number;
  producto_id: number;
  lote_id?: number;
  tipo: TipoMovimiento;
  cantidad: number;
  referencia?: string;
  motivo?: string;
  notas?: string;
}

// ============================================================================
// INTERFACES - PROVEEDORES
// ============================================================================

export interface Proveedor {
  id: number;
  empresa_id: number;
  nombre: string;
  razon_social?: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  sitio_web?: string;
  contacto_nombre?: string;
  contacto_telefono?: string;
  contacto_email?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  pais: string;
  cuenta_bancaria?: string;
  banco?: string;
  clabe?: string;
  dias_credito: number;
  descuento_pronto_pago: number;
  activo: boolean;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface ProveedorCreate {
  empresa_id: number;
  nombre: string;
  razon_social?: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  sitio_web?: string;
  contacto_nombre?: string;
  contacto_telefono?: string;
  contacto_email?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  pais?: string;
  cuenta_bancaria?: string;
  banco?: string;
  clabe?: string;
  dias_credito?: number;
  descuento_pronto_pago?: number;
  activo?: boolean;
  notas?: string;
}

export interface ProveedorUpdate {
  nombre?: string;
  razon_social?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
}

// ============================================================================
// INTERFACES - ALERTAS
// ============================================================================

export interface AlertaStockBajo {
  producto_id: number;
  codigo: string;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  diferencia: number;
  nivel_criticidad: 'critico' | 'bajo';
}

export interface AlertaCaducidad {
  lote_id: number;
  producto_id: number;
  producto_nombre: string;
  numero_lote: string;
  fecha_caducidad: string;
  dias_para_caducar: number;
  cantidad_actual: number;
  nivel_criticidad: 'caducado' | 'critico' | 'urgente' | 'advertencia';
}

export interface Estadisticas {
  total_productos: number;
  productos_por_tipo: Record<string, number>;
  total_lotes: number;
  valor_inventario: number;
  movimientos_ultimo_mes: number;
}

// ============================================================================
// SERVICIO
// ============================================================================

export const inventarioService = {
  // ========== PRODUCTOS ==========

  async listProductos(filters?: {
    skip?: number;
    limit?: number;
    search?: string;
    tipo?: TipoProducto;
    categoria?: string;
    activo?: boolean;
    solo_bajo_stock?: boolean;
  }): Promise<Producto[]> {
    const response = await api.get<Producto[]>('/inventario/productos', {
      params: filters,
    });
    return response.data;
  },

  async getProducto(id: number): Promise<Producto> {
    const response = await api.get<Producto>(`/inventario/productos/${id}`);
    return response.data;
  },

  async createProducto(data: ProductoCreate): Promise<Producto> {
    const response = await api.post<Producto>('/inventario/productos', data);
    return response.data;
  },

  async updateProducto(id: number, data: ProductoUpdate): Promise<Producto> {
    const response = await api.put<Producto>(
      `/inventario/productos/${id}`,
      data
    );
    return response.data;
  },

  async deleteProducto(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/inventario/productos/${id}`
    );
    return response.data;
  },

  // ========== LOTES ==========

  async listLotes(filters?: {
    producto_id?: number;
    activo?: boolean;
    proximo_a_caducar?: boolean;
    dias_alerta?: number;
    skip?: number;
    limit?: number;
  }): Promise<Lote[]> {
    const response = await api.get<Lote[]>('/inventario/lotes', {
      params: filters,
    });
    return response.data;
  },

  async createLote(data: LoteCreate): Promise<Lote> {
    const response = await api.post<Lote>('/inventario/lotes', data);
    return response.data;
  },

  async updateLote(id: number, data: LoteUpdate): Promise<Lote> {
    const response = await api.put<Lote>(`/inventario/lotes/${id}`, data);
    return response.data;
  },

  // ========== MOVIMIENTOS ==========

  async listMovimientos(filters?: {
    producto_id?: number;
    tipo?: TipoMovimiento;
    fecha_desde?: string;
    fecha_hasta?: string;
    skip?: number;
    limit?: number;
  }): Promise<Movimiento[]> {
    const response = await api.get<Movimiento[]>('/inventario/movimientos', {
      params: filters,
    });
    return response.data;
  },

  async createMovimiento(data: MovimientoCreate): Promise<Movimiento> {
    const response = await api.post<Movimiento>(
      '/inventario/movimientos',
      data
    );
    return response.data;
  },

  // ========== PROVEEDORES ==========

  async listProveedores(filters?: {
    search?: string;
    activo?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<Proveedor[]> {
    const response = await api.get<Proveedor[]>('/inventario/proveedores', {
      params: filters,
    });
    return response.data;
  },

  async createProveedor(data: ProveedorCreate): Promise<Proveedor> {
    const response = await api.post<Proveedor>(
      '/inventario/proveedores',
      data
    );
    return response.data;
  },

  async updateProveedor(
    id: number,
    data: ProveedorUpdate
  ): Promise<Proveedor> {
    const response = await api.put<Proveedor>(
      `/inventario/proveedores/${id}`,
      data
    );
    return response.data;
  },

  async deleteProveedor(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/inventario/proveedores/${id}`
    );
    return response.data;
  },

  // ========== ALERTAS ==========

  async getAlertasStockBajo(): Promise<{
    total: number;
    alertas: AlertaStockBajo[];
  }> {
    const response = await api.get<{ total: number; alertas: AlertaStockBajo[] }>(
      '/inventario/alertas/stock-bajo'
    );
    return response.data;
  },

  async getAlertasCaducidad(
    dias_alerta: number = 90
  ): Promise<{
    total: number;
    caducados: { total: number; lotes: AlertaCaducidad[] };
    proximos_a_caducar: { total: number; lotes: AlertaCaducidad[] };
  }> {
    const response = await api.get('/inventario/alertas/caducidad', {
      params: { dias_alerta },
    });
    return response.data;
  },

  // ========== ESTADÍSTICAS ==========

  async getEstadisticas(): Promise<Estadisticas> {
    const response = await api.get<Estadisticas>(
      '/inventario/estadisticas/inventario'
    );
    return response.data;
  },
};
