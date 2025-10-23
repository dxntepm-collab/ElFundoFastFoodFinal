import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Order } from '@/types/interfaces';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirestoreOrders } from '@/hooks/useFirestore';
import { useNotification } from '@/hooks/useNotification';
import { Clock, ChefHat, CheckCircle, LogOut } from 'lucide-react';

export default function KitchenPanel() {
  const { user, logout } = useFirebaseAuth();
  const { orders, updateOrderStatus, loading } = useFirestoreOrders();
  const { showNotification } = useNotification();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const success = await updateOrderStatus(orderId, newStatus);
    
    if (success) {
      const statusMessages = {
        preparing: '👨‍🍳 Pedido en preparación',
        ready: '✅ Pedido listo para entregar',
        delivered: '🚚 Pedido entregado'
      };
      
      if (newStatus in statusMessages) {
        showNotification(
          statusMessages[newStatus as keyof typeof statusMessages],
          `Pedido ${orderId.slice(-6)} actualizado`,
          'success'
        );
      }
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'status-pending', icon: Clock },
      preparing: { label: 'En Preparación', className: 'status-preparing', icon: ChefHat },
      ready: { label: 'Listo', className: 'status-ready', icon: CheckCircle },
      delivered: { label: 'Entregado', className: 'bg-gray-500 text-white', icon: CheckCircle }
    };
    
    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.className}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPendingOrders = () => orders.filter(order => order.status === 'pending');
  const getPreparingOrders = () => orders.filter(order => order.status === 'preparing');
  const getReadyOrders = () => orders.filter(order => order.status === 'ready');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  // Debug log: mostrar conteo de órdenes en la consola para verificar recepción
  console.log('KitchenPanel orders count:', orders.length);
  if (orders.length > 0) {
    console.log('Últimas órdenes (3):', orders.slice(0,3).map(o => ({ id: o.id, table: o.tableNumber, status: o.status }))); 
  }

  return (
    <>
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
            <h1 className="text-3xl font-bold text-gray-800">Panel de Cocina</h1>
            <p className="text-gray-600">Bienvenido, {user?.name}</p>
          </div>
        </div>
        <Button onClick={logout} variant="outline" className="rounded-xl">
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{getPendingOrders().length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Preparación</p>
                <p className="text-2xl font-bold text-blue-600">{getPreparingOrders().length}</p>
              </div>
              <ChefHat className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Listos</p>
                <p className="text-2xl font-bold text-green-600">{getReadyOrders().length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hoy</p>
                <p className="text-2xl font-bold text-purple-600">{orders.length}</p>
              </div>
              <ChefHat className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos por estado */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pedidos Pendientes */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5" />
              Pedidos Pendientes ({getPendingOrders().length})
            </CardTitle>
            <CardDescription>Nuevos pedidos por preparar</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {getPendingOrders().length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay pedidos pendientes</p>
              ) : (
                <div className="space-y-4">
                  {getPendingOrders()
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map((order) => (
                      <Card key={order.id} className="border border-orange-200 bg-orange-50/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-gray-800">Mesa {order.tableNumber}</p>
                              <p className="text-sm text-gray-600">{order.waiterName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(order.status)}
                              <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>Ver detalle</Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.menuItem?.name ?? 'Producto no encontrado'}</span>
                                <span className="text-gray-600">S/ {((item.menuItem?.price ?? 0) * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-semibold">Total: S/ {order.total.toFixed(2)}</span>
                            <Button
                              onClick={() => handleStatusChange(order.id, 'preparing')}
                              size="sm"
                              className="btn-fundo"
                            >
                              Iniciar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pedidos en Preparación */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <ChefHat className="w-5 h-5" />
              En Preparación ({getPreparingOrders().length})
            </CardTitle>
            <CardDescription>Pedidos siendo preparados</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {getPreparingOrders().length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay pedidos en preparación</p>
              ) : (
                <div className="space-y-4">
                  {getPreparingOrders()
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map((order) => (
                      <Card key={order.id} className="border border-blue-200 bg-blue-50/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-gray-800">Mesa {order.tableNumber}</p>
                              <p className="text-sm text-gray-600">{order.waiterName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(order.status)}
                              <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>Ver detalle</Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.menuItem?.name ?? 'Producto no encontrado'}</span>
                                <span className="text-gray-600">S/ {((item.menuItem?.price ?? 0) * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-semibold">Total: S/ {order.total.toFixed(2)}</span>
                            <Button
                              onClick={() => handleStatusChange(order.id, 'ready')}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Listo
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pedidos Listos */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Listos para Entregar ({getReadyOrders().length})
            </CardTitle>
            <CardDescription>Pedidos completados</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {getReadyOrders().length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay pedidos listos</p>
              ) : (
                <div className="space-y-4">
                  {getReadyOrders()
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map((order) => (
                      <Card key={order.id} className="border border-green-200 bg-green-50/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-gray-800">Mesa {order.tableNumber}</p>
                              <p className="text-sm text-gray-600">{order.waiterName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(order.status)}
                              <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>Ver detalle</Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.menuItem?.name ?? 'Producto no encontrado'}</span>
                                <span className="text-gray-600">S/ {((item.menuItem?.price ?? 0) * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-semibold">Total: S/ {order.total.toFixed(2)}</span>
                            <Button
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                              size="sm"
                              variant="outline"
                              className="border-green-300 text-green-700 hover:bg-green-100"
                            >
                              Entregado
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
    {/* Modal detalle de pedido para cocina */}
    {selectedOrder && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-2xl bg-background rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">Detalle Pedido - Mesa {selectedOrder.tableNumber}</h2>
              <p className="text-sm text-gray-600">Pedido #{selectedOrder.id.slice(-6)} • {new Date(selectedOrder.timestamp).toLocaleString()}</p>
              <p className="text-sm text-gray-600">Mesero: {selectedOrder.waiterName}</p>
            </div>
            <div>
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Cerrar</Button>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {selectedOrder.items.map((it, i) => (
              <div key={i} className="flex justify-between items-start p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="font-medium">{it.quantity}x {it.menuItem?.name || 'Producto no encontrado'}</div>
                  {it.notes && <div className="text-sm text-muted-foreground">{it.notes}</div>}
                  {it.options?.flavor && Array.isArray(it.options.flavor) && it.options.flavor.length > 0 && (
                    <div className="text-xs text-muted-foreground">Sabores: {it.options.flavor.join(', ')}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold">S/ {((it.menuItem?.price ?? 0) * it.quantity).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <div className="text-lg font-semibold">Total</div>
            <div className="text-xl font-bold">S/ {selectedOrder.total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}