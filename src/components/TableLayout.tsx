import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChefHat, CheckCircle, Clock, Users, Move, Plus, Trash } from 'lucide-react';
import { Table } from '@/types/interfaces';
import { toast } from 'sonner';

interface TableLayoutProps {
  onTableSelect: (table: Table) => void;
  selectedTable?: Table | null;
  isAdmin?: boolean;
  // optional external tables (e.g. from Firestore) to render and control
  tables?: Table[];
  // called when the full tables array changes (add/delete/status)
  onTablesChange?: (tables: Table[]) => void;
  // called when a single table position is updated (id, {x,y})
  onUpdateTablePosition?: (id: string, position: { x: number; y: number }) => void;
}

const defaultTables: Table[] = [
  { id: '1', number: 1, seats: 4, x: 50, y: 50, width: 80, height: 80, status: 'available', shape: 'rectangle' },
  { id: '2', number: 2, seats: 2, x: 200, y: 50, width: 60, height: 60, status: 'occupied', shape: 'circle' },
  { id: '3', number: 3, seats: 6, x: 350, y: 50, width: 100, height: 80, status: 'ordering', shape: 'rectangle' },
  { id: '4', number: 4, seats: 4, x: 50, y: 200, width: 80, height: 80, status: 'available', shape: 'rectangle' },
  { id: '5', number: 5, seats: 8, x: 200, y: 200, width: 120, height: 80, status: 'reserved', shape: 'rectangle' },
  { id: '6', number: 6, seats: 2, x: 380, y: 200, width: 60, height: 60, status: 'available', shape: 'circle' },
];

const TableLayout: React.FC<TableLayoutProps> = ({ onTableSelect, selectedTable, isAdmin = false, tables: externalTables, onTablesChange, onUpdateTablePosition }) => {
  const [localTables, setLocalTables] = useState<Table[]>(externalTables ?? defaultTables);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTable, setNewTable] = useState({
    number: 0,
    seats: 4,
    shape: 'rectangle' as 'rectangle' | 'circle'
  });
  const layoutRef = useRef<HTMLDivElement>(null);

  // keep local state in sync with external tables when provided
  useEffect(() => {
    if (externalTables) setLocalTables(externalTables);
  }, [externalTables]);

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600';
      case 'occupied': return 'bg-red-500 hover:bg-red-600';
      case 'ordering': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'reserved': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Ocupada';
      case 'ordering': return 'Ordenando';
      case 'reserved': return 'Reservada';
      default: return 'Desconocido';
    }
  };

  const handleTableClick = (table: Table) => {
    if (isConfigMode) return;
    onTableSelect(table);
    toast.success(`Mesa ${table.number} seleccionada`);
  };

  const handleMouseDown = (e: React.MouseEvent, table: Table) => {
    if (!isConfigMode) return;
    
    e.preventDefault();
    const rect = layoutRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggedTable(table);
    setDragOffset({
      x: e.clientX - rect.left - table.x,
      y: e.clientY - rect.top - table.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedTable || !isConfigMode) return;

    const rect = layoutRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = Math.max(0, Math.min(rect.width - draggedTable.width, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(rect.height - draggedTable.height, e.clientY - rect.top - dragOffset.y));

    setLocalTables(prev => prev.map(table => 
      table.id === draggedTable.id 
        ? { ...table, x: newX, y: newY }
        : table
    ));
  };

  const handleMouseUp = () => {
    // persist single-table position update if provided
    if (draggedTable && onUpdateTablePosition) {
      const updated = localTables.find(t => t.id === draggedTable.id);
      if (updated) {
        try {
          onUpdateTablePosition(draggedTable.id, { x: updated.x, y: updated.y });
        } catch (err) {
          // ignore callback errors here
          // caller hook may show notifications
        }
      }
    }

    setDraggedTable(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const changeTableStatus = (tableId: string, newStatus: Table['status']) => {
    const updated = localTables.map(table => 
      table.id === tableId ? { ...table, status: newStatus } : table
    );
    setLocalTables(updated);
    onTablesChange?.(updated);
    toast.success('Estado de mesa actualizado');
  };

  const addNewTable = () => {
  const maxNumber = Math.max(...localTables.map(t => t.number), 0);
    const newTableData: Table = {
      id: Date.now().toString(),
      number: newTable.number || maxNumber + 1,
      seats: newTable.seats,
      x: 100,
      y: 100,
      width: newTable.shape === 'circle' ? 32 : 60,
      height: newTable.shape === 'circle' ? 32 : 40,
      status: 'available',
      shape: newTable.shape
    };

    const updated = [...localTables, newTableData];
    setLocalTables(updated);
    onTablesChange?.(updated);
    setShowAddDialog(false);
    setNewTable({ number: 0, seats: 4, shape: 'rectangle' });
    toast.success('Mesa agregada exitosamente');
  };

  const deleteTable = (tableId: string) => {
    const updated = localTables.filter(table => table.id !== tableId);
    setLocalTables(updated);
    onTablesChange?.(updated);
    toast.success('Mesa eliminada');
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Distribución del Restaurante
          </CardTitle>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Switch
                checked={isConfigMode}
                onCheckedChange={setIsConfigMode}
                id="config-mode"
              />
              <Label htmlFor="config-mode" className="text-sm">
                Modo Configuración
              </Label>
              {isConfigMode && (
                <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Mesa
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge className="bg-green-500">Disponible</Badge>
          <Badge className="bg-red-500">Ocupada</Badge>
          <Badge className="bg-yellow-500">Ordenando</Badge>
          <Badge className="bg-blue-500">Reservada</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div 
          ref={layoutRef}
          className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-dashed border-orange-200 overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isConfigMode ? 'crosshair' : 'default' }}
        >
          {localTables.map((table) => (
            <div
              key={table.id}
              className={`absolute flex items-center justify-center text-white font-bold text-sm transition-all duration-200 cursor-pointer select-none ${
                table.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
              } ${getStatusColor(table.status)} ${
                selectedTable?.id === table.id ? 'ring-4 ring-orange-400 scale-110' : ''
              } ${isConfigMode ? 'hover:scale-105' : ''}`}
              style={{
                left: table.x,
                top: table.y,
                width: table.width,
                height: table.height,
              }}
              onMouseDown={(e) => handleMouseDown(e, table)}
              onClick={() => handleTableClick(table)}
                title={"Mesa " + table.number + " - " + table.seats + " asientos - " + getStatusText(table.status)}
            >
              <div className="flex flex-col items-center justify-center w-full h-full">
                <img src="/assets/mesa-icon.svg" alt={`Mesa ${table.number}`} className="w-12 h-12 mb-1 select-none pointer-events-none" draggable={false} />
                <div className="text-xs font-bold text-white drop-shadow">Mesa {table.number}</div>
                <div className="text-xs flex items-center justify-center gap-1 text-white">
                  <Users className="h-3 w-3" />
                  {table.seats}
                </div>
              </div>

                  {isConfigMode && (
                <div className="absolute -top-2 -right-2 flex gap-1">
                  <Select 
                    value={table.status} 
                    onValueChange={(value: Table['status']) => changeTableStatus(table.id, value)}
                  >
                    <SelectTrigger className="h-6 w-6 px-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="occupied">Ocupada</SelectItem>
                      <SelectItem value="ordering">Ordenando</SelectItem>
                      <SelectItem value="reserved">Reservada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-6 w-6 p-1"
                    onClick={() => deleteTable(table.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {isConfigMode && (
            <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg text-sm">
              <p className="font-semibold text-orange-600">Modo Configuración Activo:</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Arrastra las mesas para reubicarlas</li>
                <li>• Usa los controles para cambiar estados</li>
                <li>• Agrega o elimina mesas según necesites</li>
              </ul>
            </div>
          )}
        </div>

        {selectedTable && !isConfigMode && (
          <div className="p-4 bg-orange-50 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Mesa {selectedTable.number}</h3>
                <p className="text-sm text-gray-600">
                  {selectedTable.seats} asientos
                </p>
              </div>
              <Badge className={getStatusColor(selectedTable.status)}>
                {getStatusText(selectedTable.status)}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Mesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Número de Mesa</Label>
              <Input
                type="number"
                value={newTable.number}
                onChange={(e) => setNewTable(prev => ({ ...prev, number: parseInt(e.target.value) || 0 }))}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacidad</Label>
              <Input
                type="number"
                value={newTable.seats}
                onChange={(e) => setNewTable(prev => ({ ...prev, seats: parseInt(e.target.value) || 1 }))}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Forma</Label>
              <Select 
                value={newTable.shape}
                onValueChange={(value: 'rectangle' | 'circle') => setNewTable(prev => ({ ...prev, shape: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">Rectangular</SelectItem>
                  <SelectItem value="circle">Circular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addNewTable} className="w-full">
              Agregar Mesa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TableLayout;