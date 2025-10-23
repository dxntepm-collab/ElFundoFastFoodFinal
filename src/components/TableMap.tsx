import { motion } from 'framer-motion';
import { useState } from 'react';
import { Table, TableStatus } from '@/types/interfaces';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface TableMapProps {
  tables: Table[];
  // now pass the whole Table object to the handler so callers keep consistent shape
  onTableSelect: (table: Table) => void;
  selectedTable: Table | null;
  onUpdateTablePosition?: (tableId: string, position: { x: number; y: number }) => void;
  isEditing?: boolean;
}

export const TableMap = ({ tables, onTableSelect, selectedTable, onUpdateTablePosition, isEditing = false }: TableMapProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const getStatusColor = (status: TableStatus): string => {
    switch (status) {
      case 'available':
        return 'bg-green-100 hover:bg-green-200 border-green-500';
      case 'occupied':
        return 'bg-red-100 hover:bg-red-200 border-red-500';
      case 'ordering':
        return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-500';
      case 'reserved':
        return 'bg-blue-100 hover:bg-blue-200 border-blue-500';
      default:
        return 'bg-gray-100 hover:bg-gray-200 border-gray-500';
    }
  };

  const getStatusText = (status: TableStatus): string => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupada';
      case 'ordering':
        return 'Ordenando';
      case 'reserved':
        return 'Reservada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px] border rounded-lg bg-white overflow-visible p-4" style={{
      position: 'relative',
      backgroundImage: `linear-gradient(to right, #ececec 1px, transparent 1px), linear-gradient(to bottom, #ececec 1px, transparent 1px)`,
      backgroundSize: '60px 60px'
    }}>
      {tables.map((table) => (
        <motion.div
          key={table.id}
          className={cn(
            'absolute cursor-pointer w-16 h-12 sm:w-20 sm:h-16 md:w-24 md:h-20 lg:w-28 lg:h-24 rounded-lg border-2 flex flex-col items-center justify-center',
            getStatusColor(table.status),
            selectedTable?.id === table.id && 'ring-2 ring-blue-500',
            isDragging && 'cursor-grabbing'
          )}
          initial={false}
          style={{
            left: `${table.x}%`,
            top: `${table.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          drag={isEditing}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0}
          onDragEnd={(e: any) => {
            setIsDragging(false);
            if (onUpdateTablePosition && e.target instanceof HTMLDivElement) {
              const container = e.target.parentElement;
              const rect = container.getBoundingClientRect();
              const element = e.target.getBoundingClientRect();
              const x = ((element.left + element.width/2 - rect.left) / rect.width) * 100;
              const y = ((element.top + element.height/2 - rect.top) / rect.height) * 100;
              onUpdateTablePosition(table.id, {
                x: Math.max(0, Math.min(100, x)),
                y: Math.max(0, Math.min(100, y))
              });
            }
          }}
          onClick={() => !isDragging && onTableSelect(table)}
        >
          <Button
            variant="ghost"
            className="h-full w-full flex flex-col items-center justify-center p-0"
          >
            <img src="/assets/mesa-icon.svg" alt={`Mesa ${table.number}`} className="w-6 h-6 sm:w-8 sm:h-8 mb-1" />
            <span className="text-sm sm:text-base font-bold leading-none">M{table.number}</span>
            <p className="text-xs sm:text-sm text-muted-foreground leading-none block">{getStatusText(table.status)}</p>
          </Button>
        </motion.div>
      ))}
    </div>
  );
};