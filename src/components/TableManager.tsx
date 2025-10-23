import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TableEditor } from './TableEditor';
import { useNotification } from '@/hooks/useNotification';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import type { Table } from '@/types/interfaces';

export function TableManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadTables = async () => {
      try {
        const tablesSnap = await getDocs(collection(db, 'tables'));
        const loadedTables: Table[] = [];
        tablesSnap.forEach(doc => {
          loadedTables.push({ id: doc.id, ...doc.data() } as Table);
        });
        setTables(loadedTables);
      } catch (error) {
        console.error('Error al cargar mesas:', error);
        showNotification('Error', 'No se pudieron cargar las mesas', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, [showNotification]);

  const saveTables = async (updatedTables: Table[]) => {
    try {
      const batch = writeBatch(db);
      updatedTables.forEach(table => {
        const ref = doc(db, 'tables', table.id);
        batch.set(ref, table);
      });
      await batch.commit();
      setTables(updatedTables);
      showNotification('Éxito', 'Configuración de mesas actualizada', 'success');
    } catch (error) {
      console.error('Error al guardar mesas:', error);
      showNotification('Error', 'No se pudo guardar la configuración', 'error');
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl">Configuración de Mesas</CardTitle>
        <CardDescription className="text-base">
          Administra la disposición y configuración de las mesas del restaurante.
          Arrastra las mesas para cambiar su posición o usa los controles para ajustes precisos.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando mesas...</p>
          </div>
        ) : (
          <TableEditor
            tables={tables}
            onSave={saveTables}
          />
        )}
      </CardContent>
    </Card>
  );
}