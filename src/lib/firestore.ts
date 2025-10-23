// src/lib/firestore.ts
import { db } from '@/config/firebase';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type DocumentData,
  type QuerySnapshot
} from 'firebase/firestore';
import type { Table, MenuItem, Order } from '@/types/interfaces';

export async function getTables(): Promise<Table[]> {
  const tablesSnap = await getDocs(collection(db, 'tables'));
  return tablesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table));
}

export async function updateTables(tables: Table[]): Promise<void> {
  const batch = writeBatch(db);
  tables.forEach(table => {
    const ref = doc(db, 'tables', table.id);
    batch.set(ref, table);
  });
  await batch.commit();
}

export async function getTableLayout(): Promise<Table[]> {
  const q = query(collection(db, 'tables'), orderBy('number'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table));
}

export function subscribeToTables(onUpdate: (tables: Table[]) => void) {
  const q = query(collection(db, 'tables'), orderBy('number'));
  return onSnapshot(q, (snap) => {
    const tables = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table));
    onUpdate(tables);
  });
}