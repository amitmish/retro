"use client";

import { useState, useEffect, useCallback } from 'react';
import { RetroTable } from '@/components/retro-table';
import type { RetroItem, RetroItemFormValues } from '@/types/retro';
import { v4 as uuidv4 } from 'uuid';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";


const LOCAL_STORAGE_KEY = 'retroBoardItems';

export default function RetroBoardClient() {
  const [items, setItems] = useState<RetroItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Failed to load items from localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to load items from storage.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save items to localStorage:", error);
         toast({
          title: "Error",
          description: "Failed to save items to storage.",
          variant: "destructive",
        });
      }
    }
  }, [items, isMounted, toast]);

  const handleAddItem = useCallback((values: RetroItemFormValues) => {
    const newItem: RetroItem = {
      id: uuidv4(),
      ...values,
      actionItems: values.actionItems || '', 
    };
    setItems((prevItems) => [newItem, ...prevItems]);
    toast({
      title: "Success",
      description: "Retro item added.",
    });
  }, [toast]);

  const handleUpdateItem = useCallback((id: string, values: RetroItemFormValues) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, ...values, actionItems: values.actionItems || '' } : item
      )
    );
    toast({
      title: "Success",
      description: "Retro item updated.",
    });
  }, [toast]);

  const handleDeleteItem = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast({
      title: "Success",
      description: "Retro item deleted.",
    });
  }, [toast]);


  if (!isMounted) {
    return (
      <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
        <div className="w-full max-w-4xl h-[600px] bg-card rounded-lg shadow-xl animate-pulse mt-12" />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
      <RetroTable 
        items={items} 
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />
      <Toaster />
    </div>
  );
}
