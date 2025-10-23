import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { categories } from '@/data/mockData';
import type { MenuItem, Order } from '@/types/interfaces';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirestoreMenu, useFirestoreOrders } from '@/hooks/useFirestore';
import { useNotification } from '@/hooks/useNotification';
import { toast } from 'sonner';
import { ShoppingCart, Plus, Minus, Send, LogOut } from 'lucide-react';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export default function WaiterPanel() {
  const { user, logout } = useFirebaseAuth();
  const { menu, loading: menuLoading } = useFirestoreMenu();
  const { orders, addOrder } = useFirestoreOrders();
  const { showNotification } = useNotification();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number>(1);

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
    toast.success(`${menuItem.name} agregado al pedido`);
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => {
      return prev.reduce((acc, item) => {
        if (item.menuItem.id === menuItemId) {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as CartItem[]);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + ((item.menuItem?.price ?? 0) * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const newOrder: Omit<Order, 'id'> = {
      items: cart,
      total: getCartTotal(),
      status: 'pending',
      waiterName: user?.name || 'Mesero',
      tableNumber,
      timestamp: new Date()
    };

    const success = await addOrder(newOrder);
    
    if (success) {
      setCart([]);
      showNotification(
        '✅ Pedido Enviado',
        `Pedido para mesa ${tableNumber} enviado exitosamente`,
        'success'
      );
    } else {
      toast.error('Error al enviar el pedido');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'status-pending' },
      preparing: { label: 'En Preparación', className: 'status-preparing' },
      ready: { label: 'Listo', className: 'status-ready' },
      delivered: { label: 'Entregado', className: 'bg-gray-500 text-white' }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
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
            <h1 className="text-3xl font-bold text-gray-800">Panel del Mesero</h1>
            <p className="text-gray-600">Bienvenido, {user?.name}</p>
          </div>
        </div>
        <Button onClick={logout} variant="outline" className="rounded-xl">
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Menú */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">Menú del Día</CardTitle>
              <CardDescription>Selecciona los platos para el pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="rounded-xl">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid md:grid-cols-2 gap-4">
                      {menu
                        .filter(item => item.category === category && item.available)
                        .map((item) => (
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
                                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-orange-600">
                                      S/ {item.price.toFixed(2)}
                                    </span>
                                    <Button
                                      onClick={() => addToCart(item)}
                                      size="sm"
                                      className="btn-fundo"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Carrito y Pedidos */}
        <div className="space-y-6">
          {/* Carrito */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <ShoppingCart className="w-5 h-5" />
                Pedido Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(Number(e.target.value))}
                  className="rounded-xl"
                  placeholder="Mesa"
                  min="1"
                />
              </div>
              
              <ScrollArea className="h-48">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Carrito vacío</p>
                ) : (
                  <div className="space-y-2">
                        {cart.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.menuItem?.name ?? 'Producto no encontrado'}</p>
                          <p className="text-xs text-gray-600">S/ {(item.menuItem?.price ?? 0).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="h-6 w-6 p-0 rounded-full"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item.menuItem)}
                            className="h-6 w-6 p-0 rounded-full btn-fundo"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {cart.length > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-orange-600">S/ {getCartTotal().toFixed(2)}</span>
                  </div>
                  <Button onClick={submitOrder} className="w-full btn-fundo">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Pedido
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Historial de pedidos */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-gray-800">Mis Pedidos del Día</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay pedidos</p>
                ) : (
                  <div className="space-y-3">
                    {orders
                      .filter(order => order.waiterName === user?.name)
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)
                      .map((order) => (
                        <div key={order.id} className="p-3 bg-white/50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-sm">{order.id.slice(-6)}</p>
                              <p className="text-sm text-gray-600">Mesa {order.tableNumber}</p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.items.length} platos - S/ {order.total.toFixed(2)}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}