
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit3, Trash2, Save, XCircle, MessageSquareText, User, ListTodo, StickyNote, Loader2 } from 'lucide-react';
import type { RetroItem, RetroItemFormValues, RetroItemColor } from '@/types/retro';
import { retroItemFormSchema } from '@/types/retro';

interface RetroTableProps {
  items: RetroItem[];
  onAddItem: (values: RetroItemFormValues) => void;
  onUpdateItem: (id: string, values: RetroItemFormValues) => void;
  onDeleteItem: (id: string) => void;
  isLoading?: boolean; // To disable forms/buttons during parent mutations
}

const defaultFormValues: RetroItemFormValues = {
  whoAmI: '',
  whatToSay: '',
  actionItems: '',
  color: 'green',
};

const colorLabels: Record<RetroItemColor, string> = {
  green: 'להמשיך לעשות',
  yellow: 'לשים לב',
  red: 'לשנות את זה',
};

// Reusable FormFields component for Mobile Cards / Sticky Note Form
const RetroItemFormFields: FC<{ control: any /* Control<RetroItemFormValues> */; formIdPrefix: string; disabled?: boolean }> = ({ control, formIdPrefix, disabled }) => {
  const watchedColor = useWatch({ control, name: 'color' });
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="whoAmI"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1"><User size={16} className="ml-1"/> מי אני?</FormLabel>
            <FormControl>
              <Input placeholder="שם / תפקיד" {...field} id={`${formIdPrefix}-whoAmI`} disabled={disabled}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="whatToSay"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1"><MessageSquareText size={16} className="ml-1"/> מה אני רוצה לומר</FormLabel>
            <FormControl>
              <Textarea placeholder="מחשבות, משוב, רעיונות..." {...field} rows={3} id={`${formIdPrefix}-whatToSay`} disabled={disabled}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="actionItems"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <ListTodo size={16} className="ml-1"/> פריטי פעולה {watchedColor !== 'red' && '(אופציונלי)'}
            </FormLabel>
            <FormControl>
              <Textarea placeholder="משימות ספציפיות או מעקבים..." {...field} rows={3} id={`${formIdPrefix}-actionItems`} disabled={disabled}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>סנטימנט / קטגוריה</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-wrap gap-x-4 gap-y-2 pt-1"
                id={`${formIdPrefix}-color`}
                disabled={disabled}
                dir="rtl"
              >
                {(['green', 'yellow', 'red'] as RetroItemColor[]).map((color) => (
                  <FormItem key={color} className="flex items-center space-x-2 space-x-reverse"> {/* Reverse for RTL */}
                    <FormControl>
                      <RadioGroupItem value={color} id={`${formIdPrefix}-${field.name}-${color}-radio`} disabled={disabled}/>
                    </FormControl>
                    <Label htmlFor={`${formIdPrefix}-${field.name}-${color}-radio`} className={`font-medium ${
                      color === 'green' ? 'text-green-600 dark:text-green-400' :
                      color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {colorLabels[color]}
                    </Label>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};


export const RetroTable: FC<RetroTableProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem, isLoading = false }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // Can be item.id, '__NEW__', or null
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const newItemForm = useForm<RetroItemFormValues>({
    resolver: zodResolver(retroItemFormSchema),
    defaultValues: defaultFormValues,
  });

  const editItemForm = useForm<RetroItemFormValues>({
    resolver: zodResolver(retroItemFormSchema),
    // defaultValues is set dynamically in useEffect or when starting edit
  });

  // Effect to populate edit form when an item is selected for editing
 useEffect(() => {
    if (editingItemId && editingItemId !== '__NEW__') {
      const itemToEdit = items.find(item => item.id === editingItemId);
      if (itemToEdit) {
        // Ensure actionItems is always a string, even if null/undefined from DB
        const valuesToSet: RetroItemFormValues = {
          whoAmI: itemToEdit.whoAmI,
          whatToSay: itemToEdit.whatToSay,
          actionItems: itemToEdit.actionItems || '',
          color: itemToEdit.color,
        };
        editItemForm.reset(valuesToSet);
      } else {
        setEditingItemId(null);
      }
    } else if (editingItemId === null) { // If exiting edit mode or new item mode
        editItemForm.reset(defaultFormValues); // Reset edit form
    }
  }, [editingItemId, items, editItemForm]);


  const handleAddNewItemSubmit = (values: RetroItemFormValues) => {
    onAddItem(values);
    newItemForm.reset(defaultFormValues);
    setEditingItemId(null);
  };

  const handleSaveEditSubmit = (values: RetroItemFormValues) => {
    if (editingItemId && editingItemId !== '__NEW__') {
      onUpdateItem(editingItemId, values);
      setEditingItemId(null);
    }
  };
  
  const startAddNew = () => {
    newItemForm.reset(defaultFormValues); 
    editItemForm.reset(defaultFormValues); 
    setEditingItemId('__NEW__');
  };

  const startEdit = (item: RetroItem) => {
    newItemForm.reset(defaultFormValues); 
    setEditingItemId(item.id);
  };
  
  const cancelForm = () => {
    newItemForm.reset(defaultFormValues);
    setEditingItemId(null);
  };

  if (!isClient) {
    return null; 
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-4 px-2 mt-8">
      {editingItemId === null && (
        <div className="mb-6 flex justify-center">
          <Button onClick={startAddNew} size="lg" className="shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
            {isLoading && editingItemId === '__NEW__' ? <Loader2 className="h-5 w-5 ml-2 animate-spin" /> : <PlusCircle className="h-5 w-5 ml-2" />}
             הוסף פתקית חדשה
          </Button>
        </div>
      )}

      {editingItemId === '__NEW__' && (
        <Card className="shadow-xl border-2 border-primary/60 transition-all duration-300 mb-8 transform scale-100 hover:scale-[1.01] bg-card">
          <CardHeader>
            <CardTitle className="flex items-center text-xl gap-2 text-primary">
              <PlusCircle className="h-6 w-6 ml-2" /> {/* Adjusted margin for RTL */}
              צור פתקית חדשה
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <FormProvider {...newItemForm}>
              <form onSubmit={newItemForm.handleSubmit(handleAddNewItemSubmit)} className="space-y-6">
                <RetroItemFormFields control={newItemForm.control} formIdPrefix="new" disabled={isLoading}/>
                <div className="flex space-x-2 space-x-reverse justify-end pt-2"> {/* Reverse for RTL */}
                  <Button variant="ghost" onClick={cancelForm} type="button" disabled={isLoading}>
                    <XCircle className="h-5 w-5 ml-2" /> ביטול
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 ml-2 animate-spin" /> : <Save className="h-5 w-5 ml-2" />} 
                    הוסף הערה
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && editingItemId === null && !isLoading && ( 
          <div className="text-center text-muted-foreground py-16 col-span-full">
              <StickyNote size={60} className="mx-auto mb-6 text-primary/40" />
              <p className="text-2xl font-semibold mb-2">לוח הרטרו שלך ריק</p>
              <p className="text-lg">נראה שאין עדיין פתקיות.</p>
              <p>לחץ על כפתור &quot;הוסף פתקית חדשה&quot; למעלה כדי לשתף את המחשבה הראשונה שלך!</p>
          </div>
      )}

      {(items.length > 0 || (editingItemId !== null && editingItemId !== '__NEW__')) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            if (item.id === editingItemId && editingItemId !== '__NEW__') {
              // Editing Item Form Card
              return (
                <Card 
                  key={`${item.id}-edit`} 
                  id={`note-card-${item.id}`}
                  className="shadow-2xl border-2 border-primary transform scale-105 transition-all duration-200 ease-out z-10 relative bg-card"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl gap-2 text-primary">
                      <Edit3 className="h-6 w-6 ml-2" /> {/* Adjusted margin for RTL */}
                      ערוך פתקית
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FormProvider {...editItemForm}>
                      <form onSubmit={editItemForm.handleSubmit(handleSaveEditSubmit)} className="space-y-6">
                        <RetroItemFormFields control={editItemForm.control} formIdPrefix={`edit-${item.id}`} disabled={isLoading}/>
                        <div className="flex space-x-2 space-x-reverse justify-end pt-2"> {/* Reverse for RTL */}
                          <Button variant="ghost" onClick={cancelForm} type="button" disabled={isLoading}>
                            <XCircle className="h-5 w-5 ml-2" /> ביטול
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-5 w-5 ml-2 animate-spin" /> : <Save className="h-5 w-5 ml-2" />}
                            שמור שינויים
                          </Button>
                        </div>
                      </form>
                    </FormProvider>
                  </CardContent>
                </Card>
              );
            } else {
              // Display Item Card (Sticky Note)
              const sentimentBorderClass = 
                item.color === 'green' ? 'border-green-500' :
                item.color === 'yellow' ? 'border-yellow-500' :
                'border-red-500';
              
              const sentimentBgClass = 
                item.color === 'green' ? 'bg-green-50 dark:bg-green-900/30' :
                item.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/30' :
                'bg-red-50 dark:bg-red-900/30';

              return (
                <Card 
                  key={item.id} 
                  id={`note-card-${item.id}`}
                  className={`flex flex-col h-full shadow-lg hover:shadow-2xl transition-all duration-200 ease-out border-t-4 ${sentimentBorderClass} ${sentimentBgClass} ${editingItemId !== null || isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                       <User size={18} className="text-muted-foreground shrink-0 ml-1"/> 
                       <span className="truncate">{item.whoAmI}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm pb-4 flex-grow">
                    <div className="mt-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MessageSquareText size={14} className="ml-1"/>מה אני רוצה לומר:</Label>
                      <p className="whitespace-pre-wrap pr-1 text-foreground/90 break-words">{item.whatToSay}</p> {/* Adjusted padding for RTL */}
                    </div>
                    {item.actionItems && (
                      <div className="mt-3">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><ListTodo size={14} className="ml-1"/>פריטי פעולה:</Label>
                        <p className="whitespace-pre-wrap pr-1 text-foreground/90 break-words">{item.actionItems}</p> {/* Adjusted padding for RTL */}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 space-x-reverse py-3 border-t bg-card/50 dark:bg-muted/20 mt-auto"> {/* Reverse for RTL */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => startEdit(item)} 
                      disabled={!!editingItemId || isLoading}
                      className="text-xs px-2 py-1 h-auto"
                      aria-label={`ערוך הערה מאת ${item.whoAmI}`}
                    >
                      <Edit3 className="h-3.5 w-3.5 ml-1.5" /> ערוך
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onDeleteItem(item.id)}
                      disabled={!!editingItemId || isLoading}
                      className="text-xs px-2 py-1 h-auto"
                      aria-label={`מחק הערה מאת ${item.whoAmI}`}
                    >
                      {isLoading && !!editingItemId && editingItemId !== '__NEW__' ? <Loader2 className="h-3.5 w-3.5 ml-1.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 ml-1.5" />}
                       מחק
                    </Button>
                  </CardFooter>
                </Card>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};
