"use client"

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Pill,
  Sparkles,
  Mic,
  X,
  Save,
  Trash2,
  CheckCircle,
  Eye,
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
import { recetasService, Receta, DetalleReceta } from '@/services/recetas';
import { pacientesService, Paciente } from '@/services/pacientes';
import { VoiceRecorder } from '@/components/VoiceRecorder';

export default function RecetasPage() {
  const [loading, setLoading] = useState(true);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form data para nueva receta
  const [formData, setFormData] = useState({
    paciente_id: '',
    diagnostico: '',
    indicaciones_generales: '',
    fecha_vigencia: '',
  });

  // Estado para el asistente IA de medicamentos
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [currentMedicamento, setCurrentMedicamento] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Estado para medicamento actual
  const [medicamentoData, setMedicamentoData] = useState({
    medicamento: '',
    presentacion: '',
    concentracion: '',
    dosis: '',
    via_administracion: 'oral',
    frecuencia: '',
    duracion: '',
    indicaciones: '',
    cantidad: '1',
  });

  // Lista de medicamentos agregados
  const [medicamentos, setMedicamentos] = useState<Omit<DetalleReceta, 'id'>[]>([]);

  // Estado para diagnóstico por voz
  const [useVoiceForDiagnosis, setUseVoiceForDiagnosis] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recetasData, pacientesData] = await Promise.all([
        recetasService.getAll({ limit: 50 }),
        pacientesService.getAll({ limit: 100 }),
      ]);

      setRecetas(recetasData);
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecetaDetalle = async (id: number) => {
    try {
      const receta = await recetasService.getById(id);
      setRecetaSeleccionada(receta);
    } catch (error) {
      console.error('Error loading receta:', error);
    }
  };

  // ============================================================================
  // ASISTENTE IA PARA MEDICAMENTOS
  // ============================================================================

  const handleAISuggest = async () => {
    if (!currentMedicamento.trim()) return;

    setLoadingAI(true);
    try {
      const paciente = pacientes.find(p => p.id === parseInt(formData.paciente_id));
      const edadPaciente = paciente ? calcularEdad(paciente.fecha_nacimiento) : undefined;

      const suggestion = await recetasService.aiSuggestDosage({
        medicamento: currentMedicamento,
        diagnostico: formData.diagnostico || undefined,
        edad_paciente: edadPaciente,
        peso_paciente: undefined,
      });

      setAiSuggestion(suggestion);

      // Auto-rellenar el formulario con la sugerencia
      setMedicamentoData(prev => ({
        ...prev,
        medicamento: currentMedicamento,
        dosis: suggestion.dosis || prev.dosis,
        frecuencia: suggestion.frecuencia || prev.frecuencia,
        duracion: suggestion.duracion || prev.duracion,
        via_administracion: suggestion.via_administracion || prev.via_administracion,
        indicaciones: suggestion.indicaciones_adicionales || prev.indicaciones,
      }));

      setShowAIAssistant(true);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      alert('Error al obtener sugerencia de IA');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAddMedicamento = () => {
    if (!medicamentoData.medicamento || !medicamentoData.dosis || !medicamentoData.frecuencia) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const nuevoMedicamento: Omit<DetalleReceta, 'id'> = {
      medicamento: medicamentoData.medicamento,
      presentacion: medicamentoData.presentacion || undefined,
      concentracion: medicamentoData.concentracion || undefined,
      dosis: medicamentoData.dosis,
      via_administracion: medicamentoData.via_administracion,
      frecuencia: medicamentoData.frecuencia,
      duracion: medicamentoData.duracion || undefined,
      indicaciones: medicamentoData.indicaciones,
      cantidad: parseFloat(medicamentoData.cantidad),
    };

    setMedicamentos(prev => [...prev, nuevoMedicamento]);

    // Limpiar formulario
    setMedicamentoData({
      medicamento: '',
      presentacion: '',
      concentracion: '',
      dosis: '',
      via_administracion: 'oral',
      frecuencia: '',
      duracion: '',
      indicaciones: '',
      cantidad: '1',
    });
    setCurrentMedicamento('');
    setAiSuggestion(null);
    setShowAIAssistant(false);
  };

  const handleRemoveMedicamento = (index: number) => {
    setMedicamentos(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================================================
  // GENERAR RECETA COMPLETA CON IA
  // ============================================================================

  const handleGenerateCompleteWithAI = async () => {
    if (!formData.diagnostico || !formData.paciente_id) {
      alert('Por favor selecciona un paciente e ingresa un diagnóstico');
      return;
    }

    setLoadingAI(true);
    try {
      const paciente = pacientes.find(p => p.id === parseInt(formData.paciente_id));
      const edadPaciente = paciente ? calcularEdad(paciente.fecha_nacimiento) : 30;

      const result = await recetasService.aiGenerateComplete({
        diagnostico: formData.diagnostico,
        sintomas: formData.indicaciones_generales || 'Síntomas relacionados con el diagnóstico',
        edad_paciente: edadPaciente,
      });

      // Convertir los medicamentos sugeridos al formato correcto
      const medicamentosSugeridos = result.medicamentos.map((med: any) => ({
        medicamento: med.nombre,
        dosis: med.dosis,
        via_administracion: med.via || 'oral',
        frecuencia: med.frecuencia,
        duracion: med.duracion || undefined,
        indicaciones: med.indicaciones || '',
        cantidad: 1,
      }));

      setMedicamentos(medicamentosSugeridos);

      // Actualizar indicaciones generales
      if (result.recomendaciones_generales) {
        setFormData(prev => ({
          ...prev,
          indicaciones_generales: prev.indicaciones_generales + '\n\n' + result.recomendaciones_generales,
        }));
      }

      alert('Receta generada con IA. Por favor revisa y ajusta según sea necesario.');
    } catch (error) {
      console.error('Error generating complete prescription:', error);
      alert('Error al generar receta completa con IA');
    } finally {
      setLoadingAI(false);
    }
  };

  // ============================================================================
  // CREAR RECETA
  // ============================================================================

  const handleCreateReceta = async () => {
    if (!formData.paciente_id) {
      alert('Por favor selecciona un paciente');
      return;
    }

    if (medicamentos.length === 0) {
      alert('Por favor agrega al menos un medicamento');
      return;
    }

    try {
      await recetasService.create({
        paciente_id: parseInt(formData.paciente_id),
        diagnostico: formData.diagnostico || undefined,
        indicaciones_generales: formData.indicaciones_generales || undefined,
        fecha_vigencia: formData.fecha_vigencia || undefined,
        detalles: medicamentos,
      });

      alert('Receta creada exitosamente');
      setIsDialogOpen(false);
      loadData();

      // Limpiar formulario
      setFormData({
        paciente_id: '',
        diagnostico: '',
        indicaciones_generales: '',
        fecha_vigencia: '',
      });
      setMedicamentos([]);
    } catch (error) {
      console.error('Error creating receta:', error);
      alert('Error al crear receta');
    }
  };

  // ============================================================================
  // VOICE HANDLERS
  // ============================================================================

  const handleVoiceTranscription = (text: string) => {
    setFormData(prev => ({
      ...prev,
      diagnostico: text,
    }));
    setUseVoiceForDiagnosis(false);
  };

  // ============================================================================
  // UTILS
  // ============================================================================

  const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'success';
      case 'dispensada':
        return 'info';
      case 'cancelada':
        return 'destructive';
      case 'vencida':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando recetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Recetas Médicas</h1>
          <p className="text-gray-600 mt-1">Gestiona recetas con asistencia de IA</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Nueva Receta
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nueva Receta Médica
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

              {/* Diagnóstico con Voz */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="diagnostico">Diagnóstico</Label>
                  {!useVoiceForDiagnosis && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUseVoiceForDiagnosis(true)}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Usar Voz
                    </Button>
                  )}
                </div>

                {useVoiceForDiagnosis ? (
                  <div className="flex gap-2">
                    <VoiceRecorder
                      onTranscriptionComplete={handleVoiceTranscription}
                      buttonVariant="default"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setUseVoiceForDiagnosis(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Textarea
                    id="diagnostico"
                    value={formData.diagnostico}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnostico: e.target.value })
                    }
                    placeholder="Ej: Infección respiratoria aguda"
                    rows={2}
                  />
                )}
              </div>

              {/* Botón para generar receta completa con IA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900">
                      Asistente IA - Generar Receta Completa
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      La IA puede generar una receta completa basada en el diagnóstico y datos del paciente
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateCompleteWithAI}
                      disabled={!formData.diagnostico || !formData.paciente_id || loadingAI}
                      className="mt-3"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {loadingAI ? 'Generando...' : 'Generar Receta con IA'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Agregar Medicamentos */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Agregar Medicamentos
                </h3>

                {/* Asistente IA para medicamento individual */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre del medicamento (ej: Paracetamol)"
                      value={currentMedicamento}
                      onChange={(e) => setCurrentMedicamento(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={handleAISuggest}
                      disabled={!currentMedicamento || loadingAI}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {loadingAI ? 'Consultando IA...' : 'Ayuda IA'}
                    </Button>
                  </div>

                  {aiSuggestion && showAIAssistant && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">
                        Sugerencia de IA para {currentMedicamento}
                      </h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>
                          <strong>Dosis:</strong> {aiSuggestion.dosis}
                        </p>
                        <p>
                          <strong>Frecuencia:</strong> {aiSuggestion.frecuencia}
                        </p>
                        <p>
                          <strong>Duración:</strong> {aiSuggestion.duracion}
                        </p>
                        <p>
                          <strong>Vía:</strong> {aiSuggestion.via_administracion}
                        </p>
                        {aiSuggestion.advertencias && (
                          <p className="text-red-600">
                            <strong>Advertencias:</strong> {aiSuggestion.advertencias}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Formulario de medicamento */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Medicamento *</Label>
                      <Input
                        value={medicamentoData.medicamento}
                        onChange={(e) =>
                          setMedicamentoData({ ...medicamentoData, medicamento: e.target.value })
                        }
                        placeholder="Nombre del medicamento"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Presentación</Label>
                      <Input
                        value={medicamentoData.presentacion}
                        onChange={(e) =>
                          setMedicamentoData({ ...medicamentoData, presentacion: e.target.value })
                        }
                        placeholder="Ej: Tableta, Jarabe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Concentración</Label>
                      <Input
                        value={medicamentoData.concentracion}
                        onChange={(e) =>
                          setMedicamentoData({ ...medicamentoData, concentracion: e.target.value })
                        }
                        placeholder="Ej: 500mg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Dosis *</Label>
                      <Input
                        value={medicamentoData.dosis}
                        onChange={(e) =>
                          setMedicamentoData({ ...medicamentoData, dosis: e.target.value })
                        }
                        placeholder="Ej: 1 tableta"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Vía de Administración</Label>
                      <Select
                        value={medicamentoData.via_administracion}
                        onValueChange={(value) =>
                          setMedicamentoData({ ...medicamentoData, via_administracion: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oral">Oral</SelectItem>
                          <SelectItem value="topica">Tópica</SelectItem>
                          <SelectItem value="intravenosa">Intravenosa</SelectItem>
                          <SelectItem value="intramuscular">Intramuscular</SelectItem>
                          <SelectItem value="subcutanea">Subcutánea</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Frecuencia *</Label>
                      <Input
                        value={medicamentoData.frecuencia}
                        onChange={(e) =>
                          setMedicamentoData({ ...medicamentoData, frecuencia: e.target.value })
                        }
                        placeholder="Ej: Cada 8 horas"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Duración</Label>
                      <Input
                        value={medicamentoData.duracion}
                        onChange={(e) =>
                          setMedicamentoData({ ...medicamentoData, duracion: e.target.value })
                        }
                        placeholder="Ej: 7 días"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        value={medicamentoData.cantidad}
                        onChange={(e) =>
                          setMedicamentoData({ ...medicamentoData, cantidad: e.target.value })
                        }
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Indicaciones</Label>
                    <Textarea
                      value={medicamentoData.indicaciones}
                      onChange={(e) =>
                        setMedicamentoData({ ...medicamentoData, indicaciones: e.target.value })
                      }
                      placeholder="Ej: Tomar con alimentos"
                      rows={2}
                    />
                  </div>

                  <Button onClick={handleAddMedicamento} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Medicamento
                  </Button>
                </div>
              </div>

              {/* Lista de Medicamentos Agregados */}
              {medicamentos.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Medicamentos en esta receta</h3>
                  <div className="space-y-2">
                    {medicamentos.map((med, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Pill className="h-5 w-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-medium">{med.medicamento}</p>
                          <p className="text-sm text-gray-600">
                            {med.dosis} - {med.frecuencia}
                            {med.duracion && ` por ${med.duracion}`}
                          </p>
                          {med.indicaciones && (
                            <p className="text-sm text-gray-500 mt-1">
                              {med.indicaciones}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMedicamento(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Indicaciones Generales */}
              <div className="space-y-2">
                <Label>Indicaciones Generales</Label>
                <Textarea
                  value={formData.indicaciones_generales}
                  onChange={(e) =>
                    setFormData({ ...formData, indicaciones_generales: e.target.value })
                  }
                  placeholder="Reposo, hidratación, etc."
                  rows={3}
                />
              </div>

              {/* Fecha de Vigencia */}
              <div className="space-y-2">
                <Label htmlFor="fecha_vigencia">Fecha de Vigencia</Label>
                <Input
                  id="fecha_vigencia"
                  type="date"
                  value={formData.fecha_vigencia}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_vigencia: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateReceta}>
                <Save className="mr-2 h-4 w-4" />
                Crear Receta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Recetas */}
      <div className="grid gap-4">
        {recetas.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay recetas registradas</p>
            </CardContent>
          </Card>
        ) : (
          recetas.map((receta) => (
            <Card key={receta.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {receta.folio}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {receta.paciente?.nombre_completo || `Paciente ID: ${receta.paciente_id}`}
                    </p>
                  </div>
                  <Badge variant={getEstadoBadgeColor(receta.estado) as any}>
                    {receta.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Emisión</p>
                    <p className="font-medium">
                      {new Date(receta.fecha_emision).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Médico</p>
                    <p className="font-medium">
                      {receta.medico?.nombre || `ID: ${receta.medico_id}`}
                    </p>
                  </div>
                </div>

                {receta.diagnostico && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Diagnóstico</p>
                    <p className="text-sm">{receta.diagnostico}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Medicamentos</p>
                  <div className="space-y-1">
                    {receta.detalles.slice(0, 3).map((detalle) => (
                      <div key={detalle.id} className="text-sm flex items-center gap-2">
                        <Pill className="h-3 w-3 text-blue-600" />
                        <span>
                          {detalle.medicamento} - {detalle.dosis} {detalle.frecuencia}
                        </span>
                      </div>
                    ))}
                    {receta.detalles.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{receta.detalles.length - 3} más
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadRecetaDetalle(receta.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalle
                  </Button>
                  {!receta.firmada && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (confirm('¿Firmar esta receta?')) {
                          await recetasService.firmar(receta.id);
                          loadData();
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Firmar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
