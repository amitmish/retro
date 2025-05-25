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
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { RetroItem, RetroItemFormValues, Sprint } from '@/types/retro';

const retroItemsCollectionRef = collection(db, 'retroItems');
const sprintsCollectionRef = collection(db, 'sprints');

// Type for data stored in Firestore, includes Timestamps
interface RetroItemDb extends Omit<RetroItem, 'id' | 'createdAt' | 'updatedAt' | 'sprintId'> {
  sprintId: string;
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
      sprintId: data.sprintId,
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
