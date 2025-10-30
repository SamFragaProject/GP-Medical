"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth";
import { User, Stethoscope, UserCog, Clipboard, Heart, DollarSign, Package } from "lucide-react";

// Demo users by role
const demoUsers = [
  {
    role: "Administrador",
    email: "admin@clinica.com",
    password: "admin123",
    icon: UserCog,
    color: "bg-blue-500",
    description: "Gestión completa del sistema"
  },
  {
    role: "Médico General",
    email: "dr.perez@clinica.com",
    password: "medico123",
    icon: Stethoscope,
    color: "bg-green-500",
    description: "Dr. Juan Pérez"
  },
  {
    role: "Pediatra",
    email: "dra.martinez@clinica.com",
    password: "medico123",
    icon: Heart,
    color: "bg-pink-500",
    description: "Dra. María Martínez"
  },
  {
    role: "Recepción",
    email: "recepcion@clinica.com",
    password: "recepcion123",
    icon: Clipboard,
    color: "bg-purple-500",
    description: "Ana González"
  },
  {
    role: "Enfermería",
    email: "enfermeria@clinica.com",
    password: "enfermeria123",
    icon: User,
    color: "bg-teal-500",
    description: "Laura Sánchez"
  },
  {
    role: "Caja",
    email: "caja@clinica.com",
    password: "caja123",
    icon: DollarSign,
    color: "bg-yellow-500",
    description: "Carlos Rodríguez"
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showManual, setShowManual] = useState(false);

  const handleLogin = async (e?: React.FormEvent, demoEmail?: string, demoPassword?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    const credentials = {
      email: demoEmail || email,
      password: demoPassword || password,
    };

    try {
      const response = await authService.login(credentials);
      authService.saveToken(response.access_token);

      // Save user info (mock for now)
      authService.saveUser({
        id: 1,
        email: credentials.email,
        username: credentials.email.split('@')[0],
        nombre: "Usuario",
        apellido_paterno: "Demo",
        empresa_id: 1,
        is_active: true,
        roles: ["ADMIN"],
        permisos: [],
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    handleLogin(undefined, user.email, user.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            GP-Medical
          </h1>
          <p className="text-muted-foreground text-lg">Sistema de Gestión Clínica</p>
        </div>

        {!showManual ? (
          /* Demo Users Grid */
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">
              Selecciona tu Rol para Ingresar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {demoUsers.map((user) => {
                const Icon = user.icon;
                return (
                  <Card
                    key={user.email}
                    className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-primary"
                    onClick={() => !loading && handleDemoLogin(user)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${user.color} bg-opacity-10`}>
                          <Icon className={`h-6 w-6 ${user.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{user.role}</CardTitle>
                          <CardDescription>{user.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>📧 {user.email}</p>
                        <p>🔑 {user.password}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-center">
                {error}
              </div>
            )}

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setShowManual(true)}
                disabled={loading}
              >
                O ingresa manualmente
              </Button>
            </div>
          </>
        ) : (
          /* Manual Login Form */
          <Card className="max-w-md mx-auto shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@clinica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowManual(false)}
                  disabled={loading}
                >
                  Volver a usuarios demo
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <a href="#" className="text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 2025 GP-Medical. Todos los derechos reservados.</p>
          <p className="mt-2">Sistema Demo - Usuarios de prueba configurados</p>
        </div>
      </div>
    </div>
  );
}
