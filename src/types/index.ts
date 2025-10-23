// Interfaces para la gestión de mesas
export interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'processing';
  capacity: number;
  position: { x: number; y: number };
  createdAt?: Date;
}

// Interfaces para la gestión de órdenes
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
  price: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de usuario
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'waiter' | 'kitchen';
  name: string;
}