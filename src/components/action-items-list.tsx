
"use client";

import type { FC } from 'react';
import type { RetroItem, RetroItemColor } from '@/types/retro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, UserCircle, Palette, ArrowRightCircle } from 'lucide-react';

interface ActionItemsListProps {
  items: RetroItem[];
  onActionItemClick: (itemId: string) => void;
}

const colorDisplayNames: Record<RetroItemColor, string> = {
  green: 'להמשיך לעשות',
  yellow: 'לשים לב',
  red: 'לשנות את זה',
};

const colorClasses: Record<RetroItemColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

const ActionItemsList: FC<ActionItemsListProps> = ({ items, onActionItemClick }) => {
  const actionItems = items.filter(item => item.actionItems && item.actionItems.trim() !== '');

  if (actionItems.length === 0) {
    return (
      <div className="mt-12 w-full text-center text-muted-foreground py-8">
        <ListChecks size={48} className="mx-auto mb-4 text-primary/30" />
        <p className="text-xl font-semibold">אין עדיין פריטי פעולה</p>
        <p>הוסף הערות עם פריטי פעולה, והם יופיעו כאן.</p>
      </div>
    );
  }

  return (
    <Card className="mt-12 w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl gap-3 text-primary">
          <ListChecks className="h-7 w-7 ml-2" /> {/* Adjusted margin for RTL */}
          פריטי פעולה מאוחדים
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {actionItems.map((item) => (
            <li key={item.id} className="border rounded-lg shadow-sm bg-card overflow-hidden">
              <div className="p-4">
                <p className="text-lg font-medium text-foreground/90 break-words whitespace-pre-wrap">
                  {item.actionItems}
                </p>
                <div className="mt-3 text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5">
                    <UserCircle size={16} /> 
                    מאת: <span className="font-medium text-foreground/80">{item.whoAmI}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Palette size={16} /> 
                    סנטימנט ההערה: 
                    <span className="flex items-center gap-1">
                       <span className={`inline-block h-3 w-3 rounded-full ${colorClasses[item.color]}`}></span>
                       <span className="font-medium text-foreground/80">{colorDisplayNames[item.color]}</span>
                    </span>
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onActionItemClick(item.id)}
                className="w-full justify-start rounded-t-none rounded-b-md text-primary hover:bg-primary/10"
                aria-label={`עבור להערה מאת ${item.whoAmI} הקשורה לפעולה: ${item.actionItems?.substring(0,30)}...`}
              >
                <ArrowRightCircle size={16} className="ml-2" /> {/* Adjusted margin for RTL */}
                מעבר להערה המקורית
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ActionItemsList;
