import { useState } from 'react';
import { Table } from '@/types/interfaces';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Minus, Move, Save } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { useNotification } from '@/hooks/useNotification';

interface TableEditorProps {
  tables: Table[];
  onSave: (tables: Table[]) => void;
}

export function TableEditor({ tables = [], onSave }: TableEditorProps) {
  const [editingTables, setEditingTables] = useState<Table[]>(tables);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const { showNotification } = useNotification();

  const addTable = () => {
    const defaultTables: Table[] = [
      // Primera fila (2 mesas)
      { id: `table-${Date.now()}-1`, number: 1, x: 30, y: 15, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-2`, number: 2, x: 70, y: 15, seats: 4, status: 'available' },
      // Segunda fila (4 mesas)
      { id: `table-${Date.now()}-3`, number: 3, x: 20, y: 35, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-4`, number: 4, x: 40, y: 35, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-5`, number: 5, x: 60, y: 35, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-6`, number: 6, x: 80, y: 35, seats: 4, status: 'available' },
      // Tercera fila (1 mesa central)
      { id: `table-${Date.now()}-7`, number: 7, x: 50, y: 55, seats: 4, status: 'available' },
      // Cuarta fila (2 mesas laterales)
      { id: `table-${Date.now()}-8`, number: 8, x: 35, y: 65, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-9`, number: 9, x: 65, y: 65, seats: 4, status: 'available' },
      // Quinta fila (1 mesa central)
      { id: `table-${Date.now()}-10`, number: 10, x: 50, y: 75, seats: 4, status: 'available' },
      // Última fila (2 mesas)
      { id: `table-${Date.now()}-11`, number: 11, x: 35, y: 85, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-12`, number: 12, x: 65, y: 85, seats: 4, status: 'available' },
    ];
    setEditingTables(defaultTables);
  };

  const removeTable = (index: number) => {
    setEditingTables(tables => tables.filter((_, i) => i !== index));
    setSelectedTable(null);
  };

  const updateTablePosition = (index: number, x: number, y: number) => {
    setEditingTables(tables =>
      tables.map((table, i) =>
        i === index ? { ...table, x, y } : table
      )
    );
  };

  const updateTableNumber = (index: number, number: number) => {
    setEditingTables(tables =>
      tables.map((table, i) =>
        i === index ? { ...table, number } : table
      )
    );
  };

  const handleSave = () => {
    onSave(editingTables);
    showNotification('Éxito', 'Configuración de mesas guardada', 'success');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Editor de Mesas</span>
            <Button onClick={addTable} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Mesa
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[400px] border rounded-lg bg-gray-50">
            {editingTables.map((table, index) => (
              <div
                key={table.id}
                className={`absolute p-4 cursor-move bg-white border rounded-lg shadow-sm ${
                  selectedTable === index ? 'ring-2 ring-primary' : ''
                }`}
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '60px',
                  height: '40px'
                }}
                onClick={() => setSelectedTable(index)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                  setSelectedTable(index);
                }}
              >
                <div className="text-center">
                  <span className="font-semibold">Mesa {table.number}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedTable !== null && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Mesa {editingTables[selectedTable].number}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Número de Mesa</label>
                  <Input
                    type="number"
                    value={editingTables[selectedTable].number}
                    onChange={(e) => updateTableNumber(
                      selectedTable,
                      Math.max(1, Number(e.target.value))
                    )}
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-sm">Asientos</label>
                  <Input
                    type="number"
                    value={editingTables[selectedTable].seats}
                    onChange={(e) => setEditingTables(tables =>
                      tables.map((table, i) =>
                        i === selectedTable ? { ...table, seats: Math.max(1, Number(e.target.value)) } : table
                      )
                    )}
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-sm">Posición X (%)</label>
                  <Input
                    type="number"
                    value={editingTables[selectedTable].x}
                    onChange={(e) => updateTablePosition(
                      selectedTable,
                      Math.min(100, Math.max(0, Number(e.target.value))),
                      editingTables[selectedTable].y
                    )}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-sm">Posición Y (%)</label>
                  <Input
                    type="number"
                    value={editingTables[selectedTable].y}
                    onChange={(e) => updateTablePosition(
                      selectedTable,
                      editingTables[selectedTable].x,
                      Math.min(100, Math.max(0, Number(e.target.value)))
                    )}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeTable(selectedTable)}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Eliminar Mesa
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}