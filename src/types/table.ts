export type TableStatus = 'available' | 'occupied' | 'ordering' | 'reserved';

export interface TablePosition {
  x: number;
  y: number;
}

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  position: TablePosition;
  seats: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  customerName?: string;
  notes?: string;
  timestamp: number;
  total: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';