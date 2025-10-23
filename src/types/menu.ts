// Menu related types
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  available?: boolean;
  sabores?: string[];
  jugosOpciones?: {
    clasico?: number;
    conLeche?: number;
  };
  alitasPrecios?: Array<{
    sabor: string;
    precios: {
      '6 und'?: number;
      '12 und'?: number;
      '16 und'?: number;
    };
  }>;
}

export type NewMenuItem = Omit<MenuItem, 'id'> & {
  description: string;
  category: string;
  image: string;
  available: boolean;
};