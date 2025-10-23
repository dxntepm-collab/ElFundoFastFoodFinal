import { useState, useEffect } from 'react';
import {
  LogOut, DollarSign, ShoppingBag, Clock, TrendingUp,
  BarChart3, Users, Plus, ChefHat, CheckCircle, Edit, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirestore, useFirestoreMenu, useFirestoreOrders } from '@/hooks/useFirestore';
import { useNotification } from '@/hooks/useNotification';
import { categories, alitasOptions } from '@/data/mockData';
import type { MenuItem, Table, Order } from '@/types/interfaces';
import { TableManager } from './TableManager';
// OrdersManager was removed or renamed; import omitted.
import { TableEditor } from './TableEditor';
import { toast } from 'sonner';
// ...existing code...

import type { NewMenuItem } from '@/types/menu';
import { db } from '@/config/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

  function CreateUserForm() {
    const { register } = useFirebaseAuth();
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<'admin' | 'waiter' | 'kitchen'>('waiter');
    const [loading, setLoading] = useState<boolean>(false);
  
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
          <select id="role" value={role} onChange={e => setRole(e.target.value as 'admin' | 'waiter' | 'kitchen')} className="w-full rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-400 p-2">
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

export default function AdminPanel() {
  // Gestión de usuarios
  const [users, setUsers] = useState<Array<{id: string, name: string, email: string, role: string}>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList: Array<{id: string, name: string, email: string, role: string}> = [];
      querySnapshot.forEach((docu) => {
        const data = docu.data();
        userList.push({
          id: docu.id,
          name: data.name,
          email: data.email,
          role: data.role
        });
      });
      setUsers(userList);
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast.success('Rol actualizado correctamente');
  };
  const { user, logout } = useFirebaseAuth();
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, loading: menuLoading } = useFirestoreMenu();
  const { orders, loading: ordersLoading } = useFirestoreOrders();
  const { showNotification } = useNotification();

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    category: categories[0],
    image: '',
    available: true,
    alitasPrecios: [
      { sabor: 'Al Panko', precios: { '6 und': 20, '12 und': 38, '16 und': 49 } },
      { sabor: 'BBQ', precios: { '6 und': 20, '12 und': 38, '16 und': 49 } },
      { sabor: 'Broaster', precios: { '6 und': 20, '12 und': 38, '16 und': 49 } },
      { sabor: 'Acevichadas', precios: { '6 und': 20, '12 und': 38, '16 und': 49 } },
      { sabor: 'Picantes', precios: { '6 und': 20, '12 und': 38, '16 und': 49 } },
      { sabor: 'Maracumango', precios: { '6 und': 20, '12 und': 38, '16 und': 49 } },
      { sabor: 'Anticucheras', precios: { '6 und': 20, '12 und': 38, '16 und': 49 } },
      { sabor: 'Maracuya', precios: { '6 und': 20, '12 und': 38, '16 und': 49 } },
      { sabor: 'Tocino', precios: { '6 und': 20, '12 und': 38, '16 und': 49 } }
    ]
  } as NewMenuItem);

  const resetForm = () => {
  setNewItem({
      name: '',
      description: '',
      price: 0,
      category: categories[0],
      image: '',
      available: true,
      alitasPrecios: alitasOptions.map(opt => ({
        sabor: opt.sabor,
        precios: { ...opt.precios }
      }))
  } as NewMenuItem);
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleAddItem = async () => {
    // Allow adding jugos when jugosOpciones.clasico is provided even if newItem.price is 0
    const isJugo = newItem.category === '🧃 JUGOS';
    const hasJugoPrice = !!(newItem.jugosOpciones && (newItem.jugosOpciones.clasico || newItem.jugosOpciones.conLeche));
    if (!newItem.name || !newItem.description || (newItem.price <= 0 && !(isJugo && hasJugoPrice))) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const success = await addMenuItem(newItem);
    if (success) {
      showNotification('✅ Plato Agregado', `${newItem.name} se agregó al menú`, 'success');
      resetForm();
    } else {
      toast.error('Error al agregar el plato');
    }
  };

  const handleUpdateItem = async () => {
    const isJugo = newItem.category === '🧃 JUGOS';
    const hasJugoPrice = !!(newItem.jugosOpciones && (newItem.jugosOpciones.clasico || newItem.jugosOpciones.conLeche));
    if (!editingItem || !newItem.name || !newItem.description || (newItem.price <= 0 && !(isJugo && hasJugoPrice))) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const success = await updateMenuItem(editingItem.id, newItem);
    if (success) {
      showNotification('✅ Plato Actualizado', `${newItem.name} se actualizó correctamente`, 'success');
      resetForm();
    } else {
      toast.error('Error al actualizar el plato');
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (window.confirm(`¿Estás seguro de eliminar "${item.name}"?`)) {
      const success = await deleteMenuItem(item.id);
      if (success) {
        showNotification('🗑️ Plato Eliminado', `${item.name} se eliminó del menú`, 'success');
      } else {
        toast.error('Error al eliminar el plato');
      }
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    const maybe = item as unknown as Record<string, unknown>;
    const jugosOpciones = 'jugosOpciones' in maybe ? (maybe.jugosOpciones as MenuItem['jugosOpciones']) : undefined;
    const sabores = 'sabores' in maybe ? (maybe.sabores as string[]) : undefined;

    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available,
      // Preserve jugosOpciones and sabores when editing existing items
      jugosOpciones,
      sabores,
      alitasPrecios: item.alitasPrecios || alitasOptions.map(opt => ({
        sabor: opt.sabor,
        precios: { ...opt.precios }
      }))
  } as NewMenuItem);
    setIsAddingItem(true);
  };

  // Estadísticas
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.timestamp);
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((total, order) => total + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const averageOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'status-pending' },
      preparing: { label: 'En Preparación', className: 'status-preparing' },
      ready: { label: 'Listo', className: 'status-ready' },
      delivered: { label: 'Entregado', className: 'bg-gray-500 text-white' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (menuLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen p-4 w-full max-w-7xl mx-auto flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/assets/logo.png" 
            alt="El Fundo Fast Food" 
            className="w-10 h-10 rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel Administrativo</h1>
            <p className="text-gray-600">Bienvenido, {user?.name}</p>
          </div>
        </div>
        <Button onClick={logout} variant="outline" className="rounded-xl">
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <div className="border-b mb-6 overflow-x-auto">
          <TabsList className="w-[600px] sm:w-full flex">
            <TabsTrigger 
              className="flex-1 min-w-[150px] p-4 text-sm sm:text-base" 
              value="dashboard"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              className="flex-1 min-w-[150px] p-4 text-sm sm:text-base" 
              value="menu"
            >
              Gestión de Menú
            </TabsTrigger>
            <TabsTrigger 
              className="flex-1 min-w-[150px] p-4 text-sm sm:text-base" 
              value="tables"
            >
              Gestión de Mesas
            </TabsTrigger>
            <TabsTrigger 
              className="flex-1 min-w-[150px] p-4 text-sm sm:text-base" 
              value="orders"
            >
              Pedidos
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Gestión de usuarios */}
          <Card className="glass-card border-0 mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuarios registrados
              </CardTitle>
              <CardDescription>El administrador puede cambiar el rol de cada usuario</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <p className="text-center text-gray-500">Cargando usuarios...</p>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-500">No hay usuarios registrados</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr>
                        <th className="py-2 px-4">Nombre</th>
                        <th className="py-2 px-4">Email</th>
                        <th className="py-2 px-4">Rol</th>
                        <th className="py-2 px-4">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b">
                          <td className="py-2 px-4">{user.name}</td>
                          <td className="py-2 px-4">{user.email}</td>
                          <td className="py-2 px-4">
                            <select
                              value={user.role}
                              onChange={e => handleRoleChange(user.id, e.target.value)}
                              className="rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-400 p-2"
                            >
                              <option value="admin">Administrador</option>
                              <option value="waiter">Mesero</option>
                              <option value="kitchen">Cocina</option>
                            </select>
                          </td>
                          <td className="py-2 px-4">
                            <span className="text-xs text-gray-500">{user.role === 'admin' ? 'Puede cambiar roles' : ''}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ventas Hoy</p>
                    <p className="text-2xl font-bold text-green-600">S/ {todayRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pedidos Hoy</p>
                    <p className="text-2xl font-bold text-blue-600">{todayOrders.length}</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ticket Promedio</p>
                    <p className="text-2xl font-bold text-purple-600">S/ {averageOrderValue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Pedidos Recientes
              </CardTitle>
              <CardDescription>Últimos 10 pedidos del día</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {todayOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay pedidos hoy</p>
                ) : (
                  <div className="space-y-3">
                    {todayOrders
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)
                      .map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                          <div>
                            <p className="font-medium">Mesa {order.tableNumber} - {order.waiterName}</p>
                            <p className="text-sm text-gray-600">
                              {order.items.length} platos - {new Date(order.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">S/ {order.total.toFixed(2)}</p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table Management */}
        <TabsContent value="tables">
          <TableManager />
        </TabsContent>

        {/* Menu Management */}
        <TabsContent value="menu" className="space-y-6">
          {/* Sección de gestión de sabores de alitas eliminada */}

          {/* ...resto del contenido de gestión de menú... */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Menú</h2>
            <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
              <DialogTrigger asChild>
                <Button className="btn-fundo" onClick={() => setIsAddingItem(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Plato
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Editar Plato' : 'Agregar Nuevo Plato'}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? 'Modifica los datos del plato' : 'Completa la información del nuevo plato'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Plato</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ej: Hamburguesa Clásica"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Describe los ingredientes y características"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Precio (S/)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.50"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Precios especiales para alitas */}
                  {/* Precios especiales para jugos */}
                  {newItem.category === '🧃 JUGOS' && (
                    <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200">
                      <h4 className="font-semibold text-green-700 mb-2">Opciones y precios de jugos</h4>
                      <div className="mb-2 grid grid-cols-2 gap-2 items-center">
                        <span className="font-medium text-gray-700">Clásico</span>
                        <Input
                          type="number"
                          step="0.50"
                          min="0"
                          value={newItem.jugosOpciones?.clasico ?? ''}
                          onChange={e => setNewItem({
                            ...newItem,
                            jugosOpciones: {
                              ...newItem.jugosOpciones,
                              clasico: parseFloat(e.target.value)
                            }
                          })}
                          className="rounded-xl"
                          placeholder="Clásico"
                        />
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-medium text-gray-700">¿Ofrecer opción con leche?</span>
                        <Switch
                          checked={!!newItem.jugosOpciones?.conLeche}
                          onCheckedChange={checked => {
                            setNewItem({
                              ...newItem,
                              jugosOpciones: {
                                ...newItem.jugosOpciones,
                                conLeche: checked ? (newItem.jugosOpciones?.conLeche ?? 0) : undefined
                              }
                            });
                          }}
                        />
                      </div>
                      {newItem.jugosOpciones?.conLeche !== undefined && (
                        <div className="mb-2 grid grid-cols-2 gap-2 items-center">
                          <span className="font-medium text-gray-700">Con leche</span>
                          <Input
                            type="number"
                            step="0.50"
                            min="0"
                            value={newItem.jugosOpciones?.conLeche ?? ''}
                            onChange={e => setNewItem({
                              ...newItem,
                              jugosOpciones: {
                                ...newItem.jugosOpciones,
                                conLeche: parseFloat(e.target.value)
                              }
                            })}
                            className="rounded-xl"
                            placeholder="Con leche"
                          />
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">Edita los precios para jugos con leche solo si corresponde.</div>
                    </div>
                  )}
                  {newItem.category === '🍗 ALITAS (salsas a elegir)' && (
                    <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200 space-y-6">
                      <h4 className="font-semibold text-orange-700 mb-2">Sabores de alitas</h4>
                      {(newItem.sabores || []).map((sabor, idx) => (
                        <div key={sabor + '-' + idx} className="mb-2 flex gap-2 items-center">
                          <Input
                            value={sabor}
                            onChange={e => {
                              const updated = (newItem.sabores || []).map((s, i) => i === idx ? e.target.value : s);
                              setNewItem({ ...newItem, sabores: updated });
                            }}
                            className="rounded-xl"
                            placeholder="Sabor"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const updated = (newItem.sabores || []).filter((_, i) => i !== idx);
                              setNewItem({ ...newItem, sabores: updated });
                            }}
                          >Eliminar</Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewItem({ ...newItem, sabores: [...(newItem.sabores || []), ''] })}
                      >Agregar sabor</Button>
                      <div className="text-xs text-gray-500 mt-2">Edita la lista de sabores disponibles para las alitas. Las unidades y precios se eligen en el panel del mesero.</div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="image">URL de Imagen</Label>
                    <Input
                      id="image"
                      value={newItem.image}
                      onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={newItem.available}
                      onCheckedChange={(checked) => setNewItem({ ...newItem, available: checked })}
                    />
                    <Label htmlFor="available">Disponible</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={resetForm} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                    <Button 
                      onClick={editingItem ? handleUpdateItem : handleAddItem} 
                      className="flex-1 btn-fundo"
                    >
                      {editingItem ? 'Actualizar' : 'Agregar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.map((item) => (
              <Card key={item.id} className="product-card">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ) : null}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <Badge variant={item.available ? "default" : "secondary"}>
                          {item.available ? 'Disponible' : 'No disponible'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-orange-600">
                          S/ {item.price.toFixed(2)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(item)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Historial de Pedidos</h2>
          
          <ScrollArea className="h-96">
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay pedidos registrados</p>
            ) : (
              <div className="space-y-4">
                {orders
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((order) => (
                    <Card key={order.id} className="glass-card border-0">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-800">
                              Pedido #{order.id.slice(-6)} - Mesa {order.tableNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.waiterName} - {new Date(order.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">S/ {order.total.toFixed(2)}</p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-600">
                              <span>{item.quantity}x {item.menuItem?.name ?? 'Producto no encontrado'}</span>
                              <span>S/ {((item.menuItem?.price ?? 0) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}