import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { MenuItem, Order, OrderItem } from '@/types/interfaces';
import { useNotification } from './useNotification';

// Exponer hooks especializados: useFirestoreMenu y useFirestoreOrders
export const useFirestoreMenu = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    const q = query(collection(db, 'menu'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          image: data.image,
          available: data.available ?? true,
          sabores: data.sabores,
          alitasPrecios: data.alitasPrecios,
          jugosOpciones: data.jugosOpciones
        });
      });
      setMenu(items);
      setLoading(false);
    }, (error) => {
      console.error('Error al obtener menú:', error);
      showToast({ title: 'Error', description: 'No se pudo cargar el menú', variant: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addMenuItem = async (item: Partial<MenuItem>) => {
    try {
  await addDoc(collection(db, 'menu'), item as Record<string, unknown>);
      showToast({ title: 'Éxito', description: 'Plato agregado al menú', variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error al agregar item de menú:', error);
      showToast({ title: 'Error', description: 'No se pudo agregar el plato', variant: 'error' });
      return false;
    }
  };

  const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {
    try {
      // Firestore rejects undefined values. Deep-clean the item object to remove undefined fields
      const deepClean = (value: any): any => {
        if (value === undefined) return undefined;
        if (value === null) return null;
        if (Array.isArray(value)) {
          const arr = value.map(deepClean).filter(v => v !== undefined);
          return arr;
        }
        if (typeof value === 'object') {
          const out: Record<string, any> = {};
          Object.entries(value).forEach(([k, v]) => {
            const cleaned = deepClean(v);
            if (cleaned !== undefined) out[k] = cleaned;
          });
          return Object.keys(out).length > 0 ? out : undefined;
        }
        return value;
      };

      const sanitized = deepClean(item) as Record<string, unknown> | undefined;
      if (!sanitized || Object.keys(sanitized).length === 0) {
        // Nothing to update
        showToast({ title: 'Aviso', description: 'No hay cambios para guardar', variant: 'info' });
        return true;
      }

      await updateDoc(doc(db, 'menu', id), sanitized as Record<string, unknown>);
      showToast({ title: 'Éxito', description: 'Plato actualizado', variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error al actualizar item de menú:', error);
      showToast({ title: 'Error', description: 'No se pudo actualizar el plato', variant: 'error' });
      return false;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menu', id));
      showToast({ title: 'Éxito', description: 'Plato eliminado', variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error al eliminar item de menú:', error);
      showToast({ title: 'Error', description: 'No se pudo eliminar el plato', variant: 'error' });
      return false;
    }
  };

  return {
    menu,
    loading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  };
};

export const useFirestoreOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    // Para evitar la necesidad de crear un índice compuesto en Firestore,
    // escuchamos por timestamp y filtramos por status en el cliente.
    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docu) => {
        const data = docu.data();
        const status = data.status as string | undefined;
        // filtrar solo los estados que nos interesan en cliente
        if (status && ['pending', 'preparing', 'ready', 'delivered'].includes(status)) {
          // Normalizar los items para asegurar que menuItem siempre exista
          const normalizedItems = data.items?.map((item: any) => ({
            ...item,
            menuItem: item.menuItem || {
              id: item.id || '',
              name: 'Producto no encontrado',
              price: 0,
              category: '',
              description: ''
            },
            options: {
              ...item.options,
              flavor: Array.isArray(item.options?.flavor) ? item.options.flavor : 
                      typeof item.options?.flavor === 'string' ? item.options.flavor.split(',').map(s => s.trim()) :
                      []
            }
          })) || [];

          items.push({
            id: docu.id,
            ...data,
            items: normalizedItems,
            timestamp: data.timestamp && typeof data.timestamp.toMillis === 'function' ? data.timestamp.toMillis() : data.timestamp
          } as Order);
        }
      });
      setOrders(items);
      setLoading(false);
    }, (error) => {
      console.error('Error al obtener órdenes (listener):', error);
      showToast({ title: 'Error', description: 'No se pudieron cargar los pedidos', variant: 'error' });
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      if (!order.items || order.items.length === 0) {
        showToast({ title: 'Error', description: 'El pedido debe tener al menos un item', variant: 'error' });
        return false;
      }

      // Normalizar items antes de guardar
      const normalizedItems = order.items.map((item: any) => {
        const flavor = item.options?.flavor;
        const flavorArray: string[] = Array.isArray(flavor)
          ? flavor
          : typeof flavor === 'string'
            ? flavor.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

        return {
          menuItem: {
            id: item.menuItem?.id || '',
            name: item.menuItem?.name || 'Producto no encontrado',
            price: item.menuItem?.price ?? 0,
            category: item.menuItem?.category || '',
            description: item.menuItem?.description || ''
          },
          quantity: item.quantity || 1,
          notes: item.notes || '',
          options: {
            type: item.options?.type || '',
            flavor: flavorArray
          }
        } as OrderItem;
      });

      const timestampValue = (order as any).timestamp;

      const isFirestoreTimestamp = (v: unknown): v is Timestamp => {
        return typeof v === 'object' && v !== null && typeof (v as any).toMillis === 'function';
      };

      const isDateLike = (v: unknown): v is Date => Object.prototype.toString.call(v) === '[object Date]';

      let firestoreTimestamp: Timestamp;
      if (isFirestoreTimestamp(timestampValue)) {
        firestoreTimestamp = timestampValue as Timestamp;
      } else if (timestampValue && (typeof timestampValue === 'number' || typeof timestampValue === 'string')) {
        firestoreTimestamp = Timestamp.fromMillis(Number(timestampValue));
      } else if (isDateLike(timestampValue)) {
        firestoreTimestamp = Timestamp.fromMillis((timestampValue as Date).getTime());
      } else {
        firestoreTimestamp = Timestamp.now();
      }

      const orderData = {
        ...order,
        items: normalizedItems,
        timestamp: firestoreTimestamp
      };

      await addDoc(collection(db, 'orders'), orderData as Record<string, unknown>);
      showToast({ title: 'Éxito', description: 'Pedido enviado correctamente', variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error al agregar orden:', error);
      showToast({ title: 'Error', description: 'No se pudo enviar el pedido', variant: 'error' });
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      showToast({ title: 'Éxito', description: 'Estado del pedido actualizado', variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error al actualizar estado de orden:', error);
      showToast({ title: 'Error', description: 'No se pudo actualizar el pedido', variant: 'error' });
      return false;
    }
  };

  const markOrderAsDelivered = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivered',
        deliveredAt: Timestamp.now()
      });
      showToast({ title: 'Éxito', description: 'Pedido marcado como entregado', variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      showToast({ title: 'Error', description: 'No se pudo actualizar el pedido', variant: 'error' });
      return false;
    }
  };

  return {
    orders,
    loading,
    addOrder,
    updateOrderStatus,
    markOrderAsDelivered
  };
};

// Compatibilidad: exportar useFirestore que combine menu y orders
export const useFirestore = () => {
  const menuHook = useFirestoreMenu();
  const ordersHook = useFirestoreOrders();

  const getWaiterOrders = async () => {
    // mantener la compatibilidad: devolver copia del array de órdenes
    return ordersHook.orders;
  };

  return {
    menuItems: menuHook.menu,
    orders: ordersHook.orders,
    loading: menuHook.loading || ordersHook.loading,
    addOrder: ordersHook.addOrder,
    getWaiterOrders,
    markOrderAsDelivered: ordersHook.markOrderAsDelivered,
    // exponer operaciones de menú por si se usan
    addMenuItem: menuHook.addMenuItem,
    updateMenuItem: menuHook.updateMenuItem,
    deleteMenuItem: menuHook.deleteMenuItem,
    updateOrderStatus: ordersHook.updateOrderStatus
  };
};