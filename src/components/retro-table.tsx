"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ListChecks, PlusCircle, Edit3, Trash2, Save, XCircle } from 'lucide-react';
import type { RetroItem, RetroItemFormValues, RetroItemColor } from '@/types/retro';
import { retroItemFormSchema } from '@/types/retro';

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

// Reusable FormFields component
const RetroItemFormFields: FC<{ control: any /* Control<RetroItemFormValues> */ }> = ({ control }) => {
  return (
    <>
      <TableCell className="min-w-[200px]">
        <FormField
          control={control}
          name="whoAmI"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Name / Role" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <FormField
          control={control}
          name="whatToSay"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="What I want to say..." {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="min-w-[300px]">
        <FormField
          control={control}
          name="actionItems"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Action items..." {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="min-w-[150px]">
        <FormField
          control={control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-2"
                >
                  {(['green', 'yellow', 'red'] as RetroItemColor[]).map((color) => (
                    <FormItem key={color} className="flex items-center space-x-1">
                      <FormControl>
                        <RadioGroupItem value={color} id={`${field.name}-${color}-radio`} />
                      </FormControl>
                      <Label htmlFor={`${field.name}-${color}-radio`} className={`font-medium capitalize text-xs ${
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
      </TableCell>
    </>
  );
};


export const RetroTable: FC<RetroTableProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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
      editItemForm.reset(defaultFormValues); // Reset if no item is being edited
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
    // useEffect will handle resetting the form
  };
  
  const cancelEdit = () => {
    setEditingItemId(null);
  };

  return (
    <Card className="w-full max-w-full shadow-xl mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ListChecks className="h-6 w-6 text-primary" />
          Retro Board
        </CardTitle>
        <CardDescription>Add new items or edit existing ones directly in the table.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <Table>
            {items.length === 0 && !editingItemId && (
              <TableCaption className="py-8 text-lg">No retro items yet. Add your first one below!</TableCaption>
            )}
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] font-semibold">Who am I?</TableHead>
                <TableHead className="font-semibold">What I want to say</TableHead>
                <TableHead className="font-semibold">Action Items</TableHead>
                <TableHead className="font-semibold">Sentiment</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* New Item Row */}
              {!editingItemId && (
                <FormProvider {...newItemForm}>
                  <TableRow className="bg-muted/20 hover:bg-muted/30">
                    <RetroItemFormFields control={newItemForm.control} />
                    <TableCell className="text-right min-w-[120px]">
                      <Button 
                        size="sm" 
                        onClick={newItemForm.handleSubmit(handleAddNewItem)}
                        aria-label="Add new retro item"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </TableCell>
                  </TableRow>
                </FormProvider>
              )}

              {/* Existing Items */}
              {items.map((item) => {
                if (item.id === editingItemId) {
                  // Editing Row
                  return (
                    <FormProvider {...editItemForm} key={`${item.id}-edit`}>
                      <TableRow data-row-color={editItemForm.getValues('color')} className="bg-muted/10">
                        <RetroItemFormFields control={editItemForm.control} />
                        <TableCell className="text-right space-x-1 min-w-[180px]">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={editItemForm.handleSubmit(handleSaveEdit)}
                            aria-label="Save changes"
                          >
                            <Save className="h-4 w-4 mr-1" /> Save
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={cancelEdit}
                            aria-label="Cancel editing"
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    </FormProvider>
                  );
                } else {
                  // Display Row
                  return (
                    <TableRow key={item.id} data-row-color={item.color}>
                      <TableCell className="font-medium break-words whitespace-normal align-top">{item.whoAmI}</TableCell>
                      <TableCell className="break-words whitespace-normal align-top">{item.whatToSay}</TableCell>
                      <TableCell className="break-words whitespace-normal align-top">{item.actionItems || '-'}</TableCell>
                      <TableCell className="break-words whitespace-normal align-top capitalize">{item.color}</TableCell>
                      <TableCell className="text-right space-x-1 min-w-[150px]">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => startEdit(item)}
                          aria-label={`Edit item from ${item.whoAmI}`}
                          disabled={!!editingItemId} // Disable if another item is being edited
                        >
                          <Edit3 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => onDeleteItem(item.id)}
                          aria-label={`Delete item from ${item.whoAmI}`}
                          disabled={!!editingItemId} // Disable if an item is being edited
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
