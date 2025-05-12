"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ListChecks, PlusCircle, Edit3, Trash2, Save, XCircle, MessageSquareText, User, ListTodo } from 'lucide-react';
import type { RetroItem, RetroItemFormValues, RetroItemColor } from '@/types/retro';
import { retroItemFormSchema } from '@/types/retro';
import { useIsMobile } from '@/hooks/use-mobile';
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

// Reusable FormFields component for placing inside TableCell (Desktop)
const DesktopRetroItemFormFields: FC<{ control: any /* Control<RetroItemFormValues> */ }> = ({ control }) => {
  return (
    <>
      <TableCell className="min-w-[150px] p-2">
        <FormField
          control={control}
          name="whoAmI"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Name / Role" {...field} className="text-sm"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="min-w-[200px] sm:min-w-[250px] p-2">
        <FormField
          control={control}
          name="whatToSay"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="What I want to say..." {...field} rows={2} className="text-sm"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="min-w-[200px] sm:min-w-[250px] p-2">
        <FormField
          control={control}
          name="actionItems"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Action items..." {...field} rows={2} className="text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="min-w-[120px] sm:min-w-[150px] p-2">
        <FormField
          control={control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0"
                >
                  {(['green', 'yellow', 'red'] as RetroItemColor[]).map((color) => (
                    <FormItem key={color} className="flex items-center space-x-1">
                      <FormControl>
                        <RadioGroupItem value={color} id={`${field.name}-${color}-radio-desktop`} />
                      </FormControl>
                      <Label htmlFor={`${field.name}-${color}-radio-desktop`} className={`font-medium capitalize text-xs ${
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

// Reusable FormFields component for Mobile Cards
const MobileRetroItemFormFields: FC<{ control: any /* Control<RetroItemFormValues> */; formIdPrefix: string }> = ({ control, formIdPrefix }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="whoAmI"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Who am I?</FormLabel>
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
            <FormLabel>What I want to say</FormLabel>
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
            <FormLabel>Action Items (Optional)</FormLabel>
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
            <FormLabel>Sentiment</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex space-x-4 pt-1"
              >
                {(['green', 'yellow', 'red'] as RetroItemColor[]).map((color) => (
                  <FormItem key={color} className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value={color} id={`${formIdPrefix}-${field.name}-${color}-radio-mobile`} />
                    </FormControl>
                    <Label htmlFor={`${formIdPrefix}-${field.name}-${color}-radio-mobile`} className={`font-medium capitalize ${
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
  const isMobile = useIsMobile();
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
      // Reset edit form when not editing, or when starting a new edit from scratch
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
    // useEffect will handle resetting the form with item's data
  };
  
  const cancelEdit = () => {
    setEditingItemId(null);
  };

  if (!isClient) {
    return (
      <Card className="w-full max-w-4xl shadow-xl mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ListChecks className="h-6 w-6 text-primary" />
            Retro Board
          </CardTitle>
          <CardDescription>Loading retro items...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  // MOBILE VIEW
  if (isMobile) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-6 py-4 px-2">
        {/* Add New Item Form Card - Mobile */}
        {!editingItemId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Add New Retro Item
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormProvider {...newItemForm}>
                <form onSubmit={newItemForm.handleSubmit(handleAddNewItem)} className="space-y-6">
                  <MobileRetroItemFormFields control={newItemForm.control} formIdPrefix="new"/>
                  <Button type="submit" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Mobile */}
        {items.length === 0 && !editingItemId && (
            <div className="text-center text-muted-foreground py-10">
                <ListChecks size={48} className="mx-auto mb-4 text-primary/50" />
                <p className="text-lg font-medium">No retro items yet.</p>
                <p>Use the form above to add your first thought!</p>
            </div>
        )}

        {/* Item Cards - Mobile */}
        {items.map((item) => {
          if (item.id === editingItemId) {
            // Editing Item Form Card - Mobile
            return (
              <Card key={`${item.id}-edit`} className="border-primary shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    Edit Retro Item
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormProvider {...editItemForm}>
                    <form onSubmit={editItemForm.handleSubmit(handleSaveEdit)} className="space-y-6">
                      <MobileRetroItemFormFields control={editItemForm.control} formIdPrefix={`edit-${item.id}`}/>
                      <div className="flex space-x-2 justify-end">
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
            // Display Item Card - Mobile
            const sentimentColorClass = 
              item.color === 'green' ? 'border-l-green-500' :
              item.color === 'yellow' ? 'border-l-yellow-500' :
              'border-l-red-500';
            
            return (
              <Card key={item.id} className={`shadow-md border-l-4 ${sentimentColorClass}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                     <User size={18} className="text-muted-foreground"/> {item.whoAmI}
                  </CardTitle>
                  <CardDescription className="text-xs capitalize pt-1">Sentiment: {item.color}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm pb-4">
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquareText size={14}/>What I want to say:</Label>
                    <p className="whitespace-pre-wrap pl-1">{item.whatToSay}</p>
                  </div>
                  {item.actionItems && (
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><ListTodo size={14}/>Action Items:</Label>
                      <p className="whitespace-pre-wrap pl-1">{item.actionItems}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 py-3 bg-muted/30">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => startEdit(item)} 
                    disabled={!!editingItemId}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    <Edit3 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDeleteItem(item.id)}
                    disabled={!!editingItemId}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          }
        })}
      </div>
    );
  }

  // DESKTOP VIEW (TABLE)
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
                <TableHead className="min-w-[200px] sm:min-w-[250px] font-semibold">What I want to say</TableHead>
                <TableHead className="min-w-[200px] sm:min-w-[250px] font-semibold">Action Items</TableHead>
                <TableHead className="min-w-[120px] sm:min-w-[150px] font-semibold">Sentiment</TableHead>
                <TableHead className="min-w-[100px] sm:min-w-[120px] font-semibold text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* New Item Row - Desktop */}
              {!editingItemId && (
                <FormProvider {...newItemForm}>
                  <TableRow className="bg-muted/20 hover:bg-muted/30">
                    <DesktopRetroItemFormFields control={newItemForm.control} />
                    <TableCell className="text-right min-w-[100px] sm:min-w-[120px] p-2 pr-4">
                      <Button 
                        size="sm" 
                        onClick={newItemForm.handleSubmit(handleAddNewItem)}
                        aria-label="Add new retro item"
                        className="px-2 sm:px-3"
                      >
                        <PlusCircle className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Add</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                </FormProvider>
              )}

              {/* Existing Items - Desktop */}
              {items.map((item) => {
                if (item.id === editingItemId) {
                  // Editing Row - Desktop
                  return (
                    <FormProvider {...editItemForm} key={`${item.id}-edit`}>
                      <TableRow data-row-color={editItemForm.getValues('color')} className="bg-muted/10">
                        <DesktopRetroItemFormFields control={editItemForm.control} />
                        <TableCell className="text-right space-x-1 min-w-[120px] sm:min-w-[170px] p-2 pr-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={editItemForm.handleSubmit(handleSaveEdit)}
                            aria-label="Save changes"
                            className="px-1 sm:px-3"
                          >
                            <Save className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Save</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={cancelEdit}
                            aria-label="Cancel editing"
                            className="px-1 sm:px-3"
                          >
                            <XCircle className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Cancel</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    </FormProvider>
                  );
                } else {
                  // Display Row - Desktop
                  return (
                    <TableRow key={item.id} data-row-color={item.color}>
                      <TableCell className="font-medium break-words whitespace-normal align-top p-2">{item.whoAmI}</TableCell>
                      <TableCell className="break-words whitespace-normal align-top p-2">{item.whatToSay}</TableCell>
                      <TableCell className="break-words whitespace-normal align-top p-2">{item.actionItems || '-'}</TableCell>
                      <TableCell className="break-words whitespace-normal align-top capitalize p-2">{item.color}</TableCell>
                      <TableCell className="text-right space-x-1 min-w-[120px] sm:min-w-[140px] p-2 pr-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => startEdit(item)}
                          aria-label={`Edit item from ${item.whoAmI}`}
                          disabled={!!editingItemId} 
                          className="px-1 sm:px-3"
                        >
                          <Edit3 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => onDeleteItem(item.id)}
                          aria-label={`Delete item from ${item.whoAmI}`}
                          disabled={!!editingItemId} 
                          className="px-1 sm:px-3"
                        >
                          <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Delete</span>
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
