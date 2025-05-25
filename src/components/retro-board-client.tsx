
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { RetroTable } from '@/components/retro-table';
import type { RetroItem, RetroItemFormValues, Sprint, SprintFormValues } from '@/types/retro';
import { sprintFormSchema } from '@/types/retro';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { 
  getRetroItems, 
  addRetroItem, 
  updateRetroItem, 
  deleteRetroItem, 
  getSprints, 
  addSprint,
  deleteSprintAndItems,
  countOrphanedRetroItems,
  assignOrphanedItemsToSprint
} from '@/services/retroService';
import { Skeleton } from '@/components/ui/skeleton';
import ActionItemsList from '@/components/action-items-list';
import { Button, buttonVariants } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, RefreshCw, Loader2, Link2, Trash2 } from 'lucide-react';

export default function RetroBoardClient() {
  const tanstackQueryClient = useTanstackQueryClient();
  const { toast } = useToast();

  const [currentSprintId, setCurrentSprintId] = useState<string | null>(null);
  const [isAddSprintDialogOpen, setIsAddSprintDialogOpen] = useState(false);
  const [isDeleteSprintDialogOpen, setIsDeleteSprintDialogOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);


  // --- Sprint Queries and Mutations ---
  const { data: sprints = [], isLoading: isLoadingSprints, isError: isErrorSprints, error: sprintsError } = useQuery<Sprint[], Error>({
    queryKey: ['sprints'],
    queryFn: getSprints,
    refetchOnWindowFocus: false,
  });

  const addSprintMutation = useMutation({
    mutationFn: addSprint,
    onSuccess: (newSprint) => {
      tanstackQueryClient.invalidateQueries({ queryKey: ['sprints'] });
      setCurrentSprintId(newSprint.id); 
      toast({
        title: "הצלחה",
        description: `ספרינט "${newSprint.name}" נוסף בהצלחה.`,
      });
      setIsAddSprintDialogOpen(false);
      addSprintForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה ביצירת ספרינט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSprintMutation = useMutation({
    mutationFn: deleteSprintAndItems,
    onSuccess: () => {
      tanstackQueryClient.invalidateQueries({ queryKey: ['sprints'] });
      tanstackQueryClient.invalidateQueries({ queryKey: ['retroItems'] });
      toast({
        title: "הצלחה",
        description: `ספרינט "${sprintToDelete?.name}" וכל ההערות המשויכות אליו נמחקו.`,
      });
      setIsDeleteSprintDialogOpen(false);
      if (currentSprintId === sprintToDelete?.id) {
          setCurrentSprintId(null); // Will trigger useEffect to pick a new one or go to empty state
      }
      setSprintToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה במחיקת ספרינט",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleteSprintDialogOpen(false);
      setSprintToDelete(null);
    },
  });


  // --- Retro Item Queries and Mutations (dependent on currentSprintId) ---
  const { data: items = [], isLoading: isLoadingItems, isError: isErrorItems, error: itemsError } = useQuery<RetroItem[], Error>({
    queryKey: ['retroItems', currentSprintId],
    queryFn: () => getRetroItems(currentSprintId),
    enabled: !!currentSprintId, 
  });

  const addItemMutation = useMutation({
    mutationFn: ({ values, sprintId }: { values: RetroItemFormValues; sprintId: string }) => addRetroItem(values, sprintId),
    onSuccess: () => {
      tanstackQueryClient.invalidateQueries({ queryKey: ['retroItems', currentSprintId] });
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
      tanstackQueryClient.invalidateQueries({ queryKey: ['retroItems', currentSprintId] });
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
      tanstackQueryClient.invalidateQueries({ queryKey: ['retroItems', currentSprintId] });
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

  // --- Orphaned Items Migration ---
  const { data: orphanedItemsCount, refetch: refetchOrphanedCount } = useQuery<number, Error>({
    queryKey: ['orphanedRetroItemsCount'],
    queryFn: countOrphanedRetroItems,
    enabled: sprints.length > 0, 
  });

  const assignOrphanedMutation = useMutation({
    mutationFn: assignOrphanedItemsToSprint,
    onSuccess: (updatedCount) => {
      toast({
        title: "הצלחה",
        description: `${updatedCount} הערות ישנות שויכו בהצלחה לספרינט.`,
      });
      tanstackQueryClient.invalidateQueries({ queryKey: ['retroItems', currentSprintId] });
      refetchOrphanedCount(); 
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בשיוך הערות",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // --- Effects ---
  useEffect(() => {
    if (!isLoadingSprints && sprints.length > 0) {
      if (!currentSprintId || !sprints.find(s => s.id === currentSprintId)) {
        setCurrentSprintId(sprints[0].id);
      }
    } else if (!isLoadingSprints && sprints.length === 0) {
      setCurrentSprintId(null);
    }
  }, [sprints, isLoadingSprints, currentSprintId]);

  useEffect(() => {
    if (sprintsError) {
      toast({ title: "שגיאה בטעינת ספרינטים", description: sprintsError.message, variant: "destructive" });
    }
    if (itemsError) {
      toast({ title: "שגיאה בטעינת פריטי רטרו", description: itemsError.message, variant: "destructive" });
    }
  }, [sprintsError, itemsError, toast]);

  // --- Handlers ---
  const handleAddItem = useCallback((values: RetroItemFormValues) => {
    if (!currentSprintId) {
      toast({ title: "שגיאה", description: "יש לבחור ספרינט תחילה.", variant: "destructive" });
      return;
    }
    addItemMutation.mutate({ values, sprintId: currentSprintId });
  }, [addItemMutation, currentSprintId, toast]);

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
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-1000', 'ease-out');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ease-out');
      }, 2500);
    }
  }, []);

  const addSprintForm = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: { name: '' },
  });

  const onAddSprintSubmit = (values: SprintFormValues) => {
    addSprintMutation.mutate(values.name);
  };

  const handleAssignOrphanedItems = () => {
    if (currentSprintId && orphanedItemsCount && orphanedItemsCount > 0) {
      assignOrphanedMutation.mutate(currentSprintId);
    } else {
      toast({
        title: "אין פעולה נדרשת",
        description: "לא נמצאו הערות לשיוך או שלא נבחר ספרינט.",
        variant: "default",
      });
    }
  };

  const handleDeleteSprintClick = () => {
    const sprint = sprints.find(s => s.id === currentSprintId);
    if (sprint) {
      setSprintToDelete(sprint);
      setIsDeleteSprintDialogOpen(true);
    } else {
       toast({ title: "שגיאה", description: "לא נבחר ספרינט למחיקה.", variant: "destructive"});
    }
  };
  
  const currentSprint = sprints.find(s => s.id === currentSprintId);
  const pageTitle = currentSprint ? `לוח רטרו - ${currentSprint.name}` : 'לוח רטרו';
  const pageSubtitle = currentSprint ? `רטרוספקטיבה לספרינט: ${currentSprint.name}` : 'אנא בחר או צור ספרינט';


  // --- Render Logic ---
  if (isLoadingSprints) {
    return (
      <div className="w-full max-w-6xl flex flex-col items-center space-y-8 mt-8">
        <Skeleton className="h-12 w-1/3 rounded-md" />
        <div className="flex gap-4 w-full max-w-md">
            <Skeleton className="h-10 w-2/3 rounded-md" /> 
            <Skeleton className="h-10 w-1/3 rounded-md" />
        </div>
        <Skeleton className="h-10 w-64 rounded-md mt-6" /> 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full mt-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[250px] w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isErrorSprints) {
    return <div className="text-center text-destructive mt-10">שגיאה בטעינת נתוני ספרינטים.</div>;
  }
  
  if (sprints.length === 0 && !isLoadingSprints) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center mt-16 p-6 bg-card shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">ברוכים הבאים!</h1>
        <p className="text-muted-foreground mb-6">נראה שזהו לוח הרטרו הראשון שלך. בוא ניצור את הספרינט הראשון כדי להתחיל.</p>
        <FormProvider {...addSprintForm}>
          <form onSubmit={addSprintForm.handleSubmit(onAddSprintSubmit)} className="space-y-4">
            <FormField
              control={addSprintForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="sprintName" className="sr-only">שם הספרינט</FormLabel>
                  <FormControl>
                    <Input {...field} id="sprintName" placeholder="לדוגמה: ספרינט אביב 1, סיום רבעון Q3" className="text-center"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={addSprintMutation.isPending} size="lg">
              {addSprintMutation.isPending ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <PlusCircle className="ml-2 h-5 w-5" />}
              צור ספרינט ראשון
            </Button>
          </form>
        </FormProvider>
        <Toaster />
      </div>
    );
  }


  return (
    <div className="w-full max-w-7xl flex flex-col items-center space-y-6 px-2">
      <header className="text-center w-full mb-2 mt-0">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">{pageTitle}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{pageSubtitle}</p>
      </header>

      <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-card shadow-md rounded-lg border">
        <div className="flex-grow w-full sm:w-auto">
            <Label htmlFor="sprint-select" className="mb-1.5 block text-sm font-medium text-muted-foreground text-right">
                בחר ספרינט קיים
            </Label>
            <Select value={currentSprintId || ""} onValueChange={setCurrentSprintId} dir="rtl">
            <SelectTrigger id="sprint-select" className="w-full h-11 text-base">
                <SelectValue placeholder={sprints.length > 0 ? "בחר ספרינט..." : "טוען ספרינטים..."} />
            </SelectTrigger>
            <SelectContent>
                {sprints.map(sprint => (
                <SelectItem key={sprint.id} value={sprint.id} className="text-base justify-end">
                    {sprint.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <div className="pt-2 sm:pt-0 sm:self-end w-full sm:w-auto flex gap-2">
            <Button onClick={() => setIsAddSprintDialogOpen(true)} className="flex-grow sm:flex-grow-0 h-11 text-base" variant="outline">
                <PlusCircle className="ml-2 h-5 w-5" />
                הוסף ספרינט חדש
            </Button>
             {currentSprintId && sprints.length > 0 && (
              <Button 
                onClick={handleDeleteSprintClick} 
                variant="destructive" 
                size="icon" 
                className="h-11 w-11"
                aria-label="מחק ספרינט נוכחי"
                disabled={deleteSprintMutation.isPending && sprintToDelete?.id === currentSprintId}
              >
                {(deleteSprintMutation.isPending && sprintToDelete?.id === currentSprintId) ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
              </Button>
            )}
        </div>
      </div>
      
      {typeof orphanedItemsCount === 'number' && orphanedItemsCount > 0 && currentSprintId && (
        <div className="w-full max-w-3xl p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md shadow-md my-4" dir="rtl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">נמצאו הערות ישנות!</p>
              <p>
                ישנן {orphanedItemsCount} הערות שאינן משויכות לאף ספרינט. 
                האם תרצה לשייך אותן לספרינט הנוכחי: "{currentSprint?.name}"?
              </p>
            </div>
            <Button 
              onClick={handleAssignOrphanedItems} 
              disabled={assignOrphanedMutation.isPending}
              variant="outline"
              className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 border-yellow-500"
            >
              {assignOrphanedMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <Link2 className="ml-2 h-4 w-4" />}
              שייך הערות
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isAddSprintDialogOpen} onOpenChange={setIsAddSprintDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">הוספת ספרינט חדש</DialogTitle>
          </DialogHeader>
          <FormProvider {...addSprintForm}>
            <form onSubmit={addSprintForm.handleSubmit(onAddSprintSubmit)} className="space-y-6 py-4">
              <FormField
                control={addSprintForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="newSprintName" className="text-right block">שם הספרינט</FormLabel>
                    <FormControl>
                      <Input {...field} id="newSprintName" placeholder="לדוגמה: ספרינט סתיו 2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="ghost">ביטול</Button>
                </DialogClose>
                <Button type="submit" disabled={addSprintMutation.isPending}>
                  {addSprintMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : 'שמור ספרינט'}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteSprintDialogOpen} onOpenChange={setIsDeleteSprintDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">אישור מחיקת ספרינט</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              האם אתה בטוח שברצונך למחוק את הספרינט "{sprintToDelete?.name}"? 
              <br />
              <strong>פעולה זו תמחק גם את כל ההערות המשויכות לספרינט זה.</strong>
              <br />
              לא ניתן לשחזר פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-start sm:space-x-2 sm:space-x-reverse pt-2">
            <AlertDialogCancel onClick={() => setSprintToDelete(null)}>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (sprintToDelete) {
                  deleteSprintMutation.mutate(sprintToDelete.id);
                }
              }}
              className={buttonVariants({variant: "destructive"})}
              disabled={deleteSprintMutation.isPending}
            >
              {deleteSprintMutation.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : 'מחק ספרינט'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {currentSprintId && (
        <>
          {isLoadingItems && !isErrorItems && (
            <div className="w-full flex flex-col items-center space-y-8 mt-8">
                <div className="mb-6 flex justify-center"> <Skeleton className="h-12 w-64 rounded-md" /> </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[250px] w-full rounded-lg shadow-xl" />)}
                </div>
                <div className="mt-12 w-full">
                    <Skeleton className="h-10 w-1/2 mx-auto mb-4 rounded-md" /> 
                    <Skeleton className="h-40 w-full rounded-lg shadow-xl" />
                </div>
            </div>
          )}
          {isErrorItems && (
            <div className="text-center text-destructive mt-10 p-4 border border-destructive bg-destructive/10 rounded-md">
              <h3 className="text-lg font-semibold">אוי, שגיאה!</h3>
              <p>לא הצלחנו לטעון את פריטי הרטרו עבור הספרינט הזה.</p>
              <p className="text-sm mt-1">{itemsError?.message}</p>
            </div>
          )}
          {!isLoadingItems && !isErrorItems && (
            <RetroTable 
              items={items} 
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              isLoading={addItemMutation.isPending || updateItemMutation.isPending || deleteItemMutation.isPending}
            />
          )}
          {!isLoadingItems && !isErrorItems && items.length > 0 && (
             <ActionItemsList items={items} onActionItemClick={handleActionItemClick} />
          )}
        </>
      )}
      {!currentSprintId && !isLoadingSprints && sprints.length > 0 && (
         <div className="text-center text-muted-foreground py-16 col-span-full w-full">
            <RefreshCw size={60} className="mx-auto mb-6 text-primary/40 animate-spin" />
            <p className="text-2xl font-semibold mb-2">בחר ספרינט</p>
            <p className="text-lg">אנא בחר ספרינט מהרשימה למעלה כדי להציג את פריטי הרטרו שלו.</p>
        </div>
      )}
      <Toaster />
    </div>
  );
}
