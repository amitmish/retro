
"use client";

import type { FC } from 'react';
import type { RetroItem, RetroItemColor } from '@/types/retro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, UserCircle, Palette } from 'lucide-react';

interface ActionItemsListProps {
  items: RetroItem[];
}

const colorDisplayNames: Record<RetroItemColor, string> = {
  green: 'Keep Doing',
  yellow: 'Pay Attention',
  red: 'Change This',
};

const colorClasses: Record<RetroItemColor, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

const ActionItemsList: FC<ActionItemsListProps> = ({ items }) => {
  const actionItems = items.filter(item => item.actionItems && item.actionItems.trim() !== '');

  if (actionItems.length === 0) {
    return (
      <div className="mt-12 w-full text-center text-muted-foreground py-8">
        <ListChecks size={48} className="mx-auto mb-4 text-primary/30" />
        <p className="text-xl font-semibold">No Action Items Yet</p>
        <p>Add notes with action items, and they will appear here.</p>
      </div>
    );
  }

  return (
    <Card className="mt-12 w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl gap-3 text-primary">
          <ListChecks className="h-7 w-7" />
          Consolidated Action Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-6">
          {actionItems.map((item) => (
            <li key={item.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card">
              <p className="text-lg font-medium text-foreground/90 break-words whitespace-pre-wrap">
                {item.actionItems}
              </p>
              <div className="mt-3 text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <UserCircle size={16} /> 
                  From: <span className="font-medium text-foreground/80">{item.whoAmI}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Palette size={16} /> 
                  Note Sentiment: 
                  <span className="flex items-center gap-1">
                     <span className={`inline-block h-3 w-3 rounded-full ${colorClasses[item.color]}`}></span>
                     <span className="font-medium text-foreground/80">{colorDisplayNames[item.color]}</span>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ActionItemsList;
