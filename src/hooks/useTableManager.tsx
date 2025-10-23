import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useNotification } from './useNotification';
import { Table } from '@/types/interfaces';

export const useTableManager = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const q = query(collection(db, 'tables'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tableData: Table[] = [];
      snapshot.forEach((doc) => {
        tableData.push({ 
          ...doc.data() as Omit<Table, 'id'>, 
          id: doc.id 
        });
      });
      setTables(tableData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tables:", error);
      showNotification("Error", "Error al cargar las mesas", 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTable = async (tableData: Omit<Table, 'id'>) => {
    try {
      await addDoc(collection(db, 'tables'), {
        ...tableData,
        createdAt: Timestamp.fromDate(new Date())
      });
      showNotification("Éxito", "Mesa agregada correctamente", 'success');
    } catch (error) {
      console.error("Error adding table:", error);
      showNotification("Error", "Error al agregar la mesa", 'error');
      throw error;
    }
  };

  const updateTable = async (id: string, updates: Partial<Table>) => {
    try {
      await updateDoc(doc(db, 'tables', id), updates);
      showNotification("Éxito", "Mesa actualizada correctamente", 'success');
    } catch (error) {
      console.error("Error updating table:", error);
      showNotification("Error", "Error al actualizar la mesa", 'error');
      throw error;
    }
  };

  const deleteTable = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tables', id));
      showNotification("Éxito", "Mesa eliminada correctamente", 'success');
    } catch (error) {
      console.error("Error deleting table:", error);
      showNotification("Error", "Error al eliminar la mesa", 'error');
      throw error;
    }
  };

  const updateTableStatus = async (id: string, status: Table['status']) => {
    try {
      await updateDoc(doc(db, 'tables', id), { 
        status,
        updatedAt: Timestamp.fromDate(new Date())
      });
      showNotification("Éxito", "Estado de la mesa actualizado", 'success');
    } catch (error) {
      console.error("Error updating table status:", error);
      showNotification("Error", "Error al actualizar el estado de la mesa", 'error');
      throw error;
    }
  };

  return {
    tables,
    loading,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus
  };
};