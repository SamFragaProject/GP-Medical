'use client';

/**
 * Página de Reportes y Estadísticas
 * Reportes operativos, financieros y médicos con gráficas y exportación
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  reportesService,
  ReporteCitas,
  ReporteIngresos,
  ReporteOperativo,
  ReporteMedico,
  DashboardEjecutivo
} from '@/services/reportes';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  DollarSign,
  Users,
  Activity,
  FileBarChart,
  Pill,
  ClipboardList
} from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

type TipoReporte = 'citas' | 'ingresos' | 'operativo' | 'medico';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ReportesPage() {
  // Estados para reportes
  const [reporteCitas, setReporteCitas] = useState<ReporteCitas | null>(null);
  const [reporteIngresos, setReporteIngresos] = useState<ReporteIngresos | null>(null);
  const [reporteOperativo, setReporteOperativo] = useState<ReporteOperativo | null>(null);
  const [reporteMedico, setReporteMedico] = useState<ReporteMedico | null>(null);
  const [dashboardEjecutivo, setDashboardEjecutivo] = useState<DashboardEjecutivo | null>(null);

  // Filtros de fecha
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Estados de carga
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [cargandoIngresos, setCargandoIngresos] = useState(false);
  const [cargandoOperativo, setCargandoOperativo] = useState(false);
  const [cargandoMedico, setCargandoMedico] = useState(false);
  const [cargandoDashboard, setCargandoDashboard] = useState(false);

  // Tab activa
  const [tabActiva, setTabActiva] = useState('dashboard');

  // ========== EFECTOS ==========

  useEffect(() => {
    cargarDashboardEjecutivo();
  }, []);

  useEffect(() => {
    if (tabActiva === 'citas' && !reporteCitas) {
      cargarReporteCitas();
    } else if (tabActiva === 'ingresos' && !reporteIngresos) {
      cargarReporteIngresos();
    } else if (tabActiva === 'operativo' && !reporteOperativo) {
      cargarReporteOperativo();
    } else if (tabActiva === 'medico' && !reporteMedico) {
      cargarReporteMedico();
    }
  }, [tabActiva]);

  // ========== FUNCIONES DE CARGA ==========

  const cargarDashboardEjecutivo = async () => {
    setCargandoDashboard(true);
    try {
      const data = await reportesService.getDashboardEjecutivo();
      setDashboardEjecutivo(data);
    } catch (error) {
      console.error('Error al cargar dashboard ejecutivo:', error);
      alert('Error al cargar dashboard ejecutivo');
    } finally {
      setCargandoDashboard(false);
    }
  };

  const cargarReporteCitas = async () => {
    setCargandoCitas(true);
    try {
      const data = await reportesService.getReporteCitas(
        fechaDesde || undefined,
        fechaHasta || undefined
      );
      setReporteCitas(data);
    } catch (error) {
      console.error('Error al cargar reporte de citas:', error);
      alert('Error al cargar reporte de citas');
    } finally {
      setCargandoCitas(false);
    }
  };

  const cargarReporteIngresos = async () => {
    setCargandoIngresos(true);
    try {
      const data = await reportesService.getReporteIngresos(
        fechaDesde || undefined,
        fechaHasta || undefined
      );
      setReporteIngresos(data);
    } catch (error) {
      console.error('Error al cargar reporte de ingresos:', error);
      alert('Error al cargar reporte de ingresos');
    } finally {
      setCargandoIngresos(false);
    }
  };

  const cargarReporteOperativo = async () => {
    setCargandoOperativo(true);
    try {
      const data = await reportesService.getReporteOperativo(
        fechaDesde || undefined,
        fechaHasta || undefined
      );
      setReporteOperativo(data);
    } catch (error) {
      console.error('Error al cargar reporte operativo:', error);
      alert('Error al cargar reporte operativo');
    } finally {
      setCargandoOperativo(false);
    }
  };

  const cargarReporteMedico = async () => {
    setCargandoMedico(true);
    try {
      const data = await reportesService.getReporteMedico(
        fechaDesde || undefined,
        fechaHasta || undefined
      );
      setReporteMedico(data);
    } catch (error) {
      console.error('Error al cargar reporte médico:', error);
      alert('Error al cargar reporte médico');
    } finally {
      setCargandoMedico(false);
    }
  };

  // ========== FUNCIONES DE EXPORTACIÓN ==========

  const exportarExcel = async (tipo: TipoReporte) => {
    try {
      const blob = await reportesService.exportarExcel(
        tipo,
        fechaDesde || undefined,
        fechaHasta || undefined
      );

      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al exportar a Excel');
    }
  };

  const exportarPDF = async (tipo: TipoReporte) => {
    try {
      const blob = await reportesService.exportarPDF(
        tipo,
        fechaDesde || undefined,
        fechaHasta || undefined
      );

      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      alert('Error al exportar a PDF');
    }
  };

  const aplicarFiltros = () => {
    if (tabActiva === 'citas') {
      cargarReporteCitas();
    } else if (tabActiva === 'ingresos') {
      cargarReporteIngresos();
    } else if (tabActiva === 'operativo') {
      cargarReporteOperativo();
    } else if (tabActiva === 'medico') {
      cargarReporteMedico();
    }
  };

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    if (tabActiva === 'citas') {
      cargarReporteCitas();
    } else if (tabActiva === 'ingresos') {
      cargarReporteIngresos();
    } else if (tabActiva === 'operativo') {
      cargarReporteOperativo();
    } else if (tabActiva === 'medico') {
      cargarReporteMedico();
    }
  };

  // ========== HELPERS ==========

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(valor);
  };

  const formatearPorcentaje = (valor: number) => {
    return `${(valor * 100).toFixed(1)}%`;
  };

  const formatearMes = (año: number, mes: number) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[mes - 1]} ${año}`;
  };

  // ========== RENDER ==========

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reportes y Estadísticas</h1>
        <p className="text-muted-foreground">
          Análisis operativo, financiero y médico del sistema
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="citas" className="gap-2">
            <Calendar className="h-4 w-4" />
            Citas
          </TabsTrigger>
          <TabsTrigger value="ingresos" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="operativo" className="gap-2">
            <Activity className="h-4 w-4" />
            Operativo
          </TabsTrigger>
          <TabsTrigger value="medico" className="gap-2">
            <FileBarChart className="h-4 w-4" />
            Médico
          </TabsTrigger>
        </TabsList>

        {/* ========== TAB: DASHBOARD EJECUTIVO ========== */}
        <TabsContent value="dashboard">
          {cargandoDashboard ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Cargando dashboard...</p>
            </div>
          ) : dashboardEjecutivo ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Citas Hoy */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardEjecutivo.citas_hoy}</div>
                    <p className="text-xs text-muted-foreground">Citas programadas para hoy</p>
                  </CardContent>
                </Card>

                {/* Ingresos Última Semana */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos (7 días)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatearMoneda(dashboardEjecutivo.ingresos_ultima_semana)}
                    </div>
                    <p className="text-xs text-muted-foreground">Última semana</p>
                  </CardContent>
                </Card>

                {/* Pendiente de Cobro */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendiente Cobro</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatearMoneda(dashboardEjecutivo.pendiente_cobro)}
                    </div>
                    <p className="text-xs text-muted-foreground">Por cobrar</p>
                  </CardContent>
                </Card>

                {/* Pacientes Atendidos */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pacientes (7 días)</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardEjecutivo.pacientes_atendidos_semana}
                    </div>
                    <p className="text-xs text-muted-foreground">Última semana</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen Ejecutivo</CardTitle>
                  <CardDescription>
                    Última actualización: {new Date(dashboardEjecutivo.fecha_actualizacion).toLocaleString('es-MX')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Vista general del rendimiento del sistema en los últimos días.
                    Selecciona una de las pestañas superiores para ver reportes detallados.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No hay datos disponibles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ========== TAB: REPORTE DE CITAS ========== */}
        <TabsContent value="citas">
          <div className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fecha_desde">Fecha Desde</Label>
                    <Input
                      id="fecha_desde"
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
                    <Input
                      id="fecha_hasta"
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={aplicarFiltros} className="flex-1">
                      Aplicar
                    </Button>
                    <Button onClick={limpiarFiltros} variant="outline">
                      Limpiar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Exportación */}
            <div className="flex gap-2">
              <Button onClick={() => exportarExcel('citas')} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
              <Button onClick={() => exportarPDF('citas')} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>

            {cargandoCitas ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Cargando reporte...</p>
              </div>
            ) : reporteCitas ? (
              <div className="space-y-6">
                {/* Cards de Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total de Citas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{reporteCitas.total_citas}</div>
                      <p className="text-sm text-muted-foreground">
                        {reporteCitas.periodo.desde} - {reporteCitas.periodo.hasta}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tasa de Asistencia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        {formatearPorcentaje(reporteCitas.tasa_asistencia)}
                      </div>
                      <p className="text-sm text-muted-foreground">Asistencias confirmadas</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tasa de Cancelación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">
                        {formatearPorcentaje(reporteCitas.tasa_cancelacion)}
                      </div>
                      <p className="text-sm text-muted-foreground">Citas canceladas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Citas por Estado */}
                <Card>
                  <CardHeader>
                    <CardTitle>Citas por Estado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(reporteCitas.citas_por_estado).map(([estado, cantidad]) => (
                        <div key={estado} className="flex justify-between items-center">
                          <span className="capitalize">{estado.replace('_', ' ')}</span>
                          <span className="font-semibold">{cantidad}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Citas por Mes */}
                {reporteCitas.citas_por_mes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Citas por Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteCitas.citas_por_mes.map((mes) => (
                          <div key={`${mes.año}-${mes.mes}`} className="flex justify-between items-center">
                            <span>{formatearMes(mes.año, mes.mes)}</span>
                            <span className="font-semibold">{mes.total}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Citas por Médico */}
                {reporteCitas.citas_por_medico.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Citas por Médico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteCitas.citas_por_medico.map((medico, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{medico.medico}</span>
                            <span className="font-semibold">{medico.total_citas}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Haz clic en &quot;Aplicar&quot; para generar el reporte
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ========== TAB: REPORTE DE INGRESOS ========== */}
        <TabsContent value="ingresos">
          <div className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fecha_desde_ingresos">Fecha Desde</Label>
                    <Input
                      id="fecha_desde_ingresos"
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_hasta_ingresos">Fecha Hasta</Label>
                    <Input
                      id="fecha_hasta_ingresos"
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={aplicarFiltros} className="flex-1">
                      Aplicar
                    </Button>
                    <Button onClick={limpiarFiltros} variant="outline">
                      Limpiar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Exportación */}
            <div className="flex gap-2">
              <Button onClick={() => exportarExcel('ingresos')} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
              <Button onClick={() => exportarPDF('ingresos')} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>

            {cargandoIngresos ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Cargando reporte...</p>
              </div>
            ) : reporteIngresos ? (
              <div className="space-y-6">
                {/* Cards de Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Facturado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {formatearMoneda(reporteIngresos.total_facturado)}
                      </div>
                      <p className="text-sm text-muted-foreground">Monto total facturado</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Total Cobrado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        {formatearMoneda(reporteIngresos.total_cobrado)}
                      </div>
                      <p className="text-sm text-muted-foreground">Pagos recibidos</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Total Pendiente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600">
                        {formatearMoneda(reporteIngresos.total_pendiente)}
                      </div>
                      <p className="text-sm text-muted-foreground">Por cobrar</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Ingresos por Mes */}
                {reporteIngresos.ingresos_por_mes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ingresos por Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteIngresos.ingresos_por_mes.map((mes) => (
                          <div key={`${mes.año}-${mes.mes}`} className="flex justify-between items-center">
                            <span>{formatearMes(mes.año, mes.mes)}</span>
                            <span className="font-semibold">{formatearMoneda(mes.total)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ingresos por Servicio */}
                {reporteIngresos.ingresos_por_servicio.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ingresos por Servicio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteIngresos.ingresos_por_servicio.map((servicio, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{servicio.servicio}</span>
                            <span className="font-semibold">{formatearMoneda(servicio.total)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Métodos de Pago */}
                {reporteIngresos.metodos_pago.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Métodos de Pago</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteIngresos.metodos_pago.map((metodo, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{metodo.metodo}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({metodo.cantidad} transacciones)
                              </span>
                            </div>
                            <span className="font-semibold">{formatearMoneda(metodo.total)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Haz clic en &quot;Aplicar&quot; para generar el reporte
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ========== TAB: REPORTE OPERATIVO ========== */}
        <TabsContent value="operativo">
          <div className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fecha_desde_operativo">Fecha Desde</Label>
                    <Input
                      id="fecha_desde_operativo"
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_hasta_operativo">Fecha Hasta</Label>
                    <Input
                      id="fecha_hasta_operativo"
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={aplicarFiltros} className="flex-1">
                      Aplicar
                    </Button>
                    <Button onClick={limpiarFiltros} variant="outline">
                      Limpiar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Exportación */}
            <div className="flex gap-2">
              <Button onClick={() => exportarExcel('operativo')} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
              <Button onClick={() => exportarPDF('operativo')} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>

            {cargandoOperativo ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Cargando reporte...</p>
              </div>
            ) : reporteOperativo ? (
              <div className="space-y-6">
                {/* Cards de Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Total Pacientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reporteOperativo.total_pacientes}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Nuevos Pacientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {reporteOperativo.nuevos_pacientes}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Total Consultas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reporteOperativo.total_consultas}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Recetas Emitidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reporteOperativo.total_recetas}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Estudios Solicitados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reporteOperativo.total_estudios}</div>
                    </CardContent>
                  </Card>

                  {reporteOperativo.tiempo_promedio_atencion && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Tiempo Promedio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {reporteOperativo.tiempo_promedio_atencion} min
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Productividad por Médico */}
                {reporteOperativo.productividad_medicos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Productividad por Médico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteOperativo.productividad_medicos.map((medico, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{medico.medico}</span>
                            <span className="font-semibold">{medico.total_consultas} consultas</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Haz clic en &quot;Aplicar&quot; para generar el reporte
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ========== TAB: REPORTE MÉDICO ========== */}
        <TabsContent value="medico">
          <div className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fecha_desde_medico">Fecha Desde</Label>
                    <Input
                      id="fecha_desde_medico"
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_hasta_medico">Fecha Hasta</Label>
                    <Input
                      id="fecha_hasta_medico"
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={aplicarFiltros} className="flex-1">
                      Aplicar
                    </Button>
                    <Button onClick={limpiarFiltros} variant="outline">
                      Limpiar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Exportación */}
            <div className="flex gap-2">
              <Button onClick={() => exportarExcel('medico')} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
              <Button onClick={() => exportarPDF('medico')} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>

            {cargandoMedico ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Cargando reporte...</p>
              </div>
            ) : reporteMedico ? (
              <div className="space-y-6">
                {/* Diagnósticos Frecuentes */}
                {reporteMedico.diagnosticos_frecuentes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Diagnósticos Más Frecuentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteMedico.diagnosticos_frecuentes.map((diagnostico, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{diagnostico.diagnostico}</span>
                            <span className="font-semibold">{diagnostico.frecuencia}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CIE-10 Frecuentes */}
                {reporteMedico.cie10_frecuentes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileBarChart className="h-5 w-5" />
                        Códigos CIE-10 Más Usados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteMedico.cie10_frecuentes.map((codigo, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="font-medium">{codigo.codigo}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {codigo.nombre}
                              </span>
                            </div>
                            <span className="font-semibold">{codigo.frecuencia}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Medicamentos Recetados */}
                {reporteMedico.medicamentos_recetados.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Medicamentos Más Recetados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteMedico.medicamentos_recetados.map((medicamento, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{medicamento.medicamento}</span>
                            <span className="font-semibold">{medicamento.cantidad}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Estudios Solicitados */}
                {reporteMedico.estudios_solicitados.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Estudios Más Solicitados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reporteMedico.estudios_solicitados.map((estudio, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{estudio.tipo}</span>
                            <span className="font-semibold">{estudio.total}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Haz clic en &quot;Aplicar&quot; para generar el reporte
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
