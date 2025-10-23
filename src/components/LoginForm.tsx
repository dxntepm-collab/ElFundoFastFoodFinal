import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useNotification } from '@/hooks/useNotification';
import { toast } from 'sonner';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const { login, register, loading } = useFirebaseAuth();
  const { requestNotificationPermission } = useNotification();

  useEffect(() => {
    // Solicitar permisos de notificación al cargar
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (success) {
      toast.success('¡Bienvenido a El Fundo Fast Food!');
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await register(registerEmail, registerPassword, registerName, 'waiter');
    setIsLoading(false);
    if (success) {
      toast.success('Usuario registrado correctamente. Espera que el administrador asigne tu rol si es necesario.');
      setShowRegister(false);
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
    }
  };

  const demoCredentials = [
    { role: 'Administrador', email: 'admin@elfundo.com', password: 'admin123' },
    { role: 'Mesero', email: 'mesero@elfundo.com', password: 'mesero123' },
    { role: 'Cocina', email: 'cocina@elfundo.com', password: 'cocina123' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y título */}
        <div className="text-center space-y-4">
          <div className="glass-card p-6 inline-block">
            <img 
              src="/assets/logo.png" 
              alt="El Fundo Fast Food" 
              className="w-16 h-16 mx-auto mb-3 rounded-xl"
              onError={(e) => {
                // Fallback si no se puede cargar la imagen
                const img = e.currentTarget as HTMLImageElement;
                img.style.display = 'none';
                if (img.nextElementSibling && img.nextElementSibling instanceof HTMLElement) {
                  img.nextElementSibling.style.display = 'block';
                }
              }}
            />
            <div style={{ display: 'none' }} className="text-4xl mb-3">🍽️</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              El Fundo Fast Food
            </h1>
          </div>
          <p className="text-gray-600 font-medium">Sistema de Gestión de Restaurante</p>
        </div>

        {/* Formulario de login o registro */}
        <Card className="glass-card border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {showRegister ? 'Registrarse' : 'Iniciar Sesión'}
            </CardTitle>
            <CardDescription>
              {showRegister
                ? 'Completa los datos para crear tu cuenta. El rol será "mesero" por defecto.'
                : 'Ingresa tus credenciales para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showRegister ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registerName" className="text-gray-700 font-medium">Nombre</Label>
                  <Input
                    id="registerName"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerEmail" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword" className="text-gray-700 font-medium">Contraseña</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    placeholder="Crea una contraseña"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full btn-fundo text-white font-semibold py-3 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setShowRegister(false)}
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full btn-fundo text-white font-semibold py-3 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setShowRegister(true)}
                >
                  ¿No tienes cuenta? Regístrate
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}