import type { MenuItem, Order } from '@/types/interfaces';

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'waiter' | 'kitchen';
  name: string;
}

export const mockUsers: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
  { id: '2', username: 'mesero1', password: 'mesero123', role: 'waiter', name: 'Carlos Mesero' },
  { id: '3', username: 'cocina1', password: 'cocina123', role: 'kitchen', name: 'Ana Cocinera' },
];

export const mockMenu: MenuItem[] = [
  {
    id: '10',
    name: 'Alitas de 6 unidades',
    description: 'Alitas con salsa a elección',
    price: 20.00,
    category: '🍗 ALITAS (salsas a elegir)',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300',
    available: true,
    alitasPrecios: [
      { sabor: 'Al Panko', precios: { '6 und': 20 } },
      { sabor: 'BBQ', precios: { '6 und': 20 } },
      { sabor: 'Broaster', precios: { '6 und': 20 } },
      { sabor: 'Acevichadas', precios: { '6 und': 20 } },
      { sabor: 'Picantes', precios: { '6 und': 20 } },
      { sabor: 'Maracumango', precios: { '6 und': 20 } },
      { sabor: 'Anticucheras', precios: { '6 und': 20 } },
      { sabor: 'Maracuya', precios: { '6 und': 20 } },
      { sabor: 'Tocino', precios: { '6 und': 20 } }
    ]
  },
  {
    id: '11',
    name: 'Alitas de 12 unidades',
    description: 'Alitas con salsa a elección',
    price: 38.00,
    category: '🍗 ALITAS (salsas a elegir)',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300',
    available: true,
    alitasPrecios: [
      { sabor: 'Al Panko', precios: { '12 und': 38 } },
      { sabor: 'BBQ', precios: { '12 und': 38 } },
      { sabor: 'Broaster', precios: { '12 und': 38 } },
      { sabor: 'Acevichadas', precios: { '12 und': 38 } },
      { sabor: 'Picantes', precios: { '12 und': 38 } },
      { sabor: 'Maracumango', precios: { '12 und': 38 } },
      { sabor: 'Anticucheras', precios: { '12 und': 38 } },
      { sabor: 'Maracuya', precios: { '12 und': 38 } },
      { sabor: 'Tocino', precios: { '12 und': 38 } }
    ]
  },
  {
    id: '12',
    name: 'Ronda El Fundo (16 und)',
    description: 'Alitas con salsa a elección',
    price: 49.00,
    category: '🍗 ALITAS (salsas a elegir)',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300',
    available: true,
    alitasPrecios: [
      { sabor: 'Al Panko', precios: { '16 und': 49 } },
      { sabor: 'BBQ', precios: { '16 und': 49 } },
      { sabor: 'Broaster', precios: { '16 und': 49 } },
      { sabor: 'Acevichadas', precios: { '16 und': 49 } },
      { sabor: 'Picantes', precios: { '16 und': 49 } },
      { sabor: 'Maracumango', precios: { '16 und': 49 } },
      { sabor: 'Anticucheras', precios: { '16 und': 49 } },
      { sabor: 'Maracuya', precios: { '16 und': 49 } },
      { sabor: 'Tocino', precios: { '16 und': 49 } }
    ]
  },
  {
    id: '9',
    name: 'Jugo de Papaya',
    description: 'Jugo fresco de papaya, opción con leche o sin leche',
    price: 7.00,
    category: '🧃 JUGOS',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300',
    available: true,
    jugosOpciones: {
  clasico: 7.00,
  conLeche: 8.00
    }
  },
  {
    id: '1',
    name: 'Lomo Saltado',
    description: 'Clásico peruano con papas fritas y arroz',
    price: 25.90,
    category: 'Platos Principales',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
    available: true
  },
  {
    id: '2',
    name: 'Ceviche Mixto',
    description: 'Pescado y mariscos frescos en leche de tigre',
    price: 28.90,
    category: 'Entradas',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300',
    available: true
  },
  {
    id: '3',
    name: 'Anticuchos',
    description: 'Brochetas de corazón marinado a la parrilla',
    price: 18.90,
    category: 'Entradas',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300',
    available: true
  },
  {
    id: '4',
    name: 'Ají de Gallina',
    description: 'Pollo deshilachado en crema de ají amarillo',
    price: 22.90,
    category: 'Platos Principales',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300',
    available: true
  },
  {
    id: '5',
    name: 'Pisco Sour',
    description: 'Cóctel tradicional peruano',
    price: 15.90,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300',
    available: true
  },
  {
    id: '6',
    name: 'Chicha Morada',
    description: 'Bebida tradicional de maíz morado',
    price: 8.90,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300',
    available: true
  },
  {
    id: '7',
    name: 'Suspiro Limeño',
    description: 'Postre tradicional con manjar y merengue',
    price: 12.90,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300',
    available: true
  },
  {
    id: '8',
    name: 'Mazamorra Morada',
    description: 'Postre de maíz morado con frutas',
    price: 10.90,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300',
    available: true
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    items: [
      { menuItem: mockMenu[0], quantity: 2 },
      { menuItem: mockMenu[4], quantity: 1 }
    ],
    total: 67.70,
    status: 'pending',
    waiterName: 'Carlos Mesero',
    tableNumber: 5,
    timestamp: new Date()
  },
  {
    id: 'ORD-002',
    items: [
      { menuItem: mockMenu[1], quantity: 1 },
      { menuItem: mockMenu[5], quantity: 2 }
    ],
    total: 46.70,
    status: 'preparing',
    waiterName: 'Carlos Mesero',
    tableNumber: 3,
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  }
];

export const categories = [
  '🍗 ALITAS (salsas a elegir)',
  '🍕 PIZZAS FAMILIARES',
  '🍔 HAMBURGUESAS',
  '🍜 TOQUE ORIENTAL',
  '🍟 SALCHIPAPAS',
  '🧃 JUGOS',
  '🥤 BEBIDAS',
  '🍹 TRAGOS'
];

export const alitasOptions = [
  // Eliminado por solicitud
];