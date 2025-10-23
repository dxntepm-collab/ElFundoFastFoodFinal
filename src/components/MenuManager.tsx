import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { categories, alitasOptions } from '@/data/mockData';
import { useState } from 'react';
import { useFirestoreMenu } from '@/hooks/useFirestore';
import type { MenuItem, NewMenuItem } from '@/types/menu';

export function MenuManager() {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem } = useFirestoreMenu();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<NewMenuItem>({
    name: '',
    description: '',
    price: 0,
    category: categories[0],
    image: '',
    available: true,
    alitasPrecios: alitasOptions.map(opt => ({
      sabor: opt.sabor,
      precios: { ...opt.precios }
    }))
  });

  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      price: 0,
      category: categories[0],
      image: '',
      available: true,
      alitasPrecios: alitasOptions.map(opt => ({
        sabor: opt.sabor,
        precios: { ...opt.precios }
      }))
    });
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleAddItem = async () => {
    // Allow adding jugos when jugosOpciones.clasico is provided even if newItem.price is 0
    const isJugo = newItem.category === '🧃 JUGOS';
    const hasJugoPrice = !!(newItem.jugosOpciones && (newItem.jugosOpciones.clasico || newItem.jugosOpciones.conLeche));
    if (!newItem.name || !newItem.description || (newItem.price <= 0 && !(isJugo && hasJugoPrice))) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const success = await addMenuItem(newItem);
    if (success) {
      toast.success('Plato agregado correctamente');
      resetForm();
    } else {
      toast.error('Error al agregar el plato');
    }
  };

  const handleUpdateItem = async () => {
    const isJugo = newItem.category === '🧃 JUGOS';
    const hasJugoPrice = !!(newItem.jugosOpciones && (newItem.jugosOpciones.clasico || newItem.jugosOpciones.conLeche));
    if (!editingItem || !newItem.name || !newItem.description || (newItem.price <= 0 && !(isJugo && hasJugoPrice))) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const success = await updateMenuItem(editingItem.id, newItem);
    if (success) {
      toast.success('Plato actualizado correctamente');
      resetForm();
    } else {
      toast.error('Error al actualizar el plato');
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (window.confirm(`¿Estás seguro de eliminar "${item.name}"?`)) {
      const success = await deleteMenuItem(item.id);
      if (success) {
        toast.success('Plato eliminado correctamente');
      } else {
        toast.error('Error al eliminar el plato');
      }
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    const maybe = item as unknown as Record<string, unknown>;
    const jugosOpciones = 'jugosOpciones' in maybe ? (maybe.jugosOpciones as MenuItem['jugosOpciones']) : undefined;
    const sabores = 'sabores' in maybe ? (maybe.sabores as string[]) : undefined;

    // Build a NewMenuItem object (no id) using item values and sensible defaults
    setNewItem({
      name: item.name ?? '',
      description: item.description ?? '',
      price: item.price ?? 0,
      category: item.category ?? categories[0],
      image: item.image ?? '',
      available: item.available ?? true,
      // include optional fields only in the object shape expected by NewMenuItem
      jugosOpciones: jugosOpciones ?? undefined,
      sabores: sabores ?? undefined,
      alitasPrecios: item.alitasPrecios ?? alitasOptions.map(opt => ({
        sabor: opt.sabor,
        precios: { ...opt.precios }
      }))
    } as NewMenuItem);
    setIsAddingItem(true);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Menú</h2>
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogTrigger asChild>
            <Button className="btn-fundo" onClick={() => setIsAddingItem(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Plato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Plato' : 'Agregar Nuevo Plato'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Modifica los datos del plato' : 'Completa la información del nuevo plato'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Plato</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Ej: Hamburguesa Clásica"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe los ingredientes y características"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio (S/)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.50"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {newItem.category === '🧃 JUGOS' && (
                <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200">
                  <h4 className="font-semibold text-green-700 mb-2">Opciones y precios de jugos</h4>
                  <div className="mb-2 grid grid-cols-2 gap-2 items-center">
                    <span className="font-medium text-gray-700">Clásico</span>
                    <Input
                      type="number"
                      step="0.50"
                      min="0"
                      value={newItem.jugosOpciones?.clasico ?? ''}
                      onChange={e => setNewItem({
                        ...newItem,
                        jugosOpciones: {
                          ...newItem.jugosOpciones,
                          clasico: parseFloat(e.target.value)
                        }
                      })}
                      className="rounded-xl"
                      placeholder="Clásico"
                    />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-medium text-gray-700">¿Ofrecer opción con leche?</span>
                    <Switch
                      checked={!!newItem.jugosOpciones?.conLeche}
                      onCheckedChange={checked => {
                        setNewItem({
                          ...newItem,
                          jugosOpciones: {
                            ...newItem.jugosOpciones,
                            conLeche: checked ? (newItem.jugosOpciones?.conLeche ?? 0) : undefined
                          }
                        });
                      }}
                    />
                  </div>
                  {newItem.jugosOpciones?.conLeche !== undefined && (
                    <div className="mb-2 grid grid-cols-2 gap-2 items-center">
                      <span className="font-medium text-gray-700">Con leche</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        value={newItem.jugosOpciones?.conLeche ?? ''}
                        onChange={e => setNewItem({
                          ...newItem,
                          jugosOpciones: {
                            ...newItem.jugosOpciones,
                            conLeche: parseFloat(e.target.value)
                          }
                        })}
                        className="rounded-xl"
                        placeholder="Con leche"
                      />
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">Edita los precios para jugos con leche solo si corresponde.</div>
                </div>
              )}

              {newItem.category === '🍗 ALITAS (salsas a elegir)' && (
                <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200 space-y-6">
                  <h4 className="font-semibold text-orange-700 mb-2">Sabores de alitas</h4>
                  {(newItem.sabores || []).map((sabor, idx) => (
                    <div key={sabor + '-' + idx} className="mb-2 flex gap-2 items-center">
                      <Input
                        value={sabor}
                        onChange={e => {
                          const updated = (newItem.sabores || []).map((s, i) => i === idx ? e.target.value : s);
                          setNewItem({ ...newItem, sabores: updated });
                        }}
                        className="rounded-xl"
                        placeholder="Sabor"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const updated = (newItem.sabores || []).filter((_, i) => i !== idx);
                          setNewItem({ ...newItem, sabores: updated });
                        }}
                      >Eliminar</Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNewItem({ ...newItem, sabores: [...(newItem.sabores || []), ''] })}
                  >Agregar sabor</Button>
                  <div className="text-xs text-gray-500 mt-2">Edita la lista de sabores disponibles para las alitas. Las unidades y precios se eligen en el panel del mesero.</div>
                </div>
              )}

              <div>
                <Label htmlFor="image">URL de Imagen</Label>
                <Input
                  id="image"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={newItem.available}
                  onCheckedChange={(checked) => setNewItem({ ...newItem, available: checked })}
                />
                <Label htmlFor="available">Disponible</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={editingItem ? handleUpdateItem : handleAddItem} 
                  className="flex-1 btn-fundo"
                >
                  {editingItem ? 'Actualizar' : 'Agregar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {menu.map((item) => (
          <Card key={item.id} className="product-card">
            <div className="p-4">
              <div className="flex gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <Badge variant={item.available ? "default" : "secondary"}>
                      {item.available ? 'Disponible' : 'No disponible'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-orange-600">
                      S/ {item.price.toFixed(2)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(item)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteItem(item)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}