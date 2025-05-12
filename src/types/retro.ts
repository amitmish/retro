export type RetroItemColor = 'green' | 'yellow' | 'red';

export interface RetroItem {
  id: string;
  whoAmI: string;
  whatToSay: string;
  actionItems: string;
  color: RetroItemColor;
}
