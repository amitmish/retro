"use client";

import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import type { RetroItemColor } from '@/types/retro';

const formSchema = z.object({
  whoAmI: z.string().min(1, { message: "Please enter who you are or a team role." }).max(50, { message: "Name/role must be 50 characters or less." }),
  whatToSay: z.string().min(1, { message: "This field cannot be empty." }).max(500, { message: "Message must be 500 characters or less." }),
  actionItems: z.string().max(500, { message: "Action items must be 500 characters or less." }).optional(),
  color: z.enum(['green', 'yellow', 'red'], { required_error: "Please select a sentiment color." }),
});

export type RetroItemFormValues = z.infer<typeof formSchema>;

interface AddRetroItemFormProps {
  onSubmit: (values: RetroItemFormValues) => void;
}

export const AddRetroItemForm: FC<AddRetroItemFormProps> = ({ onSubmit }) => {
  const form = useForm<RetroItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whoAmI: '',
      whatToSay: '',
      actionItems: '',
      color: 'green', // Default selection
    },
  });

  const handleSubmit = (values: RetroItemFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <PlusCircle className="h-6 w-6 text-primary" />
          Add New Retro Item
        </CardTitle>
        <CardDescription>Share your feedback, thoughts, or suggestions for the team.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="whoAmI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who am I?</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name / Role (e.g., Developer, QA)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatToSay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What I want to say</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What went well? What could be improved? Any new ideas?" {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="actionItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action Items (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Specific actions to take based on your feedback." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Sentiment Color</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
                    >
                      {(['green', 'yellow', 'red'] as RetroItemColor[]).map((color) => (
                        <FormItem key={color} className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={color} id={`color-${color}`} />
                          </FormControl>
                          <Label htmlFor={`color-${color}`} className={`font-medium capitalize ${
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
                  <FormDescription>Choose a color that reflects the sentiment of your item.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Item
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
