"use client"

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Key,
  Shield,
  Mail,
  Phone,
  Calendar,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usuariosService, Usuario, UsuarioCreate, UsuarioUpdate, UsuarioStats } from '@/services/usuarios';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [stats, setStats] = useState<UsuarioStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterEspecialidad, setFilterEspecialidad] = useState('');

  // Modals
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<UsuarioCreate>({
    email: '',
    username: '',
    password: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    celular: '',
    cedula_profesional: '',
    especialidad: '',
    subespecialidad: '',
    empresa_id: 1, // TODO: Get from auth context
  });

  const [editForm, setEditForm] = useState<UsuarioUpdate>({});

  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadUsuarios();
    loadStats();
  }, [searchTerm, filterActive, filterEspecialidad]);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const filters: any = {};

      if (searchTerm) {
        filters.search = searchTerm;
      }

      if (filterActive !== 'all') {
        filters.is_active = filterActive === 'active';
      }

      if (filterEspecialidad) {
        filters.especialidad = filterEspecialidad;
      }

      const data = await usuariosService.list(filters);
      setUsuarios(data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await usuariosService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateUsuario = async () => {
    try {
      await usuariosService.create(createForm);
      alert('Usuario creado exitosamente');
      setCreateDialogOpen(false);
      resetCreateForm();
      loadUsuarios();
      loadStats();
    } catch (error: any) {
      console.error('Error creating usuario:', error);
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleEditUsuario = async () => {
    if (!selectedUsuario) return;

    try {
      await usuariosService.update(selectedUsuario.id, editForm);
      alert('Usuario actualizado exitosamente');
      setEditDialogOpen(false);
      setSelectedUsuario(null);
      setEditForm({});
      loadUsuarios();
    } catch (error: any) {
      console.error('Error updating usuario:', error);
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUsuario) return;

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      await usuariosService.resetPassword(selectedUsuario.id, {
        new_password: passwordForm.new_password,
      });
      alert('Contraseña reseteada exitosamente');
      setPasswordDialogOpen(false);
      setSelectedUsuario(null);
      setPasswordForm({ new_password: '', confirm_password: '' });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleToggleActive = async (usuario: Usuario) => {
    try {
      if (usuario.is_active) {
        await usuariosService.deactivate(usuario.id);
        alert('Usuario desactivado exitosamente');
      } else {
        await usuariosService.activate(usuario.id);
        alert('Usuario activado exitosamente');
      }
      loadUsuarios();
      loadStats();
    } catch (error: any) {
      console.error('Error toggling usuario status:', error);
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDeleteUsuario = async (usuario: Usuario) => {
    if (!confirm(`¿Estás seguro de desactivar al usuario ${usuario.nombre} ${usuario.apellido_paterno}?`)) {
      return;
    }

    try {
      await usuariosService.delete(usuario.id);
      alert('Usuario desactivado exitosamente');
      loadUsuarios();
      loadStats();
    } catch (error: any) {
      console.error('Error deleting usuario:', error);
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      email: '',
      username: '',
      password: '',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      telefono: '',
      celular: '',
      cedula_profesional: '',
      especialidad: '',
      subespecialidad: '',
      empresa_id: 1,
    });
  };

  const openEditDialog = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setEditForm({
      email: usuario.email,
      username: usuario.username,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      telefono: usuario.telefono,
      celular: usuario.celular,
      cedula_profesional: usuario.cedula_profesional,
      especialidad: usuario.especialidad,
      subespecialidad: usuario.subespecialidad,
      is_active: usuario.is_active,
    });
    setEditDialogOpen(true);
  };

  const openPasswordDialog = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setPasswordForm({ new_password: '', confirm_password: '' });
    setPasswordDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">
          Administra usuarios, roles y permisos del sistema
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <PowerOff className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactivos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Médicos</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.medicos}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, email o username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter by status */}
            <Select
              value={filterActive}
              onValueChange={(value: 'all' | 'active' | 'inactive') =>
                setFilterActive(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="active">Solo activos</SelectItem>
                <SelectItem value="inactive">Solo inactivos</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter by specialty */}
            <Input
              placeholder="Filtrar por especialidad..."
              value={filterEspecialidad}
              onChange={(e) => setFilterEspecialidad(e.target.value)}
              className="w-[200px]"
            />

            {/* Create button */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Completa la información del nuevo usuario
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  {/* Datos de acceso */}
                  <div className="col-span-2">
                    <h3 className="font-semibold mb-2">Datos de Acceso</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email *</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-username">Username *</Label>
                    <Input
                      id="create-username"
                      value={createForm.username}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, username: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="create-password">Contraseña *</Label>
                    <Input
                      id="create-password"
                      type="password"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Datos personales */}
                  <div className="col-span-2 mt-4">
                    <h3 className="font-semibold mb-2">Datos Personales</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-nombre">Nombre *</Label>
                    <Input
                      id="create-nombre"
                      value={createForm.nombre}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, nombre: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-apellido-paterno">Apellido Paterno *</Label>
                    <Input
                      id="create-apellido-paterno"
                      value={createForm.apellido_paterno}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, apellido_paterno: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-apellido-materno">Apellido Materno</Label>
                    <Input
                      id="create-apellido-materno"
                      value={createForm.apellido_materno}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, apellido_materno: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-telefono">Teléfono</Label>
                    <Input
                      id="create-telefono"
                      value={createForm.telefono}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, telefono: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-celular">Celular</Label>
                    <Input
                      id="create-celular"
                      value={createForm.celular}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, celular: e.target.value })
                      }
                    />
                  </div>

                  {/* Datos profesionales */}
                  <div className="col-span-2 mt-4">
                    <h3 className="font-semibold mb-2">Datos Profesionales (Médicos)</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-cedula">Cédula Profesional</Label>
                    <Input
                      id="create-cedula"
                      value={createForm.cedula_profesional}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, cedula_profesional: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-especialidad">Especialidad</Label>
                    <Input
                      id="create-especialidad"
                      value={createForm.especialidad}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, especialidad: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="create-subespecialidad">Subespecialidad</Label>
                    <Input
                      id="create-subespecialidad"
                      value={createForm.subespecialidad}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, subespecialidad: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUsuario}>Crear Usuario</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Profesional</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {usuario.nombre} {usuario.apellido_paterno}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{usuario.username}
                          </div>
                          {usuario.is_superuser && (
                            <Badge variant="secondary" className="mt-1">
                              Superusuario
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{usuario.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {usuario.telefono && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {usuario.telefono}
                            </div>
                          )}
                          {usuario.celular && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {usuario.celular}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {usuario.cedula_profesional ? (
                          <div>
                            <div className="text-sm font-medium">
                              {usuario.especialidad || 'Médico General'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Cédula: {usuario.cedula_profesional}
                            </div>
                            {usuario.subespecialidad && (
                              <div className="text-xs text-gray-500">
                                {usuario.subespecialidad}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {usuario.is_active ? (
                          <Badge variant="default" className="bg-green-600">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(usuario)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPasswordDialog(usuario)}
                            title="Resetear contraseña"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(usuario)}
                            title={usuario.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {usuario.is_active ? (
                              <PowerOff className="h-4 w-4 text-red-600" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUsuario(usuario)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Usuario Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario
            </DialogDescription>
          </DialogHeader>

          {selectedUsuario && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editForm.username || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editForm.nombre || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nombre: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-apellido-paterno">Apellido Paterno</Label>
                <Input
                  id="edit-apellido-paterno"
                  value={editForm.apellido_paterno || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, apellido_paterno: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-apellido-materno">Apellido Materno</Label>
                <Input
                  id="edit-apellido-materno"
                  value={editForm.apellido_materno || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, apellido_materno: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={editForm.telefono || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, telefono: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-celular">Celular</Label>
                <Input
                  id="edit-celular"
                  value={editForm.celular || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, celular: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cedula">Cédula Profesional</Label>
                <Input
                  id="edit-cedula"
                  value={editForm.cedula_profesional || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cedula_profesional: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-especialidad">Especialidad</Label>
                <Input
                  id="edit-especialidad"
                  value={editForm.especialidad || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, especialidad: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-subespecialidad">Subespecialidad</Label>
                <Input
                  id="edit-subespecialidad"
                  value={editForm.subespecialidad || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, subespecialidad: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUsuario}>Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetear Contraseña</DialogTitle>
            <DialogDescription>
              Establece una nueva contraseña para el usuario{' '}
              {selectedUsuario?.nombre} {selectedUsuario?.apellido_paterno}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, new_password: e.target.value })
                }
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                placeholder="Repite la contraseña"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword}>Resetear Contraseña</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
