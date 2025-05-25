import type { Timestamp } from 'firebase/firestore';
import * as z from 'zod';

export type RetroItemColor = 'green' | 'yellow' | 'red';

// Represents a Sprint
export interface Sprint {
  id: string;
  name: string;
  createdAt: Date; // Consistently Date on client
}

export interface RetroItem {
  id:string;
  sprintId: string; // ID of the sprint this item belongs to
  whoAmI: string;
  whatToSay: string;
  actionItems: string;
  color: RetroItemColor;
  createdAt: Date; // Consistently Date on client
  updatedAt: Date; // Consistently Date on client
}

export const retroItemFormSchema = z.object({
  whoAmI: z.string().min(1, { message: "אנא הזן מי אתה או תפקיד בצוות." }).max(50, { message: "שם/תפקיד חייב להכיל 50 תווים או פחות." }),
  whatToSay: z.string().min(1, { message: "שדה זה אינו יכול להיות ריק." }).max(500, { message: "ההודעה חייבת להכיל 500 תווים או פחות." }),
  actionItems: z.string().max(500, { message: "פריטי פעולה חייבים להכיל 500 תווים או פחות." }).optional().default(''),
  color: z.enum(['green', 'yellow', 'red'], { required_error: "אנא בחר צבע סנטימנט." }),
}).superRefine((data, ctx) => {
  if (data.color === 'red' && (!data.actionItems || data.actionItems.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "פריטי פעולה נדרשים כאשר הסנטימנט הוא אדום.",
      path: ['actionItems'],
    });
  }
});

export type RetroItemFormValues = z.infer<typeof retroItemFormSchema>;

export const sprintFormSchema = z.object({
  name: z.string().min(1, { message: "שם הספרינט לא יכול להיות ריק."}).max(100, { message: "שם הספרינט יכול להכיל עד 100 תווים."}),
});

export type SprintFormValues = z.infer<typeof sprintFormSchema>;
