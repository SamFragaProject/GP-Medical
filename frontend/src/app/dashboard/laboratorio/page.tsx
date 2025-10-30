"use client"

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Flask,
  Scan,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Upload,
  Eye,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { estudiosService, OrdenEstudio, EstudioItem } from '@/services/estudios';
import { pacientesService, Paciente } from '@/services/pacientes';

export default function LaboratorioPage() {
  const [loading, setLoading] = useState(true);
  const [ordenes, setOrdenes] = useState<OrdenEstudio[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [catalogo, setCatalogo] = useState<any>(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenEstudio | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResultadoDialogOpen, setIsResultadoDialogOpen] = useState(false);

  // Form data para nueva orden
  const [formData, setFormData] = useState({
    paciente_id: '',
    tipo: 'laboratorio',
    categoria: '',
    indicaciones_clinicas: '',
    preparacion: '',
    fecha_programada: '',
    urgente: false,
  });

  // Estudios seleccionados
  const [estudiosSeleccionados, setEstudiosSeleccionados] = useState<EstudioItem[]>([]);

  // Form data para resultado
  const [resultadoData, setResultadoData] = useState({
    nombre_estudio: '',
    interpretacion: '',
    observaciones: '',
    fecha_resultado: '',
  });

  // Archivo para resultado
  const [archivoResultado, setArchivoResultado] = useState<File | null>(null);

  useEffect(() => {
    loadData();
    loadCatalogo();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordenesData, pacientesData] = await Promise.all([
        estudiosService.getAll({ limit: 50 }),
        pacientesService.getAll({ limit: 100 }),
      ]);

      setOrdenes(ordenesData);
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogo = async () => {
    try {
      const catalogoData = await estudiosService.getCatalogo();
      setCatalogo(catalogoData);
    } catch (error) {
      console.error('Error loading catalogo:', error);
    }
  };

  const loadOrdenDetalle = async (id: number) => {
    try {
      const orden = await estudiosService.getById(id);
      setOrdenSeleccionada(orden);
      setIsResultadoDialogOpen(true);
    } catch (error) {
      console.error('Error loading orden:', error);
    }
  };

  // ============================================================================
  // MANEJO DE ESTUDIOS SELECCIONADOS
  // ============================================================================

  const handleToggleEstudio = (estudio: EstudioItem) => {
    const existe = estudiosSeleccionados.find((e) => e.id === estudio.id);

    if (existe) {
      setEstudiosSeleccionados(
        estudiosSeleccionados.filter((e) => e.id !== estudio.id)
      );
    } else {
      setEstudiosSeleccionados([...estudiosSeleccionados, estudio]);
    }
  };

  // ============================================================================
  // CREAR ORDEN
  // ============================================================================

  const handleCreateOrden = async () => {
    if (!formData.paciente_id) {
      alert('Por favor selecciona un paciente');
      return;
    }

    if (!formData.categoria) {
      alert('Por favor selecciona una categoría');
      return;
    }

    if (estudiosSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un estudio');
      return;
    }

    try {
      await estudiosService.create({
        paciente_id: parseInt(formData.paciente_id),
        tipo: formData.tipo,
        categoria: formData.categoria,
        estudios: estudiosSeleccionados,
        indicaciones_clinicas: formData.indicaciones_clinicas || undefined,
        preparacion: formData.preparacion || undefined,
        fecha_programada: formData.fecha_programada || undefined,
        urgente: formData.urgente,
      });

      alert('Orden creada exitosamente');
      setIsDialogOpen(false);
      loadData();

      // Limpiar formulario
      setFormData({
        paciente_id: '',
        tipo: 'laboratorio',
        categoria: '',
        indicaciones_clinicas: '',
        preparacion: '',
        fecha_programada: '',
        urgente: false,
      });
      setEstudiosSeleccionados([]);
    } catch (error) {
      console.error('Error creating orden:', error);
      alert('Error al crear orden');
    }
  };

  // ============================================================================
  // CARGAR RESULTADO
  // ============================================================================

  const handleCargarResultado = async () => {
    if (!ordenSeleccionada) return;

    if (!resultadoData.nombre_estudio || !resultadoData.fecha_resultado) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    try {
      const resultado = await estudiosService.createResultado(ordenSeleccionada.id, {
        nombre_estudio: resultadoData.nombre_estudio,
        interpretacion: resultadoData.interpretacion || undefined,
        observaciones: resultadoData.observaciones || undefined,
        fecha_resultado: resultadoData.fecha_resultado,
      });

      // Si hay archivo, subirlo
      if (archivoResultado) {
        await estudiosService.uploadArchivoResultado(
          ordenSeleccionada.id,
          resultado.id,
          archivoResultado
        );
      }

      alert('Resultado cargado exitosamente');
      setResultadoData({
        nombre_estudio: '',
        interpretacion: '',
        observaciones: '',
        fecha_resultado: '',
      });
      setArchivoResultado(null);

      // Recargar orden
      loadOrdenDetalle(ordenSeleccionada.id);
      loadData();
    } catch (error) {
      console.error('Error cargando resultado:', error);
      alert('Error al cargar resultado');
    }
  };

  // ============================================================================
  // UTILS
  // ============================================================================

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'laboratorio':
        return <Flask className="h-5 w-5" />;
      case 'imagen':
        return <Scan className="h-5 w-5" />;
      case 'gabinete':
        return <Activity className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'en_proceso':
        return 'info';
      case 'completada':
        return 'success';
      case 'cancelada':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="h-4 w-4" />;
      case 'en_proceso':
        return <Activity className="h-4 w-4 animate-pulse" />;
      case 'completada':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelada':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes de estudios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Estudios</h1>
          <p className="text-gray-600 mt-1">
            Laboratorio, Imagenología y Gabinete
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Nueva Orden
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nueva Orden de Estudios
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Selección de Paciente */}
              <div className="space-y-2">
                <Label htmlFor="paciente">Paciente *</Label>
                <Select
                  value={formData.paciente_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paciente_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id.toString()}>
                        {paciente.nombre_completo} - {paciente.numero_empleado || paciente.curp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Estudio */}
              <div className="space-y-2">
                <Label>Tipo de Estudio *</Label>
                <Tabs
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo: value, categoria: '' })
                  }
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="laboratorio">
                      <Flask className="h-4 w-4 mr-2" />
                      Laboratorio
                    </TabsTrigger>
                    <TabsTrigger value="imagen">
                      <Scan className="h-4 w-4 mr-2" />
                      Imagen
                    </TabsTrigger>
                    <TabsTrigger value="gabinete">
                      <Activity className="h-4 w-4 mr-2" />
                      Gabinete
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Categoría */}
              {catalogo && formData.tipo && (
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(
                        catalogo[formData.tipo]?.categorias || {}
                      ).map(([key, cat]: [string, any]) => (
                        <SelectItem key={key} value={key}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Estudios Disponibles */}
              {catalogo && formData.tipo && formData.categoria && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">
                    Selecciona los estudios a realizar:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {catalogo[formData.tipo]?.categorias[
                      formData.categoria
                    ]?.estudios.map((estudio: EstudioItem) => {
                      const isSelected = estudiosSeleccionados.some(
                        (e) => e.id === estudio.id
                      );

                      return (
                        <Button
                          key={estudio.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className="justify-start"
                          onClick={() => handleToggleEstudio(estudio)}
                        >
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {estudio.nombre}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Estudios Seleccionados */}
              {estudiosSeleccionados.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Estudios seleccionados ({estudiosSeleccionados.length}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {estudiosSeleccionados.map((estudio) => (
                      <Badge key={estudio.id} variant="default">
                        {estudio.nombre}
                        <button
                          onClick={() => handleToggleEstudio(estudio)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Indicaciones Clínicas */}
              <div className="space-y-2">
                <Label>Indicaciones Clínicas</Label>
                <Textarea
                  value={formData.indicaciones_clinicas}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      indicaciones_clinicas: e.target.value,
                    })
                  }
                  placeholder="Motivo del estudio, sospecha diagnóstica..."
                  rows={3}
                />
              </div>

              {/* Preparación */}
              <div className="space-y-2">
                <Label>Preparación del Paciente</Label>
                <Textarea
                  value={formData.preparacion}
                  onChange={(e) =>
                    setFormData({ ...formData, preparacion: e.target.value })
                  }
                  placeholder="Ej: Ayuno de 8 horas, suspender medicamentos..."
                  rows={2}
                />
              </div>

              {/* Fecha Programada */}
              <div className="space-y-2">
                <Label htmlFor="fecha_programada">Fecha Programada</Label>
                <Input
                  id="fecha_programada"
                  type="datetime-local"
                  value={formData.fecha_programada}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fecha_programada: e.target.value,
                    })
                  }
                />
              </div>

              {/* Urgente */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgente"
                  checked={formData.urgente}
                  onChange={(e) =>
                    setFormData({ ...formData, urgente: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="urgente">Marcar como URGENTE</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateOrden}>Crear Orden</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros rápidos */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">
                  {ordenes.filter((o) => o.estado === 'pendiente').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold">
                  {ordenes.filter((o) => o.estado === 'en_proceso').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold">
                  {ordenes.filter((o) => o.estado === 'completada').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold">
                  {ordenes.filter((o) => o.urgente && o.estado !== 'completada').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Órdenes */}
      <div className="grid gap-4">
        {ordenes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay órdenes de estudios registradas</p>
            </CardContent>
          </Card>
        ) : (
          ordenes.map((orden) => (
            <Card
              key={orden.id}
              className={`hover:shadow-lg transition-shadow ${
                orden.urgente ? 'border-red-500 border-2' : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getTipoIcon(orden.tipo)}
                      {orden.folio}
                      {orden.urgente && (
                        <Badge variant="destructive">URGENTE</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {orden.paciente?.nombre_completo ||
                        `Paciente ID: ${orden.paciente_id}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getEstadoBadgeColor(orden.estado) as any}>
                      {getEstadoIcon(orden.estado)}
                      <span className="ml-1">{orden.estado}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-medium capitalize">{orden.tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha Solicitud</p>
                    <p className="font-medium">
                      {new Date(orden.fecha_solicitud).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Médico</p>
                    <p className="font-medium text-sm">
                      {orden.medico_solicitante?.nombre ||
                        `ID: ${orden.medico_solicitante_id}`}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Estudios solicitados ({orden.estudios.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {orden.estudios.slice(0, 5).map((estudio, idx) => (
                      <Badge key={idx} variant="outline">
                        {estudio.nombre}
                      </Badge>
                    ))}
                    {orden.estudios.length > 5 && (
                      <Badge variant="outline">
                        +{orden.estudios.length - 5} más
                      </Badge>
                    )}
                  </div>
                </div>

                {orden.resultados.length > 0 && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800 font-medium">
                      {orden.resultados.length} resultado(s) cargado(s)
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadOrdenDetalle(orden.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalle
                  </Button>

                  {orden.estado !== 'completada' && orden.estado !== 'cancelada' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (confirm('¿Marcar esta orden como completada?')) {
                            await estudiosService.completar(orden.id);
                            loadData();
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (confirm('¿Cancelar esta orden?')) {
                            await estudiosService.cancel(orden.id);
                            loadData();
                          }
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Resultados */}
      <Dialog open={isResultadoDialogOpen} onOpenChange={setIsResultadoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalle de Orden: {ordenSeleccionada?.folio}
            </DialogTitle>
          </DialogHeader>

          {ordenSeleccionada && (
            <div className="space-y-6">
              {/* Información de la orden */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Paciente</p>
                    <p className="font-medium">
                      {ordenSeleccionada.paciente?.nombre_completo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge variant={getEstadoBadgeColor(ordenSeleccionada.estado) as any}>
                      {ordenSeleccionada.estado}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Estudios solicitados */}
              <div>
                <h3 className="font-medium mb-2">Estudios Solicitados:</h3>
                <div className="space-y-2">
                  {ordenSeleccionada.estudios.map((estudio, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>{estudio.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultados existentes */}
              {ordenSeleccionada.resultados.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Resultados Cargados:</h3>
                  <div className="space-y-3">
                    {ordenSeleccionada.resultados.map((resultado) => (
                      <div
                        key={resultado.id}
                        className="border rounded-lg p-3 bg-green-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{resultado.nombre_estudio}</p>
                          <Badge variant="success">Cargado</Badge>
                        </div>
                        {resultado.interpretacion && (
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Interpretación:</strong> {resultado.interpretacion}
                          </p>
                        )}
                        {resultado.observaciones && (
                          <p className="text-sm text-gray-700">
                            <strong>Observaciones:</strong> {resultado.observaciones}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Fecha resultado: {new Date(resultado.fecha_resultado).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario para cargar nuevo resultado */}
              {ordenSeleccionada.estado !== 'completada' && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Cargar Nuevo Resultado:</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Estudio *</Label>
                      <Select
                        value={resultadoData.nombre_estudio}
                        onValueChange={(value) =>
                          setResultadoData({ ...resultadoData, nombre_estudio: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estudio" />
                        </SelectTrigger>
                        <SelectContent>
                          {ordenSeleccionada.estudios.map((estudio, idx) => (
                            <SelectItem key={idx} value={estudio.nombre}>
                              {estudio.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Interpretación</Label>
                      <Textarea
                        value={resultadoData.interpretacion}
                        onChange={(e) =>
                          setResultadoData({
                            ...resultadoData,
                            interpretacion: e.target.value,
                          })
                        }
                        placeholder="Interpretación de los resultados..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Observaciones</Label>
                      <Textarea
                        value={resultadoData.observaciones}
                        onChange={(e) =>
                          setResultadoData({
                            ...resultadoData,
                            observaciones: e.target.value,
                          })
                        }
                        placeholder="Observaciones adicionales..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fecha del Resultado *</Label>
                      <Input
                        type="date"
                        value={resultadoData.fecha_resultado}
                        onChange={(e) =>
                          setResultadoData({
                            ...resultadoData,
                            fecha_resultado: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Archivo (PDF, Imagen)</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setArchivoResultado(e.target.files[0]);
                          }
                        }}
                      />
                      {archivoResultado && (
                        <p className="text-sm text-gray-600">
                          Archivo seleccionado: {archivoResultado.name}
                        </p>
                      )}
                    </div>

                    <Button onClick={handleCargarResultado} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Cargar Resultado
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResultadoDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
