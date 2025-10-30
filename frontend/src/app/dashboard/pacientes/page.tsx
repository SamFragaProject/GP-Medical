"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Download, MoreVertical } from "lucide-react";

const mockPatients = [
  { id: 1, name: "María García López", age: 45, gender: "F", phone: "555-0123", email: "maria@email.com", lastVisit: "2024-01-15", expediente: "EXP-001234" },
  { id: 2, name: "Juan Martínez Rodríguez", age: 32, gender: "M", phone: "555-0124", email: "juan@email.com", lastVisit: "2024-01-18", expediente: "EXP-001235" },
  { id: 3, name: "Ana Sánchez Pérez", age: 28, gender: "F", phone: "555-0125", email: "ana@email.com", lastVisit: "2024-01-17", expediente: "EXP-001236" },
  { id: 4, name: "Carlos Hernández Torres", age: 55, gender: "M", phone: "555-0126", email: "carlos@email.com", lastVisit: "2024-01-17", expediente: "EXP-001237" },
  { id: 5, name: "Laura Ramírez Gómez", age: 38, gender: "F", phone: "555-0127", email: "laura@email.com", lastVisit: "2024-01-16", expediente: "EXP-001238" },
  { id: 6, name: "Roberto López Díaz", age: 42, gender: "M", phone: "555-0128", email: "roberto@email.com", lastVisit: "2024-01-14", expediente: "EXP-001239" },
];

export default function PacientesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.expediente.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground mt-2">
            Gestiona el directorio maestro de pacientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Button>
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
                  <th className="text-left p-4 font-medium">Teléfono</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Última Visita</th>
                  <th className="text-left p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-mono text-sm">{patient.expediente}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                          {patient.name.charAt(0)}
                        </div>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{patient.age} años</td>
                    <td className="p-4">{patient.gender}</td>
                    <td className="p-4 text-sm text-muted-foreground">{patient.phone}</td>
                    <td className="p-4 text-sm text-muted-foreground">{patient.email}</td>
                    <td className="p-4 text-sm">
                      {new Date(patient.lastVisit).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredPatients.length} de {mockPatients.length} pacientes
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
