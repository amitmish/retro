"use client";

import type { FC } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import type { RetroItem } from '@/types/retro';

interface RetroTableProps {
  items: RetroItem[];
}

export const RetroTable: FC<RetroTableProps> = ({ items }) => {
  return (
    <Card className="w-full max-w-4xl shadow-xl mt-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ListChecks className="h-6 w-6 text-primary" />
          Retro Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <Table>
            {items.length === 0 && (
              <TableCaption className="py-8 text-lg">No retro items yet. Add some above!</TableCaption>
            )}
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] font-semibold">Who am I?</TableHead>
                <TableHead className="font-semibold">What I want to say</TableHead>
                <TableHead className="font-semibold">Action Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} data-row-color={item.color}>
                  <TableCell className="font-medium break-words whitespace-normal align-top">{item.whoAmI}</TableCell>
                  <TableCell className="break-words whitespace-normal align-top">{item.whatToSay}</TableCell>
                  <TableCell className="break-words whitespace-normal align-top">{item.actionItems || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
