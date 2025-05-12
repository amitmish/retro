"use client";

import { useState, useEffect, useCallback } from 'react';
import { AddRetroItemForm, type RetroItemFormValues } from '@/components/add-retro-item-form';
import { RetroTable } from '@/components/retro-table';
import type { RetroItem } from '@/types/retro';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'retroBoardItems';

export default function RetroBoardClient() {
  const [items, setItems] = useState<RetroItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Failed to load items from localStorage:", error);
      // Optionally, clear corrupted storage
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save items to localStorage:", error);
      }
    }
  }, [items, isMounted]);

  const handleAddItem = useCallback((values: RetroItemFormValues) => {
    const newItem: RetroItem = {
      id: uuidv4(),
      ...values,
      actionItems: values.actionItems || '', // Ensure actionItems is always a string
    };
    setItems((prevItems) => [newItem, ...prevItems]);
  }, []);

  if (!isMounted) {
    // Render a loading state or placeholder to avoid hydration mismatch
    // and to show something while localStorage is being accessed.
    return (
      <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
        <div className="w-full max-w-2xl h-96 bg-card rounded-lg shadow-xl animate-pulse" />
        <div className="w-full max-w-4xl h-96 bg-card rounded-lg shadow-xl animate-pulse mt-12" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
      <AddRetroItemForm onSubmit={handleAddItem} />
      <RetroTable items={items} />
    </div>
  );
}
