import type { Timestamp } from 'firebase/firestore';
import * as z from 'zod';

export type RetroItemColor = 'green' | 'yellow' | 'red';

export interface RetroItem {
  id: string;
  whoAmI: string;
  whatToSay: string;
  actionItems: string;
  color: RetroItemColor;
  createdAt?: Date | Timestamp; // Can be Date from server or Timestamp before conversion
  updatedAt?: Date | Timestamp; // Can be Date from server or Timestamp before conversion
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
