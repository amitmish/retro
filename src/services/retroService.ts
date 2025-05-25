
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
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { RetroItem, RetroItemFormValues, Sprint } from '@/types/retro';

const retroItemsCollectionRef = collection(db, 'retroItems');
const sprintsCollectionRef = collection(db, 'sprints');

// Type for data stored in Firestore, includes Timestamps
interface RetroItemDb extends Omit<RetroItem, 'id' | 'createdAt' | 'updatedAt' | 'sprintId'> {
  sprintId?: string; // Made optional to reflect old data that might be missing it
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

interface SprintDb extends Omit<Sprint, 'id' | 'createdAt'> {
  createdAt: Timestamp;
}

// --- Sprint Services ---

export async function addSprint(sprintName: string): Promise<Sprint> {
  const docRef = await addDoc(sprintsCollectionRef, {
    name: sprintName,
    createdAt: serverTimestamp(),
  });
  // To return the full Sprint object, we fetch it after creation to get the serverTimestamp
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

// --- Retro Item Services ---

export async function getRetroItems(sprintId: string | null): Promise<RetroItem[]> {
  if (!sprintId) {
    return []; // Return empty if no sprintId is provided
  }
  const q = query(
    retroItemsCollectionRef,
    where('sprintId', '==', sprintId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data() as RetroItemDb;
    return {
      id: docSnap.id,
      sprintId: data.sprintId!, // Assert sprintId exists for items fetched this way
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined,
    } as RetroItem;
  });
}

export async function addRetroItem(itemData: RetroItemFormValues, sprintId: string): Promise<RetroItem> {
  if (!sprintId) {
    throw new Error("Sprint ID is required to add a retro item.");
  }
  const docRef = await addDoc(retroItemsCollectionRef, {
    ...itemData,
    sprintId: sprintId,
    createdAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    sprintId: sprintId,
    ...itemData,
    actionItems: itemData.actionItems || '',
    createdAt: new Date(), // Placeholder, actual value is server-generated
  } as RetroItem;
}

export async function updateRetroItem(id: string, itemData: Partial<RetroItemFormValues>): Promise<void> {
  const itemDocRef = doc(db, 'retroItems', id);
  await updateDoc(itemDocRef, {
    ...itemData,
    updatedAt: serverTimestamp(),
  });
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
    throw new Error("Sprint ID is required to assign orphaned items.");
  }
  const allItemsSnapshot = await getDocs(retroItemsCollectionRef);
  const batch = writeBatch(db);
  let updatedCount = 0;

  allItemsSnapshot.forEach((docSnap) => {
    const data = docSnap.data() as Partial<RetroItemDb>;
    if (!data.sprintId) {
      const itemRef = doc(db, 'retroItems', docSnap.id);
      batch.update(itemRef, { sprintId: sprintId, updatedAt: serverTimestamp() });
      updatedCount++;
      // Firestore batch can handle up to 500 operations.
      // If more items, this needs to be chunked, but for typical retro boards this should be fine.
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
  }
  return updatedCount;
}
