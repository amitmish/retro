
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RetroTable } from '@/components/retro-table';
import type { RetroItem, RetroItemFormValues } from '@/types/retro';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { getRetroItems, addRetroItem, updateRetroItem, deleteRetroItem } from '@/services/retroService';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import ActionItemsList from '@/components/action-items-list';

export default function RetroBoardClient() {
  const queryClientHook = useQueryClient();
  const { toast } = useToast();

  const { data: items = [], isLoading, isError, error: queryError } = useQuery<RetroItem[], Error>({
    queryKey: ['retroItems'],
    queryFn: getRetroItems,
  });

  const addItemMutation = useMutation({
    mutationFn: addRetroItem,
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: ['retroItems'] });
      toast({
        title: "הצלחה",
        description: "פריט רטרו נוסף.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה",
        description: `נכשל בהוספת פריט: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: RetroItemFormValues }) => updateRetroItem(id, values),
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: ['retroItems'] });
      toast({
        title: "הצלחה",
        description: "פריט רטרו עודכן.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה",
        description: `נכשל בעדכון פריט: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteRetroItem,
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: ['retroItems'] });
      toast({
        title: "הצלחה",
        description: "פריט רטרו נמחק.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה",
        description: `נכשל במחיקת פריט: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddItem = useCallback((values: RetroItemFormValues) => {
    addItemMutation.mutate(values);
  }, [addItemMutation]);

  const handleUpdateItem = useCallback((id: string, values: RetroItemFormValues) => {
    updateItemMutation.mutate({ id, values });
  }, [updateItemMutation]);

  const handleDeleteItem = useCallback((id: string) => {
    deleteItemMutation.mutate(id);
  }, [deleteItemMutation]);

  const handleActionItemClick = useCallback((itemId: string) => {
    const element = document.getElementById(`note-card-${itemId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a temporary highlight
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-1000', 'ease-out');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ease-out');
      }, 2500); // Remove highlight after 2.5 seconds
    }
  }, []);

  useEffect(() => {
    if (queryError) {
      toast({
        title: "שגיאה בטעינת נתונים",
        description: queryError.message || "לא ניתן היה לאחזר פריטי רטרו ממסד הנתונים.",
        variant: "destructive",
      });
    }
  }, [queryError, toast]);


  if (isLoading) {
    return (
      <div className="w-full max-w-6xl flex flex-col items-center space-y-8 mt-8">
         {/* Simplified skeleton for the "Add New Note" button area */}
        <div className="mb-6 flex justify-center">
            <Skeleton className="h-12 w-64 rounded-md" />
        </div>
        {/* Skeleton for Item Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {[1, 2, 3, 4].map(i => (
             <Skeleton key={i} className="h-[250px] w-full rounded-lg shadow-xl" />
          ))}
        </div>
        {/* Skeleton for Action Items List */}
        <div className="mt-12 w-full">
          <Skeleton className="h-10 w-1/2 mx-auto mb-4 rounded-md" /> 
          <Skeleton className="h-40 w-full rounded-lg shadow-xl" />
        </div>
        <Toaster />
      </div>
    );
  }
  
  if (isError) {
    // Error message is shown via toast
  }


  return (
    <div className="w-full max-w-6xl flex flex-col items-center space-y-8">
      <RetroTable 
        items={items} 
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        isLoading={addItemMutation.isPending || updateItemMutation.isPending || deleteItemMutation.isPending}
      />
      <ActionItemsList items={items} onActionItemClick={handleActionItemClick} />
      <Toaster />
    </div>
  );
}
