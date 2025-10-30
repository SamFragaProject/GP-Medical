'use client';

/**
 * Página de CRM
 * Gestión de campañas, mensajes y tareas de seguimiento
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  crmService,
  Campana,
  Mensaje,
  TareaCRM,
  CampanaEstadisticas,
  TipoCampana,
  EstadoCampana,
  CanalMensaje,
  EstadoMensaje,
  EstadoTarea,
  PrioridadTarea,
} from '@/services/crm';
import {
  Mail,
  MessageSquare,
  CheckSquare,
  Play,
  Pause,
  Send,
  Trash2,
  Plus,
  BarChart3,
  Calendar,
  AlertCircle,
} from 'lucide-react';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CRMPage() {
  // Estados
  const [tabActiva, setTabActiva] = useState('campanas');
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [tareas, setTareas] = useState<TareaCRM[]>([]);
  const [estadisticas, setEstadisticas] = useState<CampanaEstadisticas | null>(null);

  // Estados de carga
  const [cargandoCampanas, setCargandoCampanas] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [cargandoTareas, setCargandoTareas] = useState(false);

  // ========== EFECTOS ==========

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    if (tabActiva === 'campanas' && campanas.length === 0) {
      cargarCampanas();
    } else if (tabActiva === 'mensajes' && mensajes.length === 0) {
      cargarMensajes();
    } else if (tabActiva === 'tareas' && tareas.length === 0) {
      cargarTareas();
    }
  }, [tabActiva]);

  // ========== FUNCIONES DE CARGA ==========

  const cargarEstadisticas = async () => {
    try {
      const data = await crmService.getEstadisticasCampanas();
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarCampanas = async () => {
    setCargandoCampanas(true);
    try {
      const data = await crmService.listCampanas({ limit: 100 });
      setCampanas(data);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
      alert('Error al cargar campañas');
    } finally {
      setCargandoCampanas(false);
    }
  };

  const cargarMensajes = async () => {
    setCargandoMensajes(true);
    try {
      const data = await crmService.listMensajes({ limit: 100 });
      setMensajes(data);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      alert('Error al cargar mensajes');
    } finally {
      setCargandoMensajes(false);
    }
  };

  const cargarTareas = async () => {
    setCargandoTareas(true);
    try {
      const data = await crmService.listTareas({ limit: 100 });
      setTareas(data);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      alert('Error al cargar tareas');
    } finally {
      setCargandoTareas(false);
    }
  };

  // ========== ACCIONES - CAMPAÑAS ==========

  const activarCampana = async (campanaId: number) => {
    try {
      await crmService.activarCampana(campanaId);
      alert('Campaña activada exitosamente');
      cargarCampanas();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error al activar campaña:', error);
      alert('Error al activar campaña');
    }
  };

  const pausarCampana = async (campanaId: number) => {
    try {
      await crmService.pausarCampana(campanaId);
      alert('Campaña pausada exitosamente');
      cargarCampanas();
    } catch (error) {
      console.error('Error al pausar campaña:', error);
      alert('Error al pausar campaña');
    }
  };

  const eliminarCampana = async (campanaId: number) => {
    if (!confirm('¿Está seguro de eliminar esta campaña?')) return;

    try {
      await crmService.deleteCampana(campanaId);
      alert('Campaña eliminada exitosamente');
      cargarCampanas();
    } catch (error) {
      console.error('Error al eliminar campaña:', error);
      alert('Error al eliminar campaña. Solo se pueden eliminar borradores.');
    }
  };

  // ========== ACCIONES - MENSAJES ==========

  const enviarMensaje = async (mensajeId: number) => {
    try {
      await crmService.enviarMensaje(mensajeId);
      alert('Mensaje enviado exitosamente');
      cargarMensajes();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar mensaje');
    }
  };

  const eliminarMensaje = async (mensajeId: number) => {
    if (!confirm('¿Está seguro de eliminar este mensaje?')) return;

    try {
      await crmService.deleteMensaje(mensajeId);
      alert('Mensaje eliminado exitosamente');
      cargarMensajes();
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      alert('Error al eliminar mensaje. Solo se pueden eliminar mensajes pendientes o fallidos.');
    }
  };

  // ========== ACCIONES - TAREAS ==========

  const completarTarea = async (tareaId: number) => {
    const resultado = prompt('Resultado de la tarea (opcional):');

    try {
      await crmService.completarTarea(tareaId, {
        resultado: resultado || undefined,
      });
      alert('Tarea completada exitosamente');
      cargarTareas();
    } catch (error) {
      console.error('Error al completar tarea:', error);
      alert('Error al completar tarea');
    }
  };

  const eliminarTarea = async (tareaId: number) => {
    if (!confirm('¿Está seguro de eliminar esta tarea?')) return;

    try {
      await crmService.deleteTarea(tareaId);
      alert('Tarea eliminada exitosamente');
      cargarTareas();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar tarea');
    }
  };

  // ========== HELPERS ==========

  const getEstadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      borrador: 'bg-gray-500',
      activa: 'bg-green-500',
      pausada: 'bg-yellow-500',
      completada: 'bg-blue-500',
      cancelada: 'bg-red-500',
      pendiente: 'bg-yellow-500',
      enviando: 'bg-blue-500',
      enviado: 'bg-green-500',
      entregado: 'bg-green-600',
      leido: 'bg-green-700',
      fallido: 'bg-red-500',
      en_progreso: 'bg-blue-500',
    };

    return (
      <Badge className={`${colors[estado] || 'bg-gray-500'} text-white capitalize`}>
        {estado.replace('_', ' ')}
      </Badge>
    );
  };

  const getPrioridadBadge = (prioridad: string) => {
    const colors: Record<string, string> = {
      baja: 'bg-green-500',
      media: 'bg-yellow-500',
      alta: 'bg-orange-500',
      urgente: 'bg-red-500',
    };

    return (
      <Badge className={`${colors[prioridad] || 'bg-gray-500'} text-white capitalize`}>
        {prioridad}
      </Badge>
    );
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ========== RENDER ==========

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CRM y Campañas</h1>
        <p className="text-muted-foreground">
          Gestión de campañas de marketing, mensajes y tareas de seguimiento
        </p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total_campanas}</div>
              <p className="text-xs text-muted-foreground">
                {estadisticas.campanas_activas} activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total_mensajes_enviados}</div>
              <p className="text-xs text-muted-foreground">Total histórico</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Entrega</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(estadisticas.tasa_entrega_promedio * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Promedio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Apertura</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(estadisticas.tasa_apertura_promedio * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Promedio</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="mb-6">
          <TabsTrigger value="campanas" className="gap-2">
            <Mail className="h-4 w-4" />
            Campañas
          </TabsTrigger>
          <TabsTrigger value="mensajes" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensajes
          </TabsTrigger>
          <TabsTrigger value="tareas" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Tareas
          </TabsTrigger>
        </TabsList>

        {/* ========== TAB: CAMPAÑAS ========== */}
        <TabsContent value="campanas">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Campañas de Marketing</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Campaña
              </Button>
            </div>

            {cargandoCampanas ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Cargando campañas...</p>
              </div>
            ) : campanas.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No hay campañas creadas. Crea tu primera campaña para comenzar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {campanas.map((campana) => (
                  <Card key={campana.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle>{campana.nombre}</CardTitle>
                            {getEstadoBadge(campana.estado)}
                            <Badge variant="outline" className="capitalize">
                              {campana.canal}
                            </Badge>
                          </div>
                          <CardDescription>{campana.descripcion}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {campana.estado === EstadoCampana.BORRADOR && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => activarCampana(campana.id)}
                              className="gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Activar
                            </Button>
                          )}
                          {campana.estado === EstadoCampana.ACTIVA && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pausarCampana(campana.id)}
                              className="gap-2"
                            >
                              <Pause className="h-4 w-4" />
                              Pausar
                            </Button>
                          )}
                          {campana.estado === EstadoCampana.BORRADOR && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => eliminarCampana(campana.id)}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tipo</p>
                          <p className="font-medium capitalize">{campana.tipo.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Destinatarios</p>
                          <p className="font-medium">{campana.total_destinatarios}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Enviados</p>
                          <p className="font-medium">{campana.total_enviados}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Entregados</p>
                          <p className="font-medium">{campana.total_entregados}</p>
                        </div>
                      </div>
                      {campana.fecha_inicio && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          {formatearFecha(campana.fecha_inicio)}
                          {campana.fecha_fin && ` - ${formatearFecha(campana.fecha_fin)}`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========== TAB: MENSAJES ========== */}
        <TabsContent value="mensajes">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mensajes</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Mensaje
              </Button>
            </div>

            {cargandoMensajes ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Cargando mensajes...</p>
              </div>
            ) : mensajes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No hay mensajes. Los mensajes se crean automáticamente desde las campañas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {mensajes.map((mensaje) => (
                  <Card key={mensaje.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-base">{mensaje.destinatario}</CardTitle>
                            {getEstadoBadge(mensaje.estado)}
                            <Badge variant="outline" className="capitalize">
                              {mensaje.canal}
                            </Badge>
                          </div>
                          {mensaje.asunto && (
                            <CardDescription className="font-medium">{mensaje.asunto}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {mensaje.estado === EstadoMensaje.PENDIENTE && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => enviarMensaje(mensaje.id)}
                                className="gap-2"
                              >
                                <Send className="h-4 w-4" />
                                Enviar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => eliminarMensaje(mensaje.id)}
                                className="gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {mensaje.contenido}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Creado</p>
                          <p className="font-medium">{formatearFecha(mensaje.fecha_creacion)}</p>
                        </div>
                        {mensaje.fecha_envio && (
                          <div>
                            <p className="text-muted-foreground">Enviado</p>
                            <p className="font-medium">{formatearFecha(mensaje.fecha_envio)}</p>
                          </div>
                        )}
                        {mensaje.intentos > 0 && (
                          <div>
                            <p className="text-muted-foreground">Intentos</p>
                            <p className="font-medium">{mensaje.intentos}</p>
                          </div>
                        )}
                        {mensaje.error && (
                          <div className="col-span-2 md:col-span-4">
                            <p className="text-red-500 text-sm flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              {mensaje.error}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========== TAB: TAREAS ========== */}
        <TabsContent value="tareas">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tareas de Seguimiento</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Tarea
              </Button>
            </div>

            {cargandoTareas ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Cargando tareas...</p>
              </div>
            ) : tareas.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No hay tareas creadas. Crea tu primera tarea para comenzar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tareas.map((tarea) => (
                  <Card key={tarea.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-base">{tarea.titulo}</CardTitle>
                            {getEstadoBadge(tarea.estado)}
                            {getPrioridadBadge(tarea.prioridad)}
                          </div>
                          {tarea.descripcion && (
                            <CardDescription>{tarea.descripcion}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {tarea.estado !== EstadoTarea.COMPLETADA && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completarTarea(tarea.id)}
                              className="gap-2"
                            >
                              <CheckSquare className="h-4 w-4" />
                              Completar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => eliminarTarea(tarea.id)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tipo</p>
                          <p className="font-medium capitalize">{tarea.tipo}</p>
                        </div>
                        {tarea.fecha_vencimiento && (
                          <div>
                            <p className="text-muted-foreground">Vencimiento</p>
                            <p className="font-medium">
                              {formatearFecha(tarea.fecha_vencimiento)}
                            </p>
                          </div>
                        )}
                        {tarea.fecha_completada && (
                          <div>
                            <p className="text-muted-foreground">Completada</p>
                            <p className="font-medium">
                              {formatearFecha(tarea.fecha_completada)}
                            </p>
                          </div>
                        )}
                        {tarea.resultado && (
                          <div className="col-span-2 md:col-span-4">
                            <p className="text-muted-foreground">Resultado</p>
                            <p className="font-medium">{tarea.resultado}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
