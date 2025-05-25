
'use server';
import type { Timestamp } from 'firebase/firestore';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDoc,
  writeBatch,
  FieldValue,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { RetroItem, RetroItemFormValues, Sprint, RetroItemColor } from '@/types/retro';

const retroItemsCollectionRef = collection(db, 'retroItems');
const sprintsCollectionRef = collection(db, 'sprints');

// Type for data stored in Firestore, includes Timestamps
interface RetroItemDb {
  sprintId?: string; // Optional for old data before migration
  whoAmI: string;
  whatToSay: string;
  actionItems: string;
  color: RetroItemColor;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SprintDb extends Omit<Sprint, 'id' | 'createdAt'> {
  createdAt: Timestamp;
}

// --- Sprint Services ---

export async function addSprint(sprintName: string): Promise<Sprint> {
  const docRef = await addDoc(sprintsCollectionRef, {
    name: sprintName,
    createdAt: serverTimestamp() as FieldValue,
  });
  const newSprintDoc = await getDoc(docRef);
  const data = newSprintDoc.data() as SprintDb;
  return {
    id: newSprintDoc.id,
    name: data.name,
    createdAt: (data.createdAt as Timestamp).toDate(),
  };
}

export async function getSprints(): Promise<Sprint[]> {
  const q = query(sprintsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data() as SprintDb;
    return {
      id: docSnap.id,
      name: data.name,
      createdAt: (data.createdAt as Timestamp).toDate(),
    };
  });
}

export async function deleteSprintAndItems(sprintId: string): Promise<void> {
  if (!sprintId) {
    throw new Error("נדרש מזהה ספרינט כדי למחוק ספרינט.");
  }

  const batch = writeBatch(db);

  // Delete the sprint document
  const sprintDocRef = doc(db, 'sprints', sprintId);
  batch.delete(sprintDocRef);

  // Query and delete all retro items associated with this sprint
  const itemsQuery = query(retroItemsCollectionRef, where('sprintId', '==', sprintId));
  const itemsSnapshot = await getDocs(itemsQuery);
  itemsSnapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  await batch.commit();
}

// --- Retro Item Services ---

export async function getRetroItems(sprintId: string | null): Promise<RetroItem[]> {
  if (!sprintId) {
    return [];
  }
  const q = query(
    retroItemsCollectionRef,
    where('sprintId', '==', sprintId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data() as RetroItemDb; 

    const retroItem: RetroItem = {
      id: docSnap.id,
      sprintId: sprintId, 
      whoAmI: data.whoAmI,
      whatToSay: data.whatToSay,
      actionItems: data.actionItems || '', 
      color: data.color,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp) ? (data.updatedAt as Timestamp).toDate() : (data.createdAt as Timestamp).toDate(),
    };
    return retroItem;
  });
}

export async function addRetroItem(itemData: RetroItemFormValues, sprintId: string): Promise<RetroItem> {
  if (!sprintId) {
    throw new Error("נדרש מזהה ספרינט כדי להוסיף פריט רטרו.");
  }
  const timestamp = serverTimestamp() as FieldValue;
  const docRef = await addDoc(retroItemsCollectionRef, {
    ...itemData,
    sprintId: sprintId,
    createdAt: timestamp,
    updatedAt: timestamp, 
  });

  const now = new Date();
  const newItem: RetroItem = {
    id: docRef.id,
    sprintId: sprintId,
    whoAmI: itemData.whoAmI,
    whatToSay: itemData.whatToSay,
    actionItems: itemData.actionItems || '',
    color: itemData.color,
    createdAt: now,
    updatedAt: now,
  };
  return newItem;
}

export async function updateRetroItem(id: string, itemData: Partial<RetroItemFormValues>): Promise<void> {
  const itemDocRef = doc(db, 'retroItems', id);
  
  const payload: Partial<RetroItemDb> & { updatedAt: FieldValue } = {
    updatedAt: serverTimestamp() as FieldValue,
  };
  if (itemData.whoAmI !== undefined) payload.whoAmI = itemData.whoAmI;
  if (itemData.whatToSay !== undefined) payload.whatToSay = itemData.whatToSay;
  if (itemData.actionItems !== undefined) payload.actionItems = itemData.actionItems;
  if (itemData.color !== undefined) payload.color = itemData.color;

  await updateDoc(itemDocRef, payload);
}

export async function deleteRetroItem(id: string): Promise<void> {
  const itemDocRef = doc(db, 'retroItems', id);
  await deleteDoc(itemDocRef);
}

// --- Migration Services for orphaned items ---
export async function countOrphanedRetroItems(): Promise<number> {
  const allItemsSnapshot = await getDocs(retroItemsCollectionRef);
  let count = 0;
  allItemsSnapshot.forEach((docSnap) => {
    const data = docSnap.data() as Partial<RetroItemDb>;
    if (!data.sprintId) {
      count++;
    }
  });
  return count;
}

export async function assignOrphanedItemsToSprint(sprintId: string): Promise<number> {
  if (!sprintId) {
    throw new Error("נדרש מזהה ספרינט כדי לשייך פריטים יתומים.");
  }
  const allItemsSnapshot = await getDocs(retroItemsCollectionRef);
  const batch = writeBatch(db);
  let updatedCount = 0;
  const timestamp = serverTimestamp() as FieldValue;

  allItemsSnapshot.forEach((docSnap) => {
    const data = docSnap.data() as Partial<RetroItemDb>;
    if (!data.sprintId) {
      const itemRef = doc(db, 'retroItems', docSnap.id);
      batch.update(itemRef, { 
        sprintId: sprintId, 
        updatedAt: timestamp 
      });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
  }
  return updatedCount;
}
