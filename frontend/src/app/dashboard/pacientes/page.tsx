"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Filter, Download, MoreVertical, Edit, Trash2, Eye, Briefcase } from "lucide-react";
import { pacientesService, Paciente } from "@/services/pacientes";

export default function PacientesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    genero: "M",
    curp: "",
    rfc: "",
    nss: "",
    telefono: "",
    email: "",
    calle: "",
    numero_exterior: "",
    numero_interior: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
    // Occupational Medicine fields
    empresa: "",
    puesto: "",
    area: "",
  });

  useEffect(() => {
    loadPacientes();
  }, [searchQuery]);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      const data = await pacientesService.getAll({
        search: searchQuery || undefined,
        limit: 100,
      });
      setPacientes(data);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPaciente) {
        await pacientesService.update(editingPaciente.id, formData);
      } else {
        await pacientesService.create({
          ...formData,
          empresa_id: 1, // Default empresa
          sede_id: 1,    // Default sede
        });
      }
      setIsDialogOpen(false);
      resetForm();
      loadPacientes();
    } catch (error) {
      console.error("Error saving patient:", error);
      alert("Error al guardar paciente");
    }
  };

  const handleEdit = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setFormData({
      nombre: paciente.nombre,
      apellido_paterno: paciente.apellido_paterno,
      apellido_materno: paciente.apellido_materno || "",
      fecha_nacimiento: paciente.fecha_nacimiento,
      genero: paciente.genero,
      curp: paciente.curp || "",
      rfc: paciente.rfc || "",
      nss: paciente.nss || "",
      telefono: paciente.telefono || "",
      email: paciente.email || "",
      calle: paciente.calle || "",
      numero_exterior: paciente.numero_exterior || "",
      numero_interior: paciente.numero_interior || "",
      colonia: paciente.colonia || "",
      ciudad: paciente.ciudad || "",
      estado: paciente.estado || "",
      codigo_postal: paciente.codigo_postal || "",
      empresa: paciente.empresa || "",
      puesto: paciente.puesto || "",
      area: paciente.area || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este paciente?")) {
      try {
        await pacientesService.delete(id);
        loadPacientes();
      } catch (error) {
        console.error("Error deleting patient:", error);
        alert("Error al eliminar paciente");
      }
    }
  };

  const resetForm = () => {
    setEditingPaciente(null);
    setFormData({
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      fecha_nacimiento: "",
      genero: "M",
      curp: "",
      rfc: "",
      nss: "",
      telefono: "",
      email: "",
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      colonia: "",
      ciudad: "",
      estado: "",
      codigo_postal: "",
      empresa: "",
      puesto: "",
      area: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Pacientes - Medicina del Trabajo
          </h2>
          <p className="text-muted-foreground mt-2">
            Gestiona el directorio de trabajadores y exámenes ocupacionales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Trabajador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPaciente ? "Editar Trabajador" : "Nuevo Trabajador"}
                </DialogTitle>
                <DialogDescription>
                  {editingPaciente ? "Actualiza la información del trabajador" : "Registra un nuevo trabajador para examen médico ocupacional"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  {/* Personal Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre(s) *</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
                      <Input
                        id="apellido_paterno"
                        name="apellido_paterno"
                        value={formData.apellido_paterno}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido_materno">Apellido Materno</Label>
                      <Input
                        id="apellido_materno"
                        name="apellido_materno"
                        value={formData.apellido_materno}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                      <Input
                        id="fecha_nacimiento"
                        name="fecha_nacimiento"
                        type="date"
                        value={formData.fecha_nacimiento}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genero">Género *</Label>
                      <select
                        id="genero"
                        name="genero"
                        value={formData.genero}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        required
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="curp">CURP</Label>
                      <Input
                        id="curp"
                        name="curp"
                        value={formData.curp}
                        onChange={handleInputChange}
                        maxLength={18}
                      />
                    </div>
                  </div>

                  {/* Occupational Info */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Información Laboral
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresa">Empresa/Cliente</Label>
                        <Input
                          id="empresa"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleInputChange}
                          placeholder="Ej: Coca-Cola FEMSA"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="puesto">Puesto</Label>
                        <Input
                          id="puesto"
                          name="puesto"
                          value={formData.puesto}
                          onChange={handleInputChange}
                          placeholder="Ej: Operador de montacargas"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area">Área/Departamento</Label>
                        <Input
                          id="area"
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          placeholder="Ej: Almacén"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Contacto</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* IDs */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Identificaciones</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rfc">RFC</Label>
                        <Input
                          id="rfc"
                          name="rfc"
                          value={formData.rfc}
                          onChange={handleInputChange}
                          maxLength={13}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nss">NSS (Seguro Social)</Label>
                        <Input
                          id="nss"
                          name="nss"
                          value={formData.nss}
                          onChange={handleInputChange}
                          maxLength={11}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Dirección</h3>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="calle">Calle</Label>
                          <Input
                            id="calle"
                            name="calle"
                            value={formData.calle}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numero_exterior">No. Exterior</Label>
                          <Input
                            id="numero_exterior"
                            name="numero_exterior"
                            value={formData.numero_exterior}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="colonia">Colonia</Label>
                          <Input
                            id="colonia"
                            name="colonia"
                            value={formData.colonia}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ciudad">Ciudad</Label>
                          <Input
                            id="ciudad"
                            name="ciudad"
                            value={formData.ciudad}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estado">Estado</Label>
                          <Input
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="codigo_postal">C.P.</Label>
                          <Input
                            id="codigo_postal"
                            name="codigo_postal"
                            value={formData.codigo_postal}
                            onChange={handleInputChange}
                            maxLength={5}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingPaciente ? "Actualizar" : "Crear Trabajador"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, expediente, CURP, teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Expediente</th>
                  <th className="text-left p-4 font-medium">Nombre</th>
                  <th className="text-left p-4 font-medium">Edad</th>
                  <th className="text-left p-4 font-medium">Género</th>
                  <th className="text-left p-4 font-medium">Empresa</th>
                  <th className="text-left p-4 font-medium">Puesto</th>
                  <th className="text-left p-4 font-medium">Teléfono</th>
                  <th className="text-left p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.length > 0 ? (
                  pacientes.map((paciente) => (
                    <tr
                      key={paciente.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm">{paciente.numero_expediente}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                            {paciente.nombre.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
                            </p>
                            {paciente.curp && (
                              <p className="text-xs text-muted-foreground">{paciente.curp}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{calcularEdad(paciente.fecha_nacimiento)} años</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          paciente.genero === 'M' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                          paciente.genero === 'F' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {paciente.genero === 'M' ? 'M' : paciente.genero === 'F' ? 'F' : 'O'}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {paciente.empresa ? (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {paciente.empresa}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {paciente.puesto || '-'}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {paciente.telefono || '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(paciente)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(paciente.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver expediente"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      {searchQuery ? (
                        <>
                          No se encontraron trabajadores que coincidan con "{searchQuery}"
                        </>
                      ) : (
                        <>
                          No hay trabajadores registrados. Haz clic en "Nuevo Trabajador" para comenzar.
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {pacientes.length} trabajadores registrados
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
