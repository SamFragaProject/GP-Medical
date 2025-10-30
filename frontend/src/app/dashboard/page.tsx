"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Activity, Clock } from "lucide-react";

const stats = [
  {
    name: "Pacientes Totales",
    value: "1,234",
    change: "+12.5%",
    changeType: "increase",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    name: "Citas Hoy",
    value: "45",
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

const recentPatients = [
  { id: 1, name: "María García López", age: 45, lastVisit: "Hoy 10:30 AM", status: "Completada" },
  { id: 2, name: "Juan Martínez Rodríguez", age: 32, lastVisit: "Hoy 09:00 AM", status: "En consulta" },
  { id: 3, name: "Ana Sánchez Pérez", age: 28, lastVisit: "Ayer 3:00 PM", status: "Completada" },
  { id: 4, name: "Carlos Hernández Torres", age: 55, lastVisit: "Ayer 11:30 AM", status: "Completada" },
];

const upcomingAppointments = [
  { id: 1, patient: "Pedro González", time: "11:00 AM", type: "Consulta General", doctor: "Dr. Pérez" },
  { id: 2, patient: "Laura Ramírez", time: "11:30 AM", type: "Seguimiento", doctor: "Dr. Pérez" },
  { id: 3, patient: "Roberto López", time: "12:00 PM", type: "Primera Vez", doctor: "Dr. Pérez" },
  { id: 4, patient: "Carmen Díaz", time: "2:00 PM", type: "Procedimiento", doctor: "Dr. Pérez" },
];

export default function DashboardPage() {
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
        {stats.map((stat) => {
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
            <CardDescription>Últimas consultas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.age} años • {patient.lastVisit}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      patient.status === "Completada"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Citas
            </CardTitle>
            <CardDescription>Agenda de hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg border-l-4 border-primary hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{appointment.time}</p>
                    <p className="text-xs text-muted-foreground">{appointment.doctor}</p>
                  </div>
                </div>
              ))}
            </div>
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
          <button className="p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-white dark:hover:bg-gray-800 transition-all">
            <Users className="h-6 w-6 mb-2 text-primary" />
            <p className="font-medium">Nuevo Paciente</p>
            <p className="text-xs text-muted-foreground mt-1">Registrar paciente nuevo</p>
          </button>
          <button className="p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-white dark:hover:bg-gray-800 transition-all">
            <Calendar className="h-6 w-6 mb-2 text-primary" />
            <p className="font-medium">Agendar Cita</p>
            <p className="text-xs text-muted-foreground mt-1">Nueva cita médica</p>
          </button>
          <button className="p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-white dark:hover:bg-gray-800 transition-all">
            <Activity className="h-6 w-6 mb-2 text-primary" />
            <p className="font-medium">Ver Reportes</p>
            <p className="text-xs text-muted-foreground mt-1">Análisis y estadísticas</p>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
