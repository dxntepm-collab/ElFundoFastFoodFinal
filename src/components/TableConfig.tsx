import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { TableMap } from './TableMap';
import { useTableManager } from '../hooks/useTableManager';
import type { Table } from '@/types/interfaces';

interface TableConfigProps {
  onClose: () => void;
}

const TableConfig: React.FC<TableConfigProps> = ({ onClose }) => {
  const [newTable, setNewTable] = useState({
    number: '',
    seats: '',
  });
  const { addTable } = useTableManager();

  const handleAddTable = async () => {
    if (!newTable.number || !newTable.seats) return;

    const tableData: Omit<Table, 'id'> = {
      number: parseInt(newTable.number),
      seats: parseInt(newTable.seats),
      x: 100,
      y: 100,
      width: 80,
      height: 80,
      status: 'available',
      shape: 'rectangle',
  // createdAt is handled by backend hook if needed
    };

    await addTable(tableData);
  setNewTable({ number: '', seats: '' });
  };

  return (
    <div className="p-4 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Configuración de Mesas</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="tableNumber" className="text-sm font-medium">
              Número de Mesa
            </label>
            <Input
              id="tableNumber"
              type="number"
              placeholder="Ej: 1"
              value={newTable.number}
              onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
            />
          </div>
          <div className="flex-1 space-y-2">
            <label htmlFor="capacity" className="text-sm font-medium">
              Capacidad
            </label>
              <Input
              id="capacity"
              type="number"
              placeholder="Ej: 4"
                value={newTable.seats}
                onChange={(e) => setNewTable({ ...newTable, seats: e.target.value })}
            />
          </div>
          <Button onClick={handleAddTable} className="px-6">
            Agregar Mesa
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Mapa de Mesas</h3>
        <p className="text-sm text-gray-500 mb-4">
          Arrastra las mesas para ajustar su posición en el salón
        </p>
        <div className="mb-4">
          <TableMap isEditing={true} tables={[]} onTableSelect={() => {}} selectedTable={null} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose} variant="outline">
          Guardar y Cerrar
        </Button>
      </div>
    </div>
  );
};

export default TableConfig;