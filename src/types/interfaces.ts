// src/types/interfaces.ts
// Versión limpia y canonical de tipos usados en la aplicación

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  available?: boolean;
  sabores?: string[];
  // opciones específicas (opcional)
  alitasPrecios?: Array<{
    sabor: string;
    precios: {
      '6 und'?: number;
      '12 und'?: number;
      '16 und'?: number;
    };
  }>;
  jugosOpciones?: {
    clasico?: number;
    conLeche?: number;
  };
}

export interface OrderItem {
  // En la app los items suelen venir anidados con el objeto MenuItem
  id?: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  // opciones seleccionadas en el momento de agregar (p.ej. tipo de jugo, sabores)
  options?: {
    type?: string;
    // ahora soportamos múltiples sabores seleccionados
    flavor?: string[];
  };
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id?: string;
  // formato legacy usado en componentes
  tableNumber?: number;
  waiterName?: string;
  items: OrderItem[];
  status: OrderStatus;
  customerName?: string;
  notes?: string;
  // timestamp puede ser epoch ms o Date
  timestamp: number | Date;
  total: number;
}

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  seats: number;
  // coordenadas de layout (opcional)
  position?: { x: number; y: number };
  // legacy properties que algunas vistas usan
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  shape?: 'rectangle' | 'circle';
}

export type TableStatus = 'available' | 'occupied' | 'ordering' | 'reserved';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'waiter' | 'kitchen';
  name: string;
}

export interface TableMapProps {
  tables: Table[];
  onTableSelect: (tableId: string) => void;
  selectedTable: string | null;
  onUpdateTablePosition?: (tableId: string, position: { x: number; y: number }) => void;
  isEditing?: boolean;
}

