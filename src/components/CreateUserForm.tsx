import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { toast } from 'sonner';

export function CreateUserForm() {
  const { register } = useFirebaseAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'waiter' | 'kitchen'>('waiter');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(email, password, name, role);
    setLoading(false);
    if (success) {
      setName('');
      setEmail('');
      setPassword('');
      setRole('waiter');
      toast.success('Usuario creado correctamente');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Nombre completo" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="usuario@email.com" />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Contraseña" />
      </div>
      <div>
        <Label htmlFor="role">Rol</Label>
        <select 
          id="role" 
          value={role} 
          onChange={e => setRole(e.target.value as 'admin' | 'waiter' | 'kitchen')} 
          className="w-full rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-400 p-2"
        >
          <option value="admin">Administrador</option>
          <option value="waiter">Mesero</option>
          <option value="kitchen">Cocina</option>
        </select>
      </div>
      <Button type="submit" className="w-full btn-fundo" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Usuario'}
      </Button>
    </form>
  );
}