"use client"

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  CreditCard,
  FileText,
  Receipt,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  facturacionService,
  OrdenCobro,
  OrdenCobroCreate,
  Pago,
  PagoCreate,
  Factura,
  EstadoOrdenCobro,
  MetodoPago,
  EstadisticasIngresos,
} from '@/services/facturacion';

export default function FacturacionPage() {
  const [activeTab, setActiveTab] = useState('pos');

  // Estados
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState<EstadisticasIngresos | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenCobro[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);

  // POS - Carrito
  const [carrito, setCarrito] = useState<Array<{
    clave_producto: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
  }>>([]);
  const [pacienteId, setPacienteId] = useState<number>(0);

  // Dialogs
  const [procesarPagoOpen, setProcesarPagoOpen] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCobro | null>(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<MetodoPago>(MetodoPago.EFECTIVO);
  const [montoPago, setMontoPago] = useState<number>(0);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  useEffect(() => {
    if (activeTab === 'ordenes') {
      loadOrdenes();
    } else if (activeTab === 'pagos') {
      loadPagos();
    } else if (activeTab === 'facturas') {
      loadFacturas();
    }
  }, [activeTab]);

  const loadEstadisticas = async () => {
    setLoading(true);
    try {
      const stats = await facturacionService.getEstadisticasIngresos();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrdenes = async () => {
    setLoading(true);
    try {
      const data = await facturacionService.listOrdenesCobroAsync({ limit: 100 });
      setOrdenes(data);
    } catch (error) {
      console.error('Error loading ordenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPagos = async () => {
    setLoading(true);
    try {
      const data = await facturacionService.listPagos({ limit: 100 });
      setPagos(data);
    } catch (error) {
      console.error('Error loading pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFacturas = async () => {
    setLoading(true);
    try {
      const data = await facturacionService.listFacturas({ limit: 100 });
      setFacturas(data);
    } catch (error) {
      console.error('Error loading facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = () => {
    const nuevoItem = {
      clave_producto: 'SERV001',
      descripcion: 'Consulta Médica',
      cantidad: 1,
      precio_unitario: 500,
    };
    setCarrito([...carrito, nuevoItem]);
  };

  const calcularTotales = () => {
    const subtotal = carrito.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const crearOrden = async () => {
    if (!pacienteId || carrito.length === 0) {
      alert('Selecciona un paciente y agrega productos al carrito');
      return;
    }

    const { subtotal, iva, total } = calcularTotales();

    const conceptos = carrito.map(item => ({
      clave_producto: item.clave_producto,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario,
      iva: (item.cantidad * item.precio_unitario) * 0.16,
      total: (item.cantidad * item.precio_unitario) * 1.16,
      iva_porcentaje: 16,
      descuento: 0,
    }));

    try {
      await facturacionService.createOrdenCobro({
        empresa_id: 1,
        usuario_cobro_id: 1,
        paciente_id: pacienteId,
        conceptos,
        descuento: 0,
      });

      alert('Orden creada exitosamente');
      setCarrito([]);
      setPacienteId(0);
      loadOrdenes();
      loadEstadisticas();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const abrirDialogoPago = (orden: OrdenCobro) => {
    setOrdenSeleccionada(orden);
    setMontoPago(orden.saldo);
    setProcesarPagoOpen(true);
  };

  const procesarPago = async () => {
    if (!ordenSeleccionada) return;

    try {
      if (metodoPagoSeleccionado === MetodoPago.TARJETA) {
        // Stripe integration (simulado)
        alert('En producción, aquí se procesaría con Stripe Payment Intent');

        // Simular pago con tarjeta
        await facturacionService.createPago({
          orden_cobro_id: ordenSeleccionada.id,
          usuario_cobro_id: 1,
          monto: montoPago,
          metodo_pago: MetodoPago.TARJETA,
          notas: 'Pago con tarjeta',
        });
      } else {
        await facturacionService.createPago({
          orden_cobro_id: ordenSeleccionada.id,
          usuario_cobro_id: 1,
          monto: montoPago,
          metodo_pago: metodoPagoSeleccionado,
        });
      }

      alert('Pago registrado exitosamente');
      setProcesarPagoOpen(false);
      setOrdenSeleccionada(null);
      loadOrdenes();
      loadPagos();
      loadEstadisticas();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const getEstadoBadge = (estado: EstadoOrdenCobro) => {
    switch (estado) {
      case EstadoOrdenCobro.PAGADA:
        return <Badge className="bg-green-600">Pagada</Badge>;
      case EstadoOrdenCobro.PARCIALMENTE_PAGADA:
        return <Badge variant="default">Parcial</Badge>;
      case EstadoOrdenCobro.CANCELADA:
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  const totales = calcularTotales();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Facturación y Cobros CFDI 4.0</h1>
        <p className="text-gray-600 mt-1">
          Punto de venta, órdenes de cobro, pagos y facturación electrónica
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pos">POS</TabsTrigger>
          <TabsTrigger value="ordenes">Órdenes</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* POS TAB */}
        {/* ============================================ */}
        <TabsContent value="pos">
          {estadisticas && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${estadisticas.total_facturado.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${estadisticas.total_cobrado.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
                  <Receipt className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    ${estadisticas.total_pendiente.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Facturas</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estadisticas.num_facturas}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Carrito */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito de Venta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Paciente</Label>
                    <Input
                      type="number"
                      placeholder="ID del paciente"
                      value={pacienteId || ''}
                      onChange={(e) => setPacienteId(parseInt(e.target.value))}
                    />
                  </div>

                  <Button onClick={agregarAlCarrito} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto/Servicio
                  </Button>

                  {carrito.length > 0 && (
                    <div className="border rounded-lg p-4 space-y-2">
                      {carrito.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.descripcion}</p>
                            <p className="text-sm text-gray-500">
                              {item.cantidad} x ${item.precio_unitario}
                            </p>
                          </div>
                          <p className="font-bold">
                            ${(item.cantidad * item.precio_unitario).toFixed(2)}
                          </p>
                        </div>
                      ))}

                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${totales.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>IVA (16%):</span>
                          <span>${totales.iva.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>${totales.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <Button onClick={crearOrden} className="w-full" size="lg">
                        Crear Orden de Cobro
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Servicios disponibles */}
            <Card>
              <CardHeader>
                <CardTitle>Servicios Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <p className="font-medium">Consulta Médica</p>
                    <p className="text-sm text-gray-500">$500.00</p>
                  </div>
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <p className="font-medium">Examen Médico Ocupacional</p>
                    <p className="text-sm text-gray-500">$800.00</p>
                  </div>
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <p className="font-medium">Audiometría</p>
                    <p className="text-sm text-gray-500">$300.00</p>
                  </div>
                  <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <p className="font-medium">Espirometría</p>
                    <p className="text-sm text-gray-500">$350.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* ÓRDENES TAB */}
        {/* ============================================ */}
        <TabsContent value="ordenes">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes de Cobro</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8">Cargando órdenes...</p>
              ) : ordenes.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No hay órdenes registradas</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pagado</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordenes.map((orden) => (
                      <TableRow key={orden.id}>
                        <TableCell>
                          <Badge variant="outline">{orden.folio}</Badge>
                        </TableCell>
                        <TableCell>Paciente #{orden.paciente_id}</TableCell>
                        <TableCell>${orden.total.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600">
                          ${orden.pagado.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-orange-600 font-bold">
                          ${orden.saldo.toFixed(2)}
                        </TableCell>
                        <TableCell>{getEstadoBadge(orden.estado)}</TableCell>
                        <TableCell>
                          {orden.saldo > 0 && (
                            <Button
                              size="sm"
                              onClick={() => abrirDialogoPago(orden)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Cobrar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* PAGOS TAB */}
        {/* ============================================ */}
        <TabsContent value="pagos">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8">Cargando pagos...</p>
              ) : pagos.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No hay pagos registrados</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagos.map((pago) => (
                      <TableRow key={pago.id}>
                        <TableCell>
                          <Badge variant="outline">{pago.folio}</Badge>
                        </TableCell>
                        <TableCell>Orden #{pago.orden_cobro_id}</TableCell>
                        <TableCell className="font-bold">
                          ${pago.monto.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pago.metodo_pago}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(pago.fecha_pago).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {pago.cancelado ? (
                            <Badge variant="destructive">Cancelado</Badge>
                          ) : (
                            <Badge className="bg-green-600">Confirmado</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* FACTURAS TAB */}
        {/* ============================================ */}
        <TabsContent value="facturas">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">
                Tab de Facturas CFDI 4.0 - Implementación completa disponible
              </p>
              <p className="text-center text-sm text-gray-400 mt-2">
                Timbrado, cancelación, descarga XML/PDF
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Procesar Pago */}
      <Dialog open={procesarPagoOpen} onOpenChange={setProcesarPagoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>
              Registra el pago de la orden {ordenSeleccionada?.folio}
            </DialogDescription>
          </DialogHeader>

          {ordenSeleccionada && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between mb-2">
                  <span>Total:</span>
                  <span className="font-bold">${ordenSeleccionada.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Pagado:</span>
                  <span className="text-green-600">${ordenSeleccionada.pagado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Saldo:</span>
                  <span className="font-bold text-orange-600">
                    ${ordenSeleccionada.saldo.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select
                  value={metodoPagoSeleccionado}
                  onValueChange={(value: MetodoPago) => setMetodoPagoSeleccionado(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MetodoPago.EFECTIVO}>Efectivo</SelectItem>
                    <SelectItem value={MetodoPago.TARJETA}>Tarjeta (Stripe)</SelectItem>
                    <SelectItem value={MetodoPago.TRANSFERENCIA}>Transferencia</SelectItem>
                    <SelectItem value={MetodoPago.CHEQUE}>Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Monto a Pagar</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={montoPago}
                  onChange={(e) => setMontoPago(parseFloat(e.target.value))}
                />
              </div>

              {metodoPagoSeleccionado === MetodoPago.TARJETA && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <p className="text-sm text-blue-800">
                    🔐 Pago seguro con Stripe
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    En producción, aquí se integraría Stripe Elements para procesar tarjetas
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setProcesarPagoOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={procesarPago}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Procesar Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
