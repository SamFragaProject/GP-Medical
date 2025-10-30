'use client';

/**
 * Página de Configuración
 * Gestión de empresa, sedes y configuración general del sistema
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  configuracionService,
  Empresa,
  Sede,
  ConfiguracionGeneral,
} from '@/services/configuracion';
import {
  Building2,
  MapPin,
  Settings,
  Save,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from 'lucide-react';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ConfiguracionPage() {
  // Estados
  const [tabActiva, setTabActiva] = useState('empresa');
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionGeneral | null>(null);

  // Estados de formulario (empresa)
  const [formEmpresa, setFormEmpresa] = useState({
    nombre: '',
    razon_social: '',
    rfc: '',
    email: '',
    telefono: '',
    sitio_web: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    color_primario: '#3B82F6',
    color_secundario: '#10B981',
    regimen_fiscal: '',
    serie_factura: 'F',
    serie_nota_credito: 'NC',
  });

  // Estados de carga
  const [cargando, setCargando] = useState(false);

  // ========== EFECTOS ==========

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (empresa) {
      setFormEmpresa({
        nombre: empresa.nombre,
        razon_social: empresa.razon_social,
        rfc: empresa.rfc,
        email: empresa.email,
        telefono: empresa.telefono || '',
        sitio_web: empresa.sitio_web || '',
        direccion: empresa.direccion || '',
        ciudad: empresa.ciudad || '',
        estado: empresa.estado || '',
        codigo_postal: empresa.codigo_postal || '',
        color_primario: empresa.color_primario,
        color_secundario: empresa.color_secundario,
        regimen_fiscal: empresa.regimen_fiscal || '',
        serie_factura: empresa.serie_factura,
        serie_nota_credito: empresa.serie_nota_credito,
      });
    }
  }, [empresa]);

  // ========== FUNCIONES DE CARGA ==========

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // For production, use empresa_id from auth context
      const empresaId = 1;

      const [empresaData, sedesData, configData] = await Promise.all([
        configuracionService.getEmpresa(empresaId),
        configuracionService.listSedes(empresaId),
        configuracionService.getConfiguracion(empresaId),
      ]);

      setEmpresa(empresaData);
      setSedes(sedesData);
      setConfiguracion(configData);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      alert('Error al cargar configuración');
    } finally {
      setCargando(false);
    }
  };

  // ========== ACCIONES - EMPRESA ==========

  const guardarEmpresa = async () => {
    if (!empresa) return;

    try {
      const empresaActualizada = await configuracionService.updateEmpresa(
        empresa.id,
        formEmpresa
      );
      setEmpresa(empresaActualizada);
      alert('Empresa actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      alert('Error al actualizar empresa');
    }
  };

  // ========== ACCIONES - CONFIGURACIÓN ==========

  const guardarConfiguracion = async () => {
    if (!empresa || !configuracion) return;

    try {
      const configActualizada = await configuracionService.updateConfiguracion(
        empresa.id,
        configuracion
      );
      setConfiguracion(configActualizada);
      alert('Configuración actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      alert('Error al actualizar configuración');
    }
  };

  // ========== RENDER ==========

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la información de tu empresa, sedes y configuración general del sistema
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="mb-6">
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="sedes" className="gap-2">
            <MapPin className="h-4 w-4" />
            Sedes
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* ========== TAB: EMPRESA ========== */}
        <TabsContent value="empresa">
          <div className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Información básica de la empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre Comercial</Label>
                    <Input
                      id="nombre"
                      value={formEmpresa.nombre}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, nombre: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="razon_social">Razón Social</Label>
                    <Input
                      id="razon_social"
                      value={formEmpresa.razon_social}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, razon_social: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="rfc">RFC</Label>
                    <Input
                      id="rfc"
                      value={formEmpresa.rfc}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, rfc: e.target.value })
                      }
                      maxLength={13}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formEmpresa.email}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formEmpresa.telefono}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, telefono: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sitio_web">Sitio Web</Label>
                    <Input
                      id="sitio_web"
                      value={formEmpresa.sitio_web}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, sitio_web: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formEmpresa.direccion}
                    onChange={(e) =>
                      setFormEmpresa({ ...formEmpresa, direccion: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={formEmpresa.ciudad}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, ciudad: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={formEmpresa.estado}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, estado: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigo_postal">Código Postal</Label>
                    <Input
                      id="codigo_postal"
                      value={formEmpresa.codigo_postal}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, codigo_postal: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  Personaliza los colores de tu sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color_primario">Color Primario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color_primario"
                        type="color"
                        value={formEmpresa.color_primario}
                        onChange={(e) =>
                          setFormEmpresa({ ...formEmpresa, color_primario: e.target.value })
                        }
                        className="w-20"
                      />
                      <Input
                        value={formEmpresa.color_primario}
                        onChange={(e) =>
                          setFormEmpresa({ ...formEmpresa, color_primario: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="color_secundario">Color Secundario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color_secundario"
                        type="color"
                        value={formEmpresa.color_secundario}
                        onChange={(e) =>
                          setFormEmpresa({ ...formEmpresa, color_secundario: e.target.value })
                        }
                        className="w-20"
                      />
                      <Input
                        value={formEmpresa.color_secundario}
                        onChange={(e) =>
                          setFormEmpresa({ ...formEmpresa, color_secundario: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facturación */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Facturación</CardTitle>
                <CardDescription>
                  Parámetros para facturación electrónica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="regimen_fiscal">Régimen Fiscal (SAT)</Label>
                    <Input
                      id="regimen_fiscal"
                      value={formEmpresa.regimen_fiscal}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, regimen_fiscal: e.target.value })
                      }
                      placeholder="601, 612, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="serie_factura">Serie de Facturas</Label>
                    <Input
                      id="serie_factura"
                      value={formEmpresa.serie_factura}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, serie_factura: e.target.value })
                      }
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serie_nota_credito">Serie de Notas de Crédito</Label>
                    <Input
                      id="serie_nota_credito"
                      value={formEmpresa.serie_nota_credito}
                      onChange={(e) =>
                        setFormEmpresa({ ...formEmpresa, serie_nota_credito: e.target.value })
                      }
                      maxLength={10}
                    />
                  </div>
                </div>

                {empresa && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Folio actual de facturas: <strong>{empresa.folio_actual_factura}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Folio actual de notas de crédito:{' '}
                      <strong>{empresa.folio_actual_nota_credito}</strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botón Guardar */}
            <div className="flex justify-end">
              <Button onClick={guardarEmpresa} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ========== TAB: SEDES ========== */}
        <TabsContent value="sedes">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Sedes / Sucursales</h2>
                <p className="text-sm text-muted-foreground">
                  Gestiona las ubicaciones físicas de tu empresa
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Sede
              </Button>
            </div>

            {sedes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No hay sedes registradas. Crea tu primera sede para comenzar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {sedes.map((sede) => (
                  <Card key={sede.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{sede.nombre}</CardTitle>
                            {sede.activo ? (
                              <Badge className="bg-green-500">
                                <Check className="h-3 w-3 mr-1" />
                                Activa
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <X className="h-3 w-3 mr-1" />
                                Inactiva
                              </Badge>
                            )}
                          </div>
                          <CardDescription>Código: {sede.codigo}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {sede.direccion && (
                          <div>
                            <p className="text-muted-foreground">Dirección</p>
                            <p className="font-medium">{sede.direccion}</p>
                          </div>
                        )}
                        {sede.ciudad && (
                          <div>
                            <p className="text-muted-foreground">Ciudad</p>
                            <p className="font-medium">
                              {sede.ciudad}
                              {sede.estado && `, ${sede.estado}`}
                            </p>
                          </div>
                        )}
                        {sede.telefono && (
                          <div>
                            <p className="text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{sede.telefono}</p>
                          </div>
                        )}
                        {sede.email && (
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-medium">{sede.email}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========== TAB: SISTEMA ========== */}
        <TabsContent value="sistema">
          {configuracion && (
            <div className="space-y-6">
              {/* Notificaciones */}
              <Card>
                <CardHeader>
                  <CardTitle>Notificaciones</CardTitle>
                  <CardDescription>
                    Configura los canales de notificación del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif_email">Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificaciones y recordatorios por correo electrónico
                      </p>
                    </div>
                    <Switch
                      id="notif_email"
                      checked={configuracion.notificaciones_email}
                      onCheckedChange={(checked) =>
                        setConfiguracion({ ...configuracion, notificaciones_email: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif_sms">Notificaciones por SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar recordatorios de citas por mensaje de texto
                      </p>
                    </div>
                    <Switch
                      id="notif_sms"
                      checked={configuracion.notificaciones_sms}
                      onCheckedChange={(checked) =>
                        setConfiguracion({ ...configuracion, notificaciones_sms: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif_whatsapp">Notificaciones por WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar mensajes automáticos por WhatsApp
                      </p>
                    </div>
                    <Switch
                      id="notif_whatsapp"
                      checked={configuracion.notificaciones_whatsapp}
                      onCheckedChange={(checked) =>
                        setConfiguracion({ ...configuracion, notificaciones_whatsapp: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Citas */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Citas</CardTitle>
                  <CardDescription>
                    Parámetros para la gestión de citas médicas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="duracion_cita">Duración predeterminada de citas (minutos)</Label>
                    <Input
                      id="duracion_cita"
                      type="number"
                      value={configuracion.duracion_cita_default}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          duracion_cita_default: parseInt(e.target.value),
                        })
                      }
                      min={15}
                      max={120}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recordatorio_horas">Enviar recordatorio (horas antes)</Label>
                    <Input
                      id="recordatorio_horas"
                      type="number"
                      value={configuracion.recordatorio_citas_horas}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          recordatorio_citas_horas: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={72}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cancelacion_horas">
                      Permitir cancelación hasta (horas antes)
                    </Label>
                    <Input
                      id="cancelacion_horas"
                      type="number"
                      value={configuracion.permitir_cancelacion_horas}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          permitir_cancelacion_horas: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={48}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Facturación */}
              <Card>
                <CardHeader>
                  <CardTitle>Parámetros de Facturación</CardTitle>
                  <CardDescription>
                    Configuración de IVA y retenciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="iva">IVA predeterminado (%)</Label>
                    <Input
                      id="iva"
                      type="number"
                      value={configuracion.iva_default * 100}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          iva_default: parseFloat(e.target.value) / 100,
                        })
                      }
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ret_isr">Retención ISR (%)</Label>
                    <Input
                      id="ret_isr"
                      type="number"
                      value={configuracion.retencion_isr * 100}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          retencion_isr: parseFloat(e.target.value) / 100,
                        })
                      }
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ret_iva">Retención IVA (%)</Label>
                    <Input
                      id="ret_iva"
                      type="number"
                      value={configuracion.retencion_iva * 100}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          retencion_iva: parseFloat(e.target.value) / 100,
                        })
                      }
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Inventario */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventario</CardTitle>
                  <CardDescription>
                    Configuración de alertas de inventario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="alerta_stock">Alertas de stock mínimo</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar cuando productos lleguen al stock mínimo
                      </p>
                    </div>
                    <Switch
                      id="alerta_stock"
                      checked={configuracion.alerta_stock_minimo}
                      onCheckedChange={(checked) =>
                        setConfiguracion({ ...configuracion, alerta_stock_minimo: checked })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="alerta_caducidad">
                      Alertar productos próximos a caducar (días)
                    </Label>
                    <Input
                      id="alerta_caducidad"
                      type="number"
                      value={configuracion.alerta_caducidad_dias}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          alerta_caducidad_dias: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={365}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Seguridad */}
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad</CardTitle>
                  <CardDescription>
                    Parámetros de seguridad del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="timeout">Timeout de sesión (minutos)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={configuracion.sesion_timeout_minutos}
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          sesion_timeout_minutos: parseInt(e.target.value),
                        })
                      }
                      min={15}
                      max={480}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="2fa">Autenticación de dos factores (2FA)</Label>
                      <p className="text-sm text-muted-foreground">
                        Requerir verificación adicional al iniciar sesión
                      </p>
                    </div>
                    <Switch
                      id="2fa"
                      checked={configuracion.requiere_2fa}
                      onCheckedChange={(checked) =>
                        setConfiguracion({ ...configuracion, requiere_2fa: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botón Guardar */}
              <div className="flex justify-end">
                <Button onClick={guardarConfiguracion} className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Configuración
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
