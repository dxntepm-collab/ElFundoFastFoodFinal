import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Textarea } from "./textarea"
import { MenuItem } from "@/types/interfaces"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface OrderDialogProps {
  item?: MenuItem | null
  open: boolean
  onClose: () => void
  onAdd: (quantity: number, notes: string, options?: { type?: string; flavor?: string }) => void
}

export function OrderDialog({ item, open, onClose, onAdd }: OrderDialogProps) {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [juiceType, setJuiceType] = useState<"clasico" | "conLeche" | undefined>(
    item.jugosOpciones ? "clasico" : undefined
  )
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(
    item.sabores ? [] : []
  )
  // Lógica para máximo de sabores según cantidad
  let maxFlavors = 3;
  if (item.category?.toLowerCase().includes('alitas')) {
    if (quantity === 6 || quantity === 12) maxFlavors = 3;
    else if (item.name.toLowerCase().includes('ronda') || quantity >= 16) maxFlavors = 4;
  }

  const handleSubmit = () => {
    onAdd(quantity, notes, {
      type: juiceType,
      // pasar múltiples sabores (si aplica) como string separada por comas en el nombre
      flavor: selectedFlavors.join(', ')
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {item.jugosOpciones && (
            <div className="grid gap-2">
              <Label>Tipo de jugo</Label>
              <RadioGroup
                value={juiceType}
                onValueChange={(v) => setJuiceType(v as "clasico" | "conLeche")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="clasico" id="clasico" />
                  <Label htmlFor="clasico">
                    Clásico (S/ {Number(item.jugosOpciones?.clasico || 0).toFixed(2)})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="conLeche" id="conLeche" />
                  <Label htmlFor="conLeche">
                    Con Leche (S/ {Number(item.jugosOpciones?.conLeche || 0).toFixed(2)})
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {item.sabores && (
            <div className="grid gap-2">
              <Label>Sabor(es) (selecciona 1 o más)</Label>
              <div className="flex flex-wrap gap-2">
                {item.sabores.map((sabor) => {
                  const selected = selectedFlavors.includes(sabor);
                  const disabled = !selected && selectedFlavors.length >= maxFlavors;
                  return (
                    <button
                      key={sabor}
                      type="button"
                      onClick={() => {
                        if (selected) setSelectedFlavors(prev => prev.filter(s => s !== sabor));
                        else if (!disabled && selectedFlavors.length < maxFlavors) setSelectedFlavors(prev => [...prev, sabor]);
                      }}
                      className={`px-3 py-1 rounded-full border ${selected ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                      disabled={disabled}
                    >
                      {sabor}
                    </button>
                  )
                })}
                {selectedFlavors.length >= maxFlavors && (
                  <div className="text-xs text-orange-600 self-center font-semibold">Máx {maxFlavors} sabores</div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Cantidad</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
          </div>

          <div className="grid gap-2">
            <Label>Notas adicionales</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin hielo, muy dulce, etc."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Agregar al pedido</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}