import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase-admin';

async function deleteTables() {
  try {
    const tablesSnap = await getDocs(collection(db, 'tables'));
    console.log(`Found ${tablesSnap.size} tables to delete...`);
    
    for (const table of tablesSnap.docs) {
      await deleteDoc(doc(db, 'tables', table.id));
      console.log(`Deleted table ${table.id}`);
    }
    
    console.log('All tables deleted successfully!');
  } catch (error) {
    console.error('Error deleting tables:', error);
  }
}

deleteTables();