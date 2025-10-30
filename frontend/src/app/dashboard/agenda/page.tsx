"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Briefcase, Clock } from "lucide-react";
import { citasService, Cita } from "@/services/citas";
import { pacientesService, Paciente } from "@/services/pacientes";

const statusColors = {
  COMPLETADA: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
  EN_ESPERA: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-2 border-blue-500",
  CONFIRMADA: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200",
  NUEVA: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200",
  CANCELADA: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
  NO_ASISTIO: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200",
};

const statusLabels = {
  COMPLETADA: "Completada",
  EN_ESPERA: "En Consulta",
  CONFIRMADA: "Confirmada",
  NUEVA: "Nueva",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No Asistió",
};

// Occupational Medicine appointment types
const tiposCita = [
  { value: "INGRESO", label: "Examen de Ingreso" },
  { value: "PERIODICO", label: "Examen Periódico" },
  { value: "EGRESO", label: "Examen de Egreso" },
  { value: "REINGRESO", label: "Examen de Reingreso" },
  { value: "CAMBIO_PUESTO", label: "Cambio de Puesto" },
  { value: "ACCIDENTE", label: "Post-Accidente" },
  { value: "INCAPACIDAD", label: "Reintegración Post-Incapacidad" },
  { value: "VIGILANCIA", label: "Vigilancia Especial" },
];

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [searchPaciente, setSearchPaciente] = useState("");
  const [formData, setFormData] = useState({
    paciente_id: 0,
    medico_id: 1, // Default doctor
    fecha_hora_inicio: "",
    duracion_minutos: 45,
    tipo_cita: "INGRESO",
    motivo: "",
    notas: "",
    estado: "NUEVA",
  });

  useEffect(() => {
    loadCitas();
    loadPacientes();
  }, [currentDate]);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const fecha = currentDate.toISOString().split('T')[0];
      const data = await citasService.getAll({ fecha });
      setCitas(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPacientes = async () => {
    try {
      const data = await pacientesService.getAll({ limit: 100 });
      setPacientes(data);
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCita) {
        await citasService.update(editingCita.id, formData);
      } else {
        const fecha_hora_inicio = new Date(formData.fecha_hora_inicio);
        const fecha_hora_fin = new Date(fecha_hora_inicio.getTime() + formData.duracion_minutos * 60000);

        await citasService.create({
          ...formData,
          empresa_id: 1,
          sede_id: 1,
          recurso_id: 1,
          fecha_hora_inicio: fecha_hora_inicio.toISOString(),
          fecha_hora_fin: fecha_hora_fin.toISOString(),
          es_primera_vez: formData.tipo_cita === "INGRESO",
          es_urgencia: formData.tipo_cita === "ACCIDENTE",
        });
      }
      setIsDialogOpen(false);
      resetForm();
      loadCitas();
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Error al guardar cita");
    }
  };

  const resetForm = () => {
    setEditingCita(null);
    setFormData({
      paciente_id: 0,
      medico_id: 1,
      fecha_hora_inicio: "",
      duracion_minutos: 45,
      tipo_cita: "INGRESO",
      motivo: "",
      notas: "",
      estado: "NUEVA",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const getAppointmentByTime = (timeSlot: string) => {
    return citas.find(cita => {
      const citaTime = formatTime(cita.fecha_hora_inicio);
      return citaTime.startsWith(timeSlot);
    });
  };

  const getPacienteNombre = (paciente_id: number) => {
    const paciente = pacientes.find(p => p.id === paciente_id);
    if (!paciente) return `Paciente #${paciente_id}`;
    return `${paciente.nombre} ${paciente.apellido_paterno}`;
  };

  const getPacienteInfo = (paciente_id: number) => {
    return pacientes.find(p => p.id === paciente_id);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Start at 8:00
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const filteredPacientes = pacientes.filter(p =>
    searchPaciente === "" ||
    `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`.toLowerCase().includes(searchPaciente.toLowerCase()) ||
    (p.numero_expediente && p.numero_expediente.toLowerCase().includes(searchPaciente.toLowerCase()))
  );

  const stats = {
    total: citas.length,
    confirmadas: citas.filter(c => c.estado === "CONFIRMADA").length,
    nuevas: citas.filter(c => c.estado === "NUEVA").length,
    noAsistio: citas.filter(c => c.estado === "NO_ASISTIO").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Cargando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            Agenda - Medicina del Trabajo
          </h2>
          <p className="text-muted-foreground mt-2">
            Programa exámenes médicos ocupacionales
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita Ocupacional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCita ? "Editar Cita" : "Nueva Cita de Examen Ocupacional"}
              </DialogTitle>
              <DialogDescription>
                Programa un examen médico ocupacional para un trabajador
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="paciente_id">Trabajador *</Label>
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o expediente..."
                    value={searchPaciente}
                    onChange={(e) => setSearchPaciente(e.target.value)}
                    className="mb-2"
                  />
                  <select
                    id="paciente_id"
                    name="paciente_id"
                    value={formData.paciente_id}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value={0}>Seleccionar trabajador...</option>
                    {filteredPacientes.slice(0, 20).map(paciente => (
                      <option key={paciente.id} value={paciente.id}>
                        {paciente.numero_expediente} - {paciente.nombre} {paciente.apellido_paterno}
                        {paciente.empresa && ` (${paciente.empresa})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Appointment Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_cita">Tipo de Examen *</Label>
                    <select
                      id="tipo_cita"
                      name="tipo_cita"
                      value={formData.tipo_cita}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required
                    >
                      {tiposCita.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duracion_minutos">Duración (minutos) *</Label>
                    <Input
                      id="duracion_minutos"
                      name="duracion_minutos"
                      type="number"
                      min={15}
                      max={180}
                      value={formData.duracion_minutos}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_hora_inicio">Fecha y Hora *</Label>
                  <Input
                    id="fecha_hora_inicio"
                    name="fecha_hora_inicio"
                    type="datetime-local"
                    value={formData.fecha_hora_inicio}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Motive */}
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo / Observaciones</Label>
                  <Input
                    id="motivo"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleInputChange}
                    placeholder="Ej: Examen de altura, audiometría, espirometría"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="NUEVA">Nueva</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="EN_ESPERA">En Espera</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="NO_ASISTIO">No Asistió</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCita ? "Actualizar" : "Agendar Cita"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
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
              <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Exámenes del día</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.confirmadas}</div>
            <p className="text-sm text-muted-foreground">Confirmados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.nuevas}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.noAsistio}</div>
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
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Exámenes Médicos Ocupacionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeSlots.map((time) => {
                  const appointment = getAppointmentByTime(time);

                  return (
                    <div key={time} className="flex gap-4 border-b pb-2">
                      <div className="w-16 text-sm font-medium text-muted-foreground pt-2">
                        {time}
                      </div>
                      <div className="flex-1">
                        {appointment ? (
                          <div
                            className={`p-3 rounded-lg ${statusColors[appointment.estado as keyof typeof statusColors]} transition-all hover:shadow-md cursor-pointer`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-semibold">
                                  {getPacienteNombre(appointment.paciente_id)}
                                </p>
                                <p className="text-sm opacity-90">
                                  {tiposCita.find(t => t.value === appointment.tipo_cita)?.label || appointment.tipo_cita}
                                </p>
                                {appointment.motivo && (
                                  <p className="text-xs opacity-75 mt-1">{appointment.motivo}</p>
                                )}
                                {(() => {
                                  const pacienteInfo = getPacienteInfo(appointment.paciente_id);
                                  return pacienteInfo?.empresa && (
                                    <p className="text-xs opacity-75 flex items-center gap-1 mt-1">
                                      <Briefcase className="h-3 w-3" />
                                      {pacienteInfo.empresa} - {pacienteInfo.puesto}
                                    </p>
                                  );
                                })()}
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">
                                  {statusLabels[appointment.estado as keyof typeof statusLabels]}
                                </p>
                                <p className="text-xs opacity-75">{appointment.duracion_minutos} min</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="p-3 rounded-lg border-2 border-dashed hover:border-primary hover:bg-accent transition-all cursor-pointer"
                            onClick={() => {
                              const dateStr = currentDate.toISOString().split('T')[0];
                              setFormData(prev => ({
                                ...prev,
                                fecha_hora_inicio: `${dateStr}T${time}:00`,
                              }));
                              setIsDialogOpen(true);
                            }}
                          >
                            <p className="text-sm text-muted-foreground text-center">
                              Horario disponible - Click para agendar
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
              <CardTitle className="text-lg">Citas del Día</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {citas.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {citas.map(cita => (
                    <div
                      key={cita.id}
                      className={`p-3 rounded-lg border ${
                        cita.estado === "EN_ESPERA"
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300"
                          : "bg-background"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">
                          {formatTime(cita.fecha_hora_inicio)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[cita.estado as keyof typeof statusColors]}`}>
                          {statusLabels[cita.estado as keyof typeof statusLabels]}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {getPacienteNombre(cita.paciente_id)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tiposCita.find(t => t.value === cita.tipo_cita)?.label || cita.tipo_cita}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No hay exámenes programados para este día
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Examen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs space-y-1">
                {tiposCita.map(tipo => (
                  <div key={tipo.value} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>{tipo.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
