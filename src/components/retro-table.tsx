
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit3, Trash2, Save, XCircle, MessageSquareText, User, ListTodo, StickyNote } from 'lucide-react';
import type { RetroItem, RetroItemFormValues, RetroItemColor } from '@/types/retro';
import { retroItemFormSchema } from '@/types/retro';
import { Skeleton } from '@/components/ui/skeleton';

interface RetroTableProps {
  items: RetroItem[];
  onAddItem: (values: RetroItemFormValues) => void;
  onUpdateItem: (id: string, values: RetroItemFormValues) => void;
  onDeleteItem: (id: string) => void;
}

const defaultFormValues: RetroItemFormValues = {
  whoAmI: '',
  whatToSay: '',
  actionItems: '',
  color: 'green',
};

// Reusable FormFields component for Mobile Cards / Sticky Note Form
const RetroItemFormFields: FC<{ control: any /* Control<RetroItemFormValues> */; formIdPrefix: string }> = ({ control, formIdPrefix }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="whoAmI"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1"><User size={16} /> Who am I?</FormLabel>
            <FormControl>
              <Input placeholder="Name / Role" {...field} />
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
            <FormLabel className="flex items-center gap-1"><MessageSquareText size={16} /> What I want to say</FormLabel>
            <FormControl>
              <Textarea placeholder="My thoughts, feedback, ideas..." {...field} rows={3}/>
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
            <FormLabel className="flex items-center gap-1"><ListTodo size={16} /> Action Items (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Specific tasks or follow-ups..." {...field} rows={3}/>
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
            <FormLabel>Sentiment / Color</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-wrap gap-x-4 gap-y-2 pt-1"
              >
                {(['green', 'yellow', 'red'] as RetroItemColor[]).map((color) => (
                  <FormItem key={color} className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value={color} id={`${formIdPrefix}-${field.name}-${color}-radio`} />
                    </FormControl>
                    <Label htmlFor={`${formIdPrefix}-${field.name}-${color}-radio`} className={`font-medium capitalize ${
                      color === 'green' ? 'text-green-600 dark:text-green-400' :
                      color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {color}
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


export const RetroTable: FC<RetroTableProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
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
  });

  useEffect(() => {
    if (editingItemId) {
      const itemToEdit = items.find(item => item.id === editingItemId);
      if (itemToEdit) {
        editItemForm.reset(itemToEdit);
      }
    } else {
      editItemForm.reset(defaultFormValues); 
    }
  }, [editingItemId, items, editItemForm]);

  const handleAddNewItem = (values: RetroItemFormValues) => {
    onAddItem(values);
    newItemForm.reset(defaultFormValues);
  };

  const handleSaveEdit = (values: RetroItemFormValues) => {
    if (editingItemId) {
      onUpdateItem(editingItemId, values);
      setEditingItemId(null);
    }
  };

  const startEdit = (item: RetroItem) => {
    setEditingItemId(item.id);
  };
  
  const cancelEdit = () => {
    setEditingItemId(null);
  };

  if (!isClient) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6 py-4 px-2 mt-8">
        {/* Skeleton for Add New Item Card */}
        <Card className="shadow-lg border border-dashed border-muted">
          <CardHeader>
            <div className="flex items-center text-xl gap-2">
              <PlusCircle className="h-5 w-5 text-muted-foreground" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-10 w-full" /> </div>
            <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-20 w-full" /> </div>
            <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-20 w-full" /> </div>
            <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-8 w-full" /> </div>
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>

        {/* Skeleton for Item Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="shadow-md">
              <CardHeader className="pb-3 border-t-4 border-muted pt-4">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-muted-foreground"/> <Skeleton className="h-5 w-3/4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm pb-4 pt-3">
                <div>
                  <Skeleton className="h-3 w-1/3 mb-1" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-1" />
                </div>
                <div className="mt-3">
                  <Skeleton className="h-3 w-1/3 mb-1" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-1" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 py-3 bg-muted/20 dark:bg-muted/10">
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="h-7 w-20 rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-4 px-2 mt-8">
      {/* Add New Item Form Card */}
      {!editingItemId && (
        <Card className="shadow-xl border-2 border-dashed border-primary/30 hover:border-primary transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl gap-2">
              <PlusCircle className="h-6 w-6 text-primary" />
              Add New Sticky Note
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <FormProvider {...newItemForm}>
              <form onSubmit={newItemForm.handleSubmit(handleAddNewItem)} className="space-y-6">
                <RetroItemFormFields control={newItemForm.control} formIdPrefix="new"/>
                <Button type="submit" className="w-full" size="lg">
                  <PlusCircle className="h-5 w-5 mr-2" /> Add Note
                </Button>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      )}

      {/* Empty State or Grid of Item Cards */}
      {items.length === 0 && !editingItemId && (
          <div className="text-center text-muted-foreground py-16 col-span-full">
              <StickyNote size={60} className="mx-auto mb-6 text-primary/40" />
              <p className="text-2xl font-semibold mb-2">Board is Empty</p>
              <p className="text-lg">Looks like there are no sticky notes yet.</p>
              <p>Use the form above to add your first thought!</p>
          </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            if (item.id === editingItemId) {
              // Editing Item Form Card
              return (
                <Card key={`${item.id}-edit`} className="shadow-2xl border-2 border-primary transform scale-105 transition-all duration-200 ease-out z-10 relative">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl gap-2">
                      <Edit3 className="h-6 w-6 text-primary" />
                      Edit Sticky Note
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FormProvider {...editItemForm}>
                      <form onSubmit={editItemForm.handleSubmit(handleSaveEdit)} className="space-y-6">
                        <RetroItemFormFields control={editItemForm.control} formIdPrefix={`edit-${item.id}`}/>
                        <div className="flex space-x-2 justify-end pt-2">
                          <Button variant="ghost" onClick={cancelEdit} type="button">
                            <XCircle className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                          <Button type="submit">
                            <Save className="h-4 w-4 mr-2" /> Save Changes
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
                item.color === 'green' ? 'bg-green-50 dark:bg-green-700/10' :
                item.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-700/10' :
                'bg-red-50 dark:bg-red-700/10';

              return (
                <Card key={item.id} className={`flex flex-col h-full shadow-lg hover:shadow-2xl transition-all duration-200 ease-out border-t-4 ${sentimentBorderClass} ${sentimentBgClass}`}>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                       <User size={18} className="text-muted-foreground shrink-0"/> 
                       <span className="truncate">{item.whoAmI}</span>
                    </CardTitle>
                    {/* Optional: Display color explicitly if border/bg is not enough */}
                    {/* <p className={`text-xs capitalize font-medium mt-1 ${
                        item.color === 'green' ? 'text-green-600' :
                        item.color === 'yellow' ? 'text-yellow-600' :
                        'text-red-600'}`}>{item.color}
                    </p> */}
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm pb-4 flex-grow">
                    <div className="mt-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MessageSquareText size={14}/>What I want to say:</Label>
                      <p className="whitespace-pre-wrap pl-1 text-foreground/90 break-words">{item.whatToSay}</p>
                    </div>
                    {item.actionItems && (
                      <div className="mt-3">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><ListTodo size={14}/>Action Items:</Label>
                        <p className="whitespace-pre-wrap pl-1 text-foreground/90 break-words">{item.actionItems}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 py-3 border-t bg-card/50 dark:bg-muted/10 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => startEdit(item)} 
                      disabled={!!editingItemId}
                      className="text-xs px-2 py-1 h-auto"
                      aria-label={`Edit note from ${item.whoAmI}`}
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onDeleteItem(item.id)}
                      disabled={!!editingItemId}
                      className="text-xs px-2 py-1 h-auto"
                      aria-label={`Delete note from ${item.whoAmI}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
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
