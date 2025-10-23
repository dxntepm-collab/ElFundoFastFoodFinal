import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { LogOut, ChefHat, ShoppingCart, Clock, CheckCircle, Users } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { useNotification } from '@/hooks/useNotification';
import { MenuItem, Order, Table, OrderStatus } from '@/types/interfaces';
import { TableMap } from './TableMap';
import { useTableManager } from '@/hooks/useTableManager';
import { MenuCategories } from './ui/menu-categories';
import { OrderDialog } from './ui/order-dialog';

export default function WaiterPanel() {
  const { user, logout } = useFirebaseAuth();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeTab, setActiveTab] = useState<string>('mesas');
  const { tables, loading: tablesLoading, updateTable, addTable, deleteTable, updateTableStatus } = useTableManager();
  interface CartItem { menuItem: MenuItem; quantity: number; notes?: string; options?: { type?: string; flavor?: string } }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [waiterOrders, setWaiterOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const { menuItems, orders, loading, addOrder, getWaiterOrders, markOrderAsDelivered } = useFirestore();
  const { showNotification } = useNotification();

  // Cart helpers (defensive minimal implementations)
  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    // ir automáticamente al menú al seleccionar una mesa
    setActiveTab('menu');
  };

  const handleAddToCart = (item: MenuItem) => {
    if (item.jugosOpciones || item.sabores) {
      setSelectedMenuItem(item);
    } else {
      setCart(prev => {
        const exists = prev.find(i => i.menuItem.id === item.id);
        if (exists) return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prev, { menuItem: item, quantity: 1 }];
      });
    }
  };

  const handleDialogAdd = (quantity: number, notes: string, options?: { type?: string; flavor?: string }) => {
    if (!selectedMenuItem) return;
    
    // Asegurarse de que tenemos un precio válido
    let newPrice = selectedMenuItem.price;
    if (selectedMenuItem.jugosOpciones && options?.type && selectedMenuItem.jugosOpciones[options.type]) {
      const optionPrice = Number(selectedMenuItem.jugosOpciones[options.type]);
      if (!isNaN(optionPrice)) {
        newPrice = optionPrice;
      }
    }

    const itemWithOptions = {
      ...selectedMenuItem,
      price: newPrice,
      name: `${selectedMenuItem.name}${options?.type ? ` (${options.type})` : ''}${options?.flavor ? ` - ${options.flavor}` : ''}`
    };

    setCart(prev => [...prev, { 
      menuItem: itemWithOptions, 
      quantity, 
      notes,
      options 
    }]);
    setSelectedMenuItem(null);
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(i => i.menuItem.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
  };

  const updateCartItemNotes = (id: string, notes: string) => {
    setCart(prev => prev.map(i => i.menuItem.id === id ? { ...i, notes } : i));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.menuItem.id !== id));
  };

  const calculateTotal = () => cart.reduce((s, it) => s + it.menuItem.price * it.quantity, 0);

  const submitOrder = async () => {
    if (!selectedTable) {
      showNotification('Error', 'Selecciona una mesa antes de enviar el pedido', 'error');
      return;
    }
    if (cart.length === 0) {
      showNotification('Error', 'El pedido está vacío', 'error');
      return;
    }

  const orderData: Omit<Order, 'id'> = {
    tableNumber: selectedTable.number,
    waiterName: user?.name || 'Mesero',
    items: cart.map(i => ({
      menuItem: i.menuItem,
      quantity: i.quantity,
      notes: i.notes || '',
      options: {
        type: i.options?.type || '',
        flavor: Array.isArray(i.options?.flavor) ? i.options.flavor : []
      }
    })),
    status: 'pending',
    customerName: customerName || '',
    notes: orderNotes || '',
    timestamp: Date.now(),
    total: calculateTotal()
  };

    const ok = await addOrder(orderData);
    if (ok) {
      setCart([]);
      setCustomerName('');
      setOrderNotes('');
      const ords = await getWaiterOrders();
      setWaiterOrders(ords);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'preparing': return <ChefHat className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'En preparación';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      default: return 'Desconocido';
    }
  };

  useEffect(() => {
    // precarga de órdenes si es necesario
    (async () => {
      try {
        const ords = await getWaiterOrders();
        setWaiterOrders(ords);
      } catch (err) {
        console.error('Error cargando órdenes', err);
      }
    })();
  }, [getWaiterOrders]);

  return (
  <div className="container mx-auto p-2 sm:p-4 max-w-full">
  <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0">
        <div className="flex items-center gap-4">
          <img src="/assets/logo.png" alt="El Fundo" className="w-10 h-10 rounded-lg" onError={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'} />
          <div>
            <h1 className="text-2xl font-bold">Panel del Mesero</h1>
            <p className="text-sm text-gray-600">{user?.name}</p>
          </div>
        </div>
        <Button onClick={logout} variant="outline"><LogOut className="w-4 h-4 mr-2" />Salir</Button>
      </div>

      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl">Gestión de Mesas</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Tabs defaultValue="mesas" className="w-full">
                <TabsList className="flex flex-wrap gap-2">
                  <TabsTrigger value="mesas">Mesas</TabsTrigger>
                  <TabsTrigger value="menu">Menú</TabsTrigger>
                  <TabsTrigger value="cart">Carrito</TabsTrigger>
                  <TabsTrigger value="orders">Pedidos</TabsTrigger>
                </TabsList>

            <TabsContent value="mesas">
              <TableMap
                tables={tables}
                onTableSelect={handleTableSelect}
                selectedTable={selectedTable}
                onUpdateTablePosition={(id, pos) => updateTable(id, pos)}
                isEditing={false}
              />
            </TabsContent>

            <TabsContent value="menu">
              {!selectedTable ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Selecciona una mesa primero
                      </h3>
                      <p className="text-sm text-gray-500">
                        Para tomar un pedido, primero debes seleccionar una mesa
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col lg:flex-row lg:space-x-6 w-full">
                  <div className="flex-1 min-w-0">
                    <Card className="mb-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                          <ChefHat className="h-5 w-5" />
                          Menú - Mesa {selectedTable.number}
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    <div className="overflow-x-auto pb-2 mb-4">
                      <MenuCategories
                        categories={Array.from(new Set(menuItems.map(item => item.category || 'Otros')))}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 mt-2">
                      {menuItems
                        .filter(item => selectedCategory === 'Todos' || item.category === selectedCategory)
                        .sort((a, b) => {
                          // Ordenar por categoría y luego por nombre
                          if ((a.category || '') < (b.category || '')) return -1;
                          if ((a.category || '') > (b.category || '')) return 1;
                          return a.name.localeCompare(b.name);
                        })
                        .map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-2 transition hover:shadow-md ${!item.available ? 'opacity-50' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-base text-gray-800 truncate">{item.name}</span>
                            <span className="text-sm font-bold text-orange-600">S/ {item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                          <Button
                            className="w-full rounded-lg text-sm font-medium"
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.available}
                          >
                            {item.available ? 'Agregar al Pedido' : 'No Disponible'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full lg:w-96 mt-6 lg:mt-0 flex-shrink-0">
                    {/* Carrito al lado derecho en pantallas grandes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Pedido Actual
                          {selectedTable && (
                            <Badge variant="outline">Mesa {selectedTable.number}</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {cart.length === 0 ? (
                          <div className="text-center py-8">
                            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No hay productos en el pedido</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {cart.map((item) => (
                              <Card key={item.menuItem.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{item.menuItem?.name ?? 'Producto no encontrado'}</h4>
                                    <div className="flex items-center gap-4 mt-2">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="h-8 w-8"
                                          onClick={() => updateCartItemQuantity(item.menuItem.id, item.quantity - 1)}
                                        >-</Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          className="h-8 w-8"
                                          onClick={() => updateCartItemQuantity(item.menuItem.id, item.quantity + 1)}
                                        >+</Button>
                                      </div>
                                      <div className="flex flex-col">
                                        {item.menuItem.sabores && item.options?.flavor && (
                                          <div className="flex flex-wrap gap-2 mb-2">
                                            {(() => {
                                              const raw = item.options?.flavor;
                                              const arr = Array.isArray(raw) ? raw : (typeof raw === 'string' ? raw.split(',').map(s => s.trim()).filter(Boolean) : []);
                                              return arr.map((s) => (
                                                <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800">{s}</span>
                                              ));
                                            })()}
                                          </div>
                                        )}
                                        <Input
                                        placeholder="Notas..."
                                        value={item.notes || ''}
                                        onChange={(e) => updateCartItemNotes(item.menuItem.id, e.target.value)}
                                        className="h-8"
                                      />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">S/ {((item.menuItem?.price ?? 0) * item.quantity).toFixed(2)}</p>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-600 mt-2"
                                      onClick={() => removeFromCart(item.menuItem.id)}
                                    >
                                      Eliminar
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            
                            <Card>
                              <CardContent className="p-4">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>Total:</span>
                                    <span>S/ {calculateTotal().toFixed(2)}</span>
                                  </div>
                                  
                                  <div className="grid gap-4">
                                    <Input
                                      placeholder="Nombre del cliente (opcional)"
                                      value={customerName}
                                      onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                    <Input
                                      placeholder="Notas adicionales (opcional)"
                                      value={orderNotes}
                                      onChange={(e) => setOrderNotes(e.target.value)}
                                    />
                                  </div>
                                  
                                  <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={submitOrder}
                                  >
                                    Enviar Pedido
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              <OrderDialog
                item={selectedMenuItem!}
                open={!!selectedMenuItem}
                onClose={() => setSelectedMenuItem(null)}
                onAdd={handleDialogAdd}
              />
            </TabsContent>

            <TabsContent value="cart">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Pedido Actual
                    {selectedTable && (
                      <Badge variant="outline">Mesa {selectedTable.number}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay productos en el pedido</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <Card key={item.menuItem.id}>
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.menuItem?.name ?? 'Producto no encontrado'}</h4>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => updateCartItemQuantity(item.menuItem.id, item.quantity - 1)}
                                  >-</Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => updateCartItemQuantity(item.menuItem.id, item.quantity + 1)}
                                  >+</Button>
                                </div>
                                <Input
                                  placeholder="Notas..."
                                  value={item.notes || ''}
                                  onChange={(e) => updateCartItemNotes(item.menuItem.id, e.target.value)}
                                  className="h-8"
                                />
                              </div>
                            </div>
                            <div className="text-right">
                                    <p className="font-semibold">S/ {((item.menuItem?.price ?? 0) * item.quantity).toFixed(2)}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 mt-2"
                                onClick={() => removeFromCart(item.menuItem.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-lg font-semibold">
                              <span>Total:</span>
                              <span>S/ {calculateTotal().toFixed(2)}</span>
                            </div>
                            
                            <div className="grid gap-4">
                              <Input
                                placeholder="Nombre del cliente (opcional)"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                              />
                              <Input
                                placeholder="Notas adicionales (opcional)"
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                              />
                            </div>
                            
                            <Button
                              className="w-full"
                              size="lg"
                              onClick={submitOrder}
                            >
                              Enviar Pedido
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pedidos Activos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {waiterOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay pedidos activos</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {waiterOrders.map((order) => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-semibold flex items-center gap-2">
                                  Mesa {order.tableNumber}
                                  {order.customerName && (
                                    <Badge variant="outline">{order.customerName}</Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  {getStatusText(order.status)}
                                </span>
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              {order.items.map((item) => {
                                const maybe = item as unknown as Record<string, unknown>;
                                const menuItem = (maybe.menuItem as MenuItem) || undefined;
                                const idKey = (maybe.id as string) ?? menuItem?.id ?? '';
                                const nameVal = menuItem?.name ?? (maybe.name as string) ?? '';
                                const priceVal = (menuItem?.price ?? (maybe.price as number) ?? 0) as number;
                                return (
                                  <div key={idKey} className="flex justify-between text-sm">
                                    <span>
                                      {item.quantity}x {nameVal}
                                      {item.notes && (
                                        <span className="text-gray-500 ml-2">({item.notes})</span>
                                      )}
                                    </span>
                                    <span>S/ {(priceVal * item.quantity).toFixed(2)}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="mt-4 flex justify-between items-center pt-4 border-t">
                              <div className="font-semibold">
                                Total: S/ {order.total.toFixed(2)}
                              </div>
                              {order.status === 'ready' && (
                                <Button
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => markOrderAsDelivered(order.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Marcar Entregado
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}