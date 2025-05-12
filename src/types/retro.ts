import * as z from 'zod';

export type RetroItemColor = 'green' | 'yellow' | 'red';

export interface RetroItem {
  id: string;
  whoAmI: string;
  whatToSay: string;
  actionItems: string;
  color: RetroItemColor;
}

export const retroItemFormSchema = z.object({
  whoAmI: z.string().min(1, { message: "Please enter who you are or a team role." }).max(50, { message: "Name/role must be 50 characters or less." }),
  whatToSay: z.string().min(1, { message: "This field cannot be empty." }).max(500, { message: "Message must be 500 characters or less." }),
  actionItems: z.string().max(500, { message: "Action items must be 500 characters or less." }).optional().default(''),
  color: z.enum(['green', 'yellow', 'red'], { required_error: "Please select a sentiment color." }),
});

export type RetroItemFormValues = z.infer<typeof retroItemFormSchema>;
