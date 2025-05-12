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
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { RetroItem, RetroItemFormValues, RetroItemColor } from '@/types/retro';

const retroItemsCollectionRef = collection(db, 'retroItems');

// Type for data stored in Firestore, includes Timestamps
interface RetroItemDb extends Omit<RetroItem, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Type for data returned from service, with Date objects
interface RetroItemWithDate extends Omit<RetroItem, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt?: Date;
}


export async function getRetroItems(): Promise<RetroItem[]> {
  const q = query(retroItemsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data() as RetroItemDb;
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : undefined,
    } as RetroItem; // Cast to RetroItem which expects Date or string for timestamps
  });
}

export async function addRetroItem(itemData: RetroItemFormValues): Promise<RetroItem> {
  const docRef = await addDoc(retroItemsCollectionRef, {
    ...itemData,
    createdAt: serverTimestamp(),
  });
  // For immediate return, we might not have the server timestamp converted yet.
  // This is a simplified return; consider re-fetching or constructing with estimated client time if needed.
  return {
    id: docRef.id,
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
