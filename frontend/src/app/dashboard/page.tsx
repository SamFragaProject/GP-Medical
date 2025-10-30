"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Activity, Clock } from "lucide-react";
import { pacientesService } from "@/services/pacientes";
import { citasService } from "@/services/citas";

const stats = [
  {
    name: "Pacientes Totales",
    value: "0",
    change: "+12.5%",
    changeType: "increase",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    name: "Citas Hoy",
    value: "0",
    change: "+8 vs ayer",
    changeType: "increase",
    icon: Calendar,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
  },
  {
    name: "Ingresos del Mes",
    value: "$125,400",
    change: "+18.2%",
    changeType: "increase",
    icon: DollarSign,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    name: "Tasa de Ocupación",
    value: "87%",
    change: "+5.1%",
    changeType: "increase",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [statsData, setStatsData] = useState(stats);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load patients
      const pacientesData = await pacientesService.getAll({ limit: 5 });
      setPacientes(pacientesData);

      // Load today's appointments
      const citasData = await citasService.getToday();
      setCitasHoy(citasData);

      // Update stats
      const updatedStats = [...stats];
      updatedStats[0].value = pacientesData.length.toString();
      updatedStats[1].value = citasData.length.toString();
      setStatsData(updatedStats);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: any = {
      COMPLETADA: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      EN_ESPERA: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      CONFIRMADA: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
      NUEVA: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return badges[estado] || badges.NUEVA;
  };

  const getEstadoLabel = (estado: string) => {
    const labels: any = {
      COMPLETADA: "Completada",
      EN_ESPERA: "En consulta",
      CONFIRMADA: "Confirmada",
      NUEVA: "Nueva",
    };
    return labels[estado] || estado;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy ${formatTime(dateString)}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer ${formatTime(dateString)}`;
    } else {
      return date.toLocaleDateString('es-MX', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">¡Bienvenido de nuevo!</h2>
        <p className="text-muted-foreground mt-2">
          Aquí está un resumen de tu actividad clínica de hoy
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-600">{stat.change}</span> vs mes anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pacientes Recientes
            </CardTitle>
            <CardDescription>Últimos pacientes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {pacientes.length > 0 ? (
              <div className="space-y-4">
                {pacientes.slice(0, 4).map((paciente) => (
                  <div
                    key={paciente.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                        {paciente.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {paciente.nombre} {paciente.apellido_paterno}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {calcularEdad(paciente.fecha_nacimiento)} años • {paciente.numero_expediente}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        Activo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay pacientes registrados
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Citas de Hoy
            </CardTitle>
            <CardDescription>Agenda de hoy</CardDescription>
          </CardHeader>
          <CardContent>
            {citasHoy.length > 0 ? (
              <div className="space-y-4">
                {citasHoy.slice(0, 4).map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-center justify-between p-3 rounded-lg border-l-4 border-primary hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-medium">Paciente ID: {cita.paciente_id}</p>
                      <p className="text-sm text-muted-foreground">{cita.tipo_cita || cita.motivo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatTime(cita.fecha_hora_inicio)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEstadoBadge(cita.estado)}`}>
                        {getEstadoLabel(cita.estado)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay citas programadas para hoy
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/10 dark:to-emerald-900/10">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Tareas comunes para comenzar</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => window.location.href = '/dashboard/pacientes'}
            className="p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-white dark:hover:bg-gray-800 transition-all"
          >
            <Users className="h-6 w-6 mb-2 text-primary" />
            <p className="font-medium">Nuevo Paciente</p>
            <p className="text-xs text-muted-foreground mt-1">Registrar paciente nuevo</p>
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/agenda'}
            className="p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-white dark:hover:bg-gray-800 transition-all"
          >
            <Calendar className="h-6 w-6 mb-2 text-primary" />
            <p className="font-medium">Agendar Cita</p>
            <p className="text-xs text-muted-foreground mt-1">Nueva cita médica</p>
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/reportes'}
            className="p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-white dark:hover:bg-gray-800 transition-all"
          >
            <Activity className="h-6 w-6 mb-2 text-primary" />
            <p className="font-medium">Ver Reportes</p>
            <p className="text-xs text-muted-foreground mt-1">Análisis y estadísticas</p>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
