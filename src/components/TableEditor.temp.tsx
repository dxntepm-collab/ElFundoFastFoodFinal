import { useState } from 'react';
import { Table } from '@/types/interfaces';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Minus, Save } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';

interface TableEditorProps {
  tables: Table[];
  onSave: (tables: Table[]) => void;
}

export function TableEditor({ tables = [], onSave }: TableEditorProps) {
  const [editingTables, setEditingTables] = useState<Table[]>(tables);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const { showNotification } = useNotification();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const addTable = () => {
    const defaultTables: Table[] = [
      { id: `table-${Date.now()}-1`, number: 1, x: 30, y: 15, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-2`, number: 2, x: 70, y: 15, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-3`, number: 3, x: 20, y: 35, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-4`, number: 4, x: 40, y: 35, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-5`, number: 5, x: 60, y: 35, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-6`, number: 6, x: 80, y: 35, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-7`, number: 7, x: 50, y: 55, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-8`, number: 8, x: 35, y: 65, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-9`, number: 9, x: 65, y: 65, seats: 4, status: 'available' },
      { id: `table-${Date.now()}-10`, number: 10, x: 50, y: 75, seats: 4, status: 'available' },
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
    <div className={`min-h-screen ${isFullScreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}>
      <Card className="h-full">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>Editor de Mesas</CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setIsFullScreen(!isFullScreen)} 
                size="sm" 
                variant="outline"
                className="flex-1 sm:flex-none text-sm"
              >
                {isFullScreen ? 'Salir' : 'Pantalla Completa'}
              </Button>
              <Button 
                onClick={addTable} 
                size="sm" 
                variant="outline"
                className="flex-1 sm:flex-none text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Mesa
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-6 relative">
          <div 
            className={`relative ${isFullScreen ? 'h-[80vh]' : 'h-[500px] sm:h-[700px]'} border rounded-lg bg-white touch-none p-4`}
            style={{
              backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {editingTables.map((table, index) => (
              <div
                key={table.id}
                className={`absolute cursor-move bg-white border-2 rounded-xl shadow-md transition-all ${
                  selectedTable === index ? 'ring-2 ring-orange-500 scale-110 z-10 border-orange-500' : 'border-gray-300 hover:border-orange-300'
                }`}
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '120px',
                  height: '80px',
                  backgroundColor: selectedTable === index ? '#fff' : '#f8fafc'
                }}
                onClick={() => setSelectedTable(index)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                  setSelectedTable(index);
                }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center justify-center w-8 h-8 mb-1 rounded-full bg-orange-100 border border-orange-200">
                    <span className="font-bold text-orange-600">{table.number}</span>
                  </div>
                  <span className="text-xs text-gray-600">Mesa {table.number}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedTable !== null && (
            <div className="fixed inset-x-0 bottom-0 sm:static bg-white p-4 sm:p-6 rounded-t-xl sm:rounded-lg shadow-lg border-t sm:border mt-4 z-50 max-h-[80vh] sm:max-h-none overflow-y-auto">
              <div className="sticky top-0 bg-white pb-4 border-b mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center">
                    <span className="font-bold text-xl text-orange-600">{editingTables[selectedTable].number}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Mesa {editingTables[selectedTable].number}</h4>
                    <p className="text-sm text-gray-500">Configura los detalles de la mesa</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={() => setSelectedTable(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium block mb-2">Número de Mesa</label>
                  <Input
                    type="number"
                    value={editingTables[selectedTable].number}
                    onChange={(e) => updateTableNumber(
                      selectedTable,
                      Math.max(1, Number(e.target.value))
                    )}
                    min="1"
                    className="text-lg h-12"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Asientos</label>
                  <Input
                    type="number"
                    value={editingTables[selectedTable].seats}
                    onChange={(e) => setEditingTables(tables =>
                      tables.map((table, i) =>
                        i === selectedTable ? { ...table, seats: Math.max(1, Number(e.target.value)) } : table
                      )
                    )}
                    min="1"
                    className="text-lg h-12"
                  />
                </div>

                <div>
                  <h5 className="font-medium mb-4">Posición de la Mesa</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Posición X (%)</label>
                      <Input
                        type="range"
                        value={editingTables[selectedTable].x}
                        onChange={(e) => updateTablePosition(
                          selectedTable,
                          Math.min(100, Math.max(0, Number(e.target.value))),
                          editingTables[selectedTable].y
                        )}
                        min="0"
                        max="100"
                        className="h-12"
                      />
                      <div className="text-center mt-2 text-sm text-gray-600">
                        {Math.round(editingTables[selectedTable].x)}%
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">Posición Y (%)</label>
                      <Input
                        type="range"
                        value={editingTables[selectedTable].y}
                        onChange={(e) => updateTablePosition(
                          selectedTable,
                          editingTables[selectedTable].x,
                          Math.min(100, Math.max(0, Number(e.target.value)))
                        )}
                        min="0"
                        max="100"
                        className="h-12"
                      />
                      <div className="text-center mt-2 text-sm text-gray-600">
                        {Math.round(editingTables[selectedTable].y)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <Button
                    variant="destructive"
                    size="lg"
                    className="flex-1"
                    onClick={() => removeTable(selectedTable)}
                  >
                    <Minus className="w-5 h-5 mr-2" />
                    Eliminar Mesa
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="flex-1"
                    onClick={() => setSelectedTable(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave} className="w-full sm:w-auto" size="lg">
              <Save className="w-5 h-5 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}