/**
 * Servicio de Facturación CFDI 4.0 con Stripe
 * Gestión de órdenes de cobro, pagos y facturas
 */

import api from './api';

// ============================================================================
// INTERFACES - ÓRDENES DE COBRO
// ============================================================================

export enum EstadoOrdenCobro {
  PENDIENTE = 'pendiente',
  PARCIALMENTE_PAGADA = 'parcialmente_pagada',
  PAGADA = 'pagada',
  CANCELADA = 'cancelada',
}

export interface ConceptoOrden {
  clave_producto: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  iva_porcentaje?: number;
  subtotal: number;
  iva: number;
  total: number;
}

export interface OrdenCobro {
  id: number;
  empresa_id: number;
  paciente_id: number;
  cita_id?: number;
  usuario_cobro_id: number;
  folio: string;
  estado: EstadoOrdenCobro;
  conceptos: ConceptoOrden[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  pagado: number;
  saldo: number;
  fecha_emision: string;
  fecha_vencimiento?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface OrdenCobroCreate {
  empresa_id: number;
  usuario_cobro_id: number;
  paciente_id: number;
  cita_id?: number;
  conceptos: Partial<ConceptoOrden>[];
  descuento?: number;
  notas?: string;
  fecha_vencimiento?: string;
}

export interface OrdenCobroUpdate {
  estado?: EstadoOrdenCobro;
  notas?: string;
}

// ============================================================================
// INTERFACES - PAGOS
// ============================================================================

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  TRANSFERENCIA = 'transferencia',
  CHEQUE = 'cheque',
  DEPOSITO = 'deposito',
  OTRO = 'otro',
}

export interface Pago {
  id: number;
  orden_cobro_id: number;
  usuario_cobro_id: number;
  folio: string;
  monto: number;
  metodo_pago: MetodoPago;
  fecha_pago: string;
  referencia?: string;
  autorizacion?: string;
  ultimos_digitos_tarjeta?: string;
  confirmado: boolean;
  cancelado: boolean;
  notas?: string;
  created_at: string;
}

export interface PagoCreate {
  orden_cobro_id: number;
  usuario_cobro_id: number;
  monto: number;
  metodo_pago: MetodoPago;
  referencia?: string;
  notas?: string;
}

export interface PagoStripeCreate {
  orden_cobro_id: number;
  usuario_cobro_id: number;
  amount: number;
  currency?: string;
  payment_method_id: string;
  customer_email?: string;
}

export interface StripePaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
}

// ============================================================================
// INTERFACES - FACTURAS
// ============================================================================

export enum EstadoFactura {
  BORRADOR = 'borrador',
  TIMBRADA = 'timbrada',
  CANCELADA = 'cancelada',
}

export enum TipoComprobante {
  INGRESO = 'I',
  EGRESO = 'E',
  TRASLADO = 'T',
  PAGO = 'P',
}

export interface ConceptoFactura {
  clave_prod_serv: string;
  no_identificacion?: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  valor_unitario: number;
  importe: number;
  descuento?: number;
  objeto_imp: string;
  impuestos?: number;
}

export interface Factura {
  id: number;
  empresa_id: number;
  paciente_id: number;
  orden_cobro_id?: number;
  usuario_genera_id: number;
  tipo_comprobante: TipoComprobante;
  serie: string;
  folio: string;
  uuid?: string;
  estado: EstadoFactura;
  fecha_emision: string;
  fecha_timbrado?: string;
  fecha_cancelacion?: string;
  emisor_rfc: string;
  emisor_nombre: string;
  emisor_regimen_fiscal: string;
  receptor_rfc: string;
  receptor_nombre: string;
  receptor_uso_cfdi: string;
  receptor_domicilio_fiscal?: string;
  subtotal: number;
  descuento: number;
  total_impuestos_trasladados: number;
  total: number;
  forma_pago: string;
  metodo_pago: string;
  moneda?: string;
  conceptos: ConceptoFactura[];
  xml_url?: string;
  pdf_url?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface FacturaCreate {
  empresa_id: number;
  usuario_genera_id: number;
  paciente_id: number;
  orden_cobro_id?: number;
  tipo_comprobante?: TipoComprobante;
  serie: string;
  emisor_rfc: string;
  emisor_nombre: string;
  emisor_regimen_fiscal?: string;
  receptor_rfc: string;
  receptor_nombre: string;
  receptor_uso_cfdi?: string;
  receptor_domicilio_fiscal?: string;
  forma_pago?: string;
  metodo_pago?: string;
  conceptos: Partial<ConceptoFactura>[];
  notas?: string;
}

// ============================================================================
// INTERFACES - ESTADÍSTICAS
// ============================================================================

export interface EstadisticasIngresos {
  periodo: {
    desde: string;
    hasta: string;
  };
  total_facturado: number;
  total_cobrado: number;
  total_pendiente: number;
  num_facturas: number;
  num_pagos: number;
}

export interface EstadisticasMetodosPago {
  periodo: {
    desde: string;
    hasta: string;
  };
  por_metodo: Array<{
    metodo: string;
    cantidad: number;
    total: number;
  }>;
}

// ============================================================================
// SERVICIO
// ============================================================================

export const facturacionService = {
  // ========== ÓRDENES DE COBRO ==========

  async listOrdenesCobroAsync(filters?: {
    skip?: number;
    limit?: number;
    estado?: EstadoOrdenCobro;
    paciente_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<OrdenCobro[]> {
    const response = await api.get<OrdenCobro[]>('/facturacion/ordenes-cobro', {
      params: filters,
    });
    return response.data;
  },

  async getOrdenCobro(id: number): Promise<OrdenCobro> {
    const response = await api.get<OrdenCobro>(
      `/facturacion/ordenes-cobro/${id}`
    );
    return response.data;
  },

  async createOrdenCobro(data: OrdenCobroCreate): Promise<OrdenCobro> {
    const response = await api.post<OrdenCobro>(
      '/facturacion/ordenes-cobro',
      data
    );
    return response.data;
  },

  async updateOrdenCobro(
    id: number,
    data: OrdenCobroUpdate
  ): Promise<OrdenCobro> {
    const response = await api.put<OrdenCobro>(
      `/facturacion/ordenes-cobro/${id}`,
      data
    );
    return response.data;
  },

  async cancelOrdenCobro(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/facturacion/ordenes-cobro/${id}`
    );
    return response.data;
  },

  // ========== PAGOS ==========

  async listPagos(filters?: {
    orden_cobro_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    skip?: number;
    limit?: number;
  }): Promise<Pago[]> {
    const response = await api.get<Pago[]>('/facturacion/pagos', {
      params: filters,
    });
    return response.data;
  },

  async createPago(data: PagoCreate): Promise<Pago> {
    const response = await api.post<Pago>('/facturacion/pagos', data);
    return response.data;
  },

  async cancelPago(
    id: number,
    motivo: string
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/facturacion/pagos/${id}/cancel`,
      { motivo }
    );
    return response.data;
  },

  // ========== STRIPE ==========

  async createStripePaymentIntent(
    ordenCobroId: number
  ): Promise<StripePaymentIntent> {
    const response = await api.post<StripePaymentIntent>(
      `/facturacion/pagos/stripe/payment-intent?orden_cobro_id=${ordenCobroId}`
    );
    return response.data;
  },

  async confirmStripePayment(data: PagoStripeCreate): Promise<Pago> {
    const response = await api.post<Pago>(
      '/facturacion/pagos/stripe/confirm',
      data
    );
    return response.data;
  },

  // ========== FACTURAS ==========

  async listFacturas(filters?: {
    estado?: EstadoFactura;
    paciente_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    skip?: number;
    limit?: number;
  }): Promise<Factura[]> {
    const response = await api.get<Factura[]>('/facturacion/facturas', {
      params: filters,
    });
    return response.data;
  },

  async getFactura(id: number): Promise<Factura> {
    const response = await api.get<Factura>(`/facturacion/facturas/${id}`);
    return response.data;
  },

  async createFactura(data: FacturaCreate): Promise<Factura> {
    const response = await api.post<Factura>('/facturacion/facturas', data);
    return response.data;
  },

  async timbrarFactura(id: number): Promise<Factura> {
    const response = await api.post<Factura>(
      `/facturacion/facturas/${id}/timbrar`
    );
    return response.data;
  },

  async cancelarFactura(
    id: number,
    motivo: string
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/facturacion/facturas/${id}/cancelar`,
      { motivo }
    );
    return response.data;
  },

  // ========== ESTADÍSTICAS ==========

  async getEstadisticasIngresos(
    fecha_desde?: string,
    fecha_hasta?: string
  ): Promise<EstadisticasIngresos> {
    const response = await api.get<EstadisticasIngresos>(
      '/facturacion/estadisticas/ingresos',
      {
        params: { fecha_desde, fecha_hasta },
      }
    );
    return response.data;
  },

  async getEstadisticasMetodosPago(
    fecha_desde?: string,
    fecha_hasta?: string
  ): Promise<EstadisticasMetodosPago> {
    const response = await api.get<EstadisticasMetodosPago>(
      '/facturacion/estadisticas/metodos-pago',
      {
        params: { fecha_desde, fecha_hasta },
      }
    );
    return response.data;
  },
};
