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

export const useFirestore = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
      setMenuItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      if (!order.items || order.items.length === 0) {
        showToast({
          title: "Error",
          description: "El pedido debe tener al menos un item",
          variant: "error"
        });
        return false;
      }

      // Sanitizar los items del pedido
      const sanitizedItems = order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || ''
      }));

      const orderData = {
        ...order,
        items: sanitizedItems,
        timestamp: Timestamp.fromMillis(order.timestamp)
      };

      await addDoc(collection(db, 'orders'), orderData);
      showToast({
        title: "Éxito",
        description: "Pedido enviado correctamente",
        variant: "success"
      });
      return true;
    } catch (error) {
      console.error('Error al agregar orden:', error);
      showToast({
        title: "Error",
        description: "No se pudo enviar el pedido",
        variant: "error"
      });
      return false;
    }
  };

  const getWaiterOrders = () => {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending', 'preparing', 'ready']),
      orderBy('timestamp', 'desc')
    );

    return new Promise<Order[]>((resolve) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          orders.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp.toMillis()
          } as Order);
        });
        resolve(orders);
        unsubscribe();
      }, (error) => {
        console.error('Error al obtener órdenes:', error);
        showToast({
          title: "Error",
          description: "No se pudieron cargar los pedidos",
          variant: "error"
        });
        resolve([]);
      });
    });
  };

  const markOrderAsDelivered = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivered',
        deliveredAt: Timestamp.now()
      });
      showToast({
        title: "Éxito",
        description: "Pedido marcado como entregado",
        variant: "success"
      });
      return true;
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      showToast({
        title: "Error",
        description: "No se pudo actualizar el pedido",
        variant: "error"
      });
      return false;
    }
  };

  return {
    menuItems,
    orders,
    loading,
    addOrder,
    getWaiterOrders,
    markOrderAsDelivered
  };
};