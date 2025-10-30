"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";

const mockAppointments = [
  { id: 1, time: "09:00", patient: "María García", type: "Consulta General", duration: 30, status: "completed" },
  { id: 2, time: "09:30", patient: "Juan Martínez", type: "Seguimiento", duration: 30, status: "completed" },
  { id: 3, time: "10:00", patient: "Ana Sánchez", type: "Primera Vez", duration: 45, status: "in-progress" },
  { id: 4, time: "11:00", patient: "Carlos Hernández", type: "Procedimiento", duration: 60, status: "confirmed" },
  { id: 5, time: "12:30", patient: "Laura Ramírez", type: "Consulta General", duration: 30, status: "confirmed" },
  { id: 6, time: "14:00", patient: "Roberto López", type: "Seguimiento", duration: 30, status: "new" },
  { id: 7, time: "14:30", patient: "Carmen Díaz", type: "Primera Vez", duration: 45, status: "new" },
  { id: 8, time: "15:30", patient: "Pedro González", type: "Consulta General", duration: 30, status: "new" },
];

const statusColors = {
  completed: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
  "in-progress": "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-2 border-blue-500",
  confirmed: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200",
  new: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200",
};

const statusLabels = {
  completed: "Completada",
  "in-progress": "En Consulta",
  confirmed: "Confirmada",
  new: "Nueva",
};

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Start at 8:00
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda de Citas</h2>
          <p className="text-muted-foreground mt-2">
            Gestiona las citas y consultas del día
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  {currentDate.toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Día</Button>
              <Button variant="outline" size="sm">Semana</Button>
              <Button variant="outline" size="sm">Mes</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">32</div>
            <p className="text-sm text-muted-foreground">Total citas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">24</div>
            <p className="text-sm text-muted-foreground">Confirmadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">6</div>
            <p className="text-sm text-muted-foreground">Nuevas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">2</div>
            <p className="text-sm text-muted-foreground">No asistió</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dr. Juan Pérez - Consultorio 1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeSlots.map((time) => {
                  const appointment = mockAppointments.find(apt => apt.time === time);

                  return (
                    <div key={time} className="flex gap-4 border-b pb-2">
                      <div className="w-16 text-sm font-medium text-muted-foreground pt-2">
                        {time}
                      </div>
                      <div className="flex-1">
                        {appointment ? (
                          <div
                            className={`p-3 rounded-lg ${statusColors[appointment.status as keyof typeof statusColors]} transition-all hover:shadow-md cursor-pointer`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{appointment.patient}</p>
                                <p className="text-sm opacity-90">{appointment.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">
                                  {statusLabels[appointment.status as keyof typeof statusLabels]}
                                </p>
                                <p className="text-xs opacity-75">{appointment.duration} min</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border-2 border-dashed hover:border-primary hover:bg-accent transition-all cursor-pointer">
                            <p className="text-sm text-muted-foreground text-center">
                              Horario disponible
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lista de Espera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20">
                <p className="font-medium text-sm">Ana Sánchez</p>
                <p className="text-xs text-muted-foreground">Llegó a las 9:50 AM</p>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                No hay más pacientes en espera
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notas del Día</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm font-medium">Recordatorio</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Junta de equipo a las 1:00 PM
                </p>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="mr-2 h-3 w-3" />
                Agregar Nota
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
