"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Stethoscope, Heart, Activity, ClipboardList, Calendar, User, Briefcase, CheckCircle2 } from "lucide-react";
import { encuentrosService, EncuentroClinico, NotaClinica, SignoVital, Diagnostico } from "@/services/encuentros";
import { pacientesService, Paciente } from "@/services/pacientes";

export default function ExpedientesPage() {
  const [loading, setLoading] = useState(true);
  const [encuentros, setEncuentros] = useState<EncuentroClinico[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [encuentroSeleccionado, setEncuentroSeleccionado] = useState<EncuentroClinico | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchPaciente, setSearchPaciente] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    paciente_id: 0,
    medico_id: 1, // TODO: Get from auth
    fecha_hora_inicio: "",
    tipo_encuentro: "EXAMEN_OCUPACIONAL",
    motivo_consulta: "",
  });

  const [notaData, setNotaData] = useState({
    subjetivo: "",
    objetivo: "",
    analisis: "",
    plan: "",
  });

  const [signosData, setSignosData] = useState({
    temperatura: "",
    frecuencia_cardiaca: "",
    frecuencia_respiratoria: "",
    presion_sistolica: "",
    presion_diastolica: "",
    saturacion_oxigeno: "",
    peso: "",
    altura: "",
  });

  const [diagnosticoData, setDiagnosticoData] = useState({
    codigo_cie10: "",
    descripcion: "",
    tipo: "PRESUNTIVO" as const,
    es_principal: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [encuentrosData, pacientesData] = await Promise.all([
        encuentrosService.getAll({ limit: 50 }),
        pacientesService.getAll({ limit: 100 }),
      ]);
      setEncuentros(encuentrosData);
      setPacientes(pacientesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEncuentroDetalle = async (id: number) => {
    try {
      const encuentro = await encuentrosService.getById(id);
      setEncuentroSeleccionado(encuentro);
    } catch (error) {
      console.error("Error loading encuentro:", error);
    }
  };

  const handleCreateEncuentro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await encuentrosService.create({
        ...formData,
        empresa_id: 1,
        fecha_hora_inicio: new Date(formData.fecha_hora_inicio).toISOString(),
      });
      setIsDialogOpen(false);
      loadData();
      resetForm();
    } catch (error) {
      console.error("Error creating encuentro:", error);
      alert("Error al crear encuentro");
    }
  };

  const handleSaveNota = async () => {
    if (!encuentroSeleccionado) return;
    try {
      await encuentrosService.createNota(encuentroSeleccionado.id, {
        medico_id: 1, // TODO: Get from auth
        ...notaData,
      });
      loadEncuentroDetalle(encuentroSeleccionado.id);
      alert("Nota guardada exitosamente");
    } catch (error) {
      console.error("Error saving nota:", error);
      alert("Error al guardar nota");
    }
  };

  const handleSaveSignos = async () => {
    if (!encuentroSeleccionado) return;
    try {
      const data: any = {
        registrado_por_id: 1, // TODO: Get from auth
      };
      Object.keys(signosData).forEach((key) => {
        const value = signosData[key as keyof typeof signosData];
        if (value) data[key] = parseFloat(value);
      });
      await encuentrosService.createSignosVitales(encuentroSeleccionado.id, data);
      loadEncuentroDetalle(encuentroSeleccionado.id);
      alert("Signos vitales guardados");
      setSignosData({
        temperatura: "",
        frecuencia_cardiaca: "",
        frecuencia_respiratoria: "",
        presion_sistolica: "",
        presion_diastolica: "",
        saturacion_oxigeno: "",
        peso: "",
        altura: "",
      });
    } catch (error) {
      console.error("Error saving signos:", error);
      alert("Error al guardar signos vitales");
    }
  };

  const handleAddDiagnostico = async () => {
    if (!encuentroSeleccionado) return;
    try {
      await encuentrosService.createDiagnostico(encuentroSeleccionado.id, diagnosticoData);
      loadEncuentroDetalle(encuentroSeleccionado.id);
      alert("Diagnóstico agregado");
      setDiagnosticoData({
        codigo_cie10: "",
        descripcion: "",
        tipo: "PRESUNTIVO",
        es_principal: false,
      });
    } catch (error) {
      console.error("Error adding diagnostico:", error);
      alert("Error al agregar diagnóstico");
    }
  };

  const resetForm = () => {
    setFormData({
      paciente_id: 0,
      medico_id: 1,
      fecha_hora_inicio: "",
      tipo_encuentro: "EXAMEN_OCUPACIONAL",
      motivo_consulta: "",
    });
  };

  const filteredPacientes = pacientes.filter(p =>
    searchPaciente === "" ||
    `${p.nombre} ${p.apellido_paterno}`.toLowerCase().includes(searchPaciente.toLowerCase()) ||
    (p.numero_expediente && p.numero_expediente.toLowerCase().includes(searchPaciente.toLowerCase()))
  );

  const getPacienteNombre = (paciente_id: number) => {
    const paciente = pacientes.find(p => p.id === paciente_id);
    if (!paciente) return `Paciente #${paciente_id}`;
    return `${paciente.nombre} ${paciente.apellido_paterno}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Cargando expedientes...</p>
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
            <FileText className="h-8 w-8 text-primary" />
            Expedientes Clínicos - Medicina del Trabajo
          </h2>
          <p className="text-muted-foreground mt-2">
            Gestiona encuentros clínicos y evaluaciones ocupacionales
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Encuentro Clínico
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Encuentro Clínico</DialogTitle>
              <DialogDescription>
                Inicia un nuevo encuentro clínico para un trabajador
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEncuentro}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="paciente_search">Buscar Trabajador</Label>
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o expediente..."
                    value={searchPaciente}
                    onChange={(e) => setSearchPaciente(e.target.value)}
                    className="mb-2"
                  />
                  <select
                    id="paciente_id"
                    value={formData.paciente_id}
                    onChange={(e) => setFormData({ ...formData, paciente_id: parseInt(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value={0}>Seleccionar trabajador...</option>
                    {filteredPacientes.slice(0, 20).map(paciente => (
                      <option key={paciente.id} value={paciente.id}>
                        {paciente.numero_expediente} - {paciente.nombre} {paciente.apellido_paterno}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_encuentro">Tipo de Examen</Label>
                  <select
                    id="tipo_encuentro"
                    value={formData.tipo_encuentro}
                    onChange={(e) => setFormData({ ...formData, tipo_encuentro: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="EXAMEN_OCUPACIONAL">Examen Ocupacional</option>
                    <option value="CONSULTA">Consulta General</option>
                    <option value="URGENCIA">Urgencia</option>
                    <option value="SEGUIMIENTO">Seguimiento</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_hora_inicio">Fecha y Hora</Label>
                  <Input
                    id="fecha_hora_inicio"
                    type="datetime-local"
                    value={formData.fecha_hora_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_hora_inicio: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo_consulta">Motivo de Consulta</Label>
                  <Textarea
                    id="motivo_consulta"
                    value={formData.motivo_consulta}
                    onChange={(e) => setFormData({ ...formData, motivo_consulta: e.target.value })}
                    placeholder="Ej: Examen periódico anual, evaluación de altura, etc."
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Encuentro</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de Encuentros */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Encuentros Recientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {encuentros.length > 0 ? (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {encuentros.map(encuentro => (
                    <div
                      key={encuentro.id}
                      onClick={() => loadEncuentroDetalle(encuentro.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                        encuentroSeleccionado?.id === encuentro.id ? 'border-primary bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {getPacienteNombre(encuentro.paciente_id)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          encuentro.estado === 'CERRADO' ? 'bg-gray-100 dark:bg-gray-800' :
                          encuentro.estado === 'COMPLETADO' ? 'bg-green-100 dark:bg-green-900/20' :
                          'bg-blue-100 dark:bg-blue-900/20'
                        }`}>
                          {encuentro.estado}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(encuentro.fecha_hora_inicio).toLocaleString('es-MX')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {encuentro.tipo_encuentro}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay encuentros clínicos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalle del Encuentro */}
        <div className="lg:col-span-2">
          {encuentroSeleccionado ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Expediente Clínico</span>
                  {encuentroSeleccionado.estado !== 'CERRADO' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        encuentrosService.cerrar(encuentroSeleccionado.id).then(() => {
                          loadEncuentroDetalle(encuentroSeleccionado.id);
                          alert("Encuentro cerrado exitosamente");
                        });
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Cerrar Encuentro
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Info del Paciente */}
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Trabajador</p>
                      <p className="font-medium">{getPacienteNombre(encuentroSeleccionado.paciente_id)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {new Date(encuentroSeleccionado.fecha_hora_inicio).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium">{encuentroSeleccionado.tipo_encuentro}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <p className="font-medium">{encuentroSeleccionado.estado}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Motivo de Consulta</p>
                    <p className="font-medium">{encuentroSeleccionado.motivo_consulta}</p>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="soap" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="soap">SOAP</TabsTrigger>
                    <TabsTrigger value="vitales">Signos Vitales</TabsTrigger>
                    <TabsTrigger value="diagnosticos">Diagnósticos</TabsTrigger>
                    <TabsTrigger value="resumen">Resumen</TabsTrigger>
                  </TabsList>

                  {/* SOAP Notes */}
                  <TabsContent value="soap" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>S - Subjetivo</Label>
                        <Textarea
                          value={notaData.subjetivo}
                          onChange={(e) => setNotaData({ ...notaData, subjetivo: e.target.value })}
                          placeholder="Síntomas relatados por el trabajador..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>O - Objetivo</Label>
                        <Textarea
                          value={notaData.objetivo}
                          onChange={(e) => setNotaData({ ...notaData, objetivo: e.target.value })}
                          placeholder="Hallazgos del examen físico..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>A - Análisis</Label>
                        <Textarea
                          value={notaData.analisis}
                          onChange={(e) => setNotaData({ ...notaData, analisis: e.target.value })}
                          placeholder="Evaluación e impresión diagnóstica..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>P - Plan</Label>
                        <Textarea
                          value={notaData.plan}
                          onChange={(e) => setNotaData({ ...notaData, plan: e.target.value })}
                          placeholder="Plan de manejo y recomendaciones..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleSaveNota}>
                        <FileText className="mr-2 h-4 w-4" />
                        Guardar Nota SOAP
                      </Button>
                    </div>

                    {/* Notas guardadas */}
                    {encuentroSeleccionado.notas_clinicas && encuentroSeleccionado.notas_clinicas.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold">Notas Previas:</h4>
                        {encuentroSeleccionado.notas_clinicas.map((nota) => (
                          <div key={nota.id} className="p-3 bg-muted rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                {nota.created_at && new Date(nota.created_at).toLocaleString('es-MX')}
                              </span>
                              {nota.firmada && (
                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded">
                                  Firmada
                                </span>
                              )}
                            </div>
                            {nota.subjetivo && <p className="text-sm"><strong>S:</strong> {nota.subjetivo}</p>}
                            {nota.objetivo && <p className="text-sm"><strong>O:</strong> {nota.objetivo}</p>}
                            {nota.analisis && <p className="text-sm"><strong>A:</strong> {nota.analisis}</p>}
                            {nota.plan && <p className="text-sm"><strong>P:</strong> {nota.plan}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Signos Vitales */}
                  <TabsContent value="vitales" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Temperatura (°C)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={signosData.temperatura}
                          onChange={(e) => setSignosData({ ...signosData, temperatura: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frecuencia Cardíaca (bpm)</Label>
                        <Input
                          type="number"
                          value={signosData.frecuencia_cardiaca}
                          onChange={(e) => setSignosData({ ...signosData, frecuencia_cardiaca: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Presión Sistólica (mmHg)</Label>
                        <Input
                          type="number"
                          value={signosData.presion_sistolica}
                          onChange={(e) => setSignosData({ ...signosData, presion_sistolica: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Presión Diastólica (mmHg)</Label>
                        <Input
                          type="number"
                          value={signosData.presion_diastolica}
                          onChange={(e) => setSignosData({ ...signosData, presion_diastolica: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Peso (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={signosData.peso}
                          onChange={(e) => setSignosData({ ...signosData, peso: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Altura (cm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={signosData.altura}
                          onChange={(e) => setSignosData({ ...signosData, altura: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveSignos}>
                      <Activity className="mr-2 h-4 w-4" />
                      Registrar Signos Vitales
                    </Button>

                    {/* Signos guardados */}
                    {encuentroSeleccionado.signos_vitales && encuentroSeleccionado.signos_vitales.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold">Registros Previos:</h4>
                        {encuentroSeleccionado.signos_vitales.map((signos) => (
                          <div key={signos.id} className="p-3 bg-muted rounded-lg grid grid-cols-3 gap-2 text-sm">
                            {signos.temperatura && <p>Temp: {signos.temperatura}°C</p>}
                            {signos.frecuencia_cardiaca && <p>FC: {signos.frecuencia_cardiaca} bpm</p>}
                            {signos.presion_sistolica && <p>PA: {signos.presion_sistolica}/{signos.presion_diastolica}</p>}
                            {signos.peso && <p>Peso: {signos.peso} kg</p>}
                            {signos.altura && <p>Altura: {signos.altura} cm</p>}
                            {signos.imc && <p>IMC: {signos.imc.toFixed(1)}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Diagnósticos */}
                  <TabsContent value="diagnosticos" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Código CIE-10</Label>
                        <Input
                          value={diagnosticoData.codigo_cie10}
                          onChange={(e) => setDiagnosticoData({ ...diagnosticoData, codigo_cie10: e.target.value })}
                          placeholder="Ej: Z10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Input
                          value={diagnosticoData.descripcion}
                          onChange={(e) => setDiagnosticoData({ ...diagnosticoData, descripcion: e.target.value })}
                          placeholder="Ej: Examen médico ocupacional"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={diagnosticoData.es_principal}
                            onChange={(e) => setDiagnosticoData({ ...diagnosticoData, es_principal: e.target.checked })}
                          />
                          <span className="text-sm">Diagnóstico Principal</span>
                        </label>
                      </div>
                      <Button onClick={handleAddDiagnostico}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Agregar Diagnóstico
                      </Button>
                    </div>

                    {/* Diagnósticos guardados */}
                    {encuentroSeleccionado.diagnosticos && encuentroSeleccionado.diagnosticos.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold">Diagnósticos:</h4>
                        {encuentroSeleccionado.diagnosticos.map((dx) => (
                          <div key={dx.id} className="p-3 bg-muted rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{dx.codigo_cie10} - {dx.descripcion}</p>
                                <p className="text-xs text-muted-foreground">
                                  {dx.tipo} {dx.es_principal && '(Principal)'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Resumen */}
                  <TabsContent value="resumen">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Resumen del Encuentro</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Notas SOAP</p>
                            <p className="font-medium">
                              {encuentroSeleccionado.notas_clinicas?.length || 0} registradas
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Signos Vitales</p>
                            <p className="font-medium">
                              {encuentroSeleccionado.signos_vitales?.length || 0} registros
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Diagnósticos</p>
                            <p className="font-medium">
                              {encuentroSeleccionado.diagnosticos?.length || 0} diagnósticos
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Estado</p>
                            <p className="font-medium">{encuentroSeleccionado.estado}</p>
                          </div>
                        </div>
                      </div>

                      {encuentroSeleccionado.estado === 'CERRADO' && (
                        <Button className="w-full">
                          <FileText className="mr-2 h-4 w-4" />
                          Generar Certificado de Aptitud Laboral
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <Stethoscope className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Selecciona un encuentro clínico</p>
                  <p className="text-sm text-muted-foreground">
                    Selecciona un encuentro de la lista para ver su expediente completo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
