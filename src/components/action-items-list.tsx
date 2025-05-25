
"use client";

import type { FC } from 'react';
import type { RetroItem, RetroItemColor } from '@/types/retro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, UserCircle, Palette, ArrowRightCircle, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const handleExportToPdf = () => {
    const input = document.getElementById('action-items-card');
    const exportButton = document.getElementById('export-pdf-button');

    if (input) {
      if (exportButton) (exportButton as HTMLElement).style.display = 'none';

      html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false, // Disable logging for cleaner console
        onclone: (documentClone) => {
          // Ensure the cloned document also has RTL direction for PDF rendering
          documentClone.documentElement.dir = 'rtl';
          documentClone.body.dir = 'rtl';
          // Apply specific styles for PDF rendering if needed
          const elementsToStyle = documentClone.querySelectorAll('p, span, div, li, h5');
           elementsToStyle.forEach(el => {
            (el as HTMLElement).style.textAlign = 'right';
          });
        }
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;

        const ratio = imgWidth / imgHeight;
        let newImgWidth = pdfWidth - 20; // 10mm margin on each side
        let newImgHeight = newImgWidth / ratio;

        if (newImgHeight > pdfHeight - 20) {
          newImgHeight = pdfHeight - 20; // 10mm margin top/bottom
          newImgWidth = newImgHeight * ratio;
        }
        
        const x = (pdfWidth - newImgWidth) / 2;
        const y = 10;

        pdf.addImage(imgData, 'PNG', x, y, newImgWidth, newImgHeight);
        pdf.save('retro-action-items.pdf');

        if (exportButton) (exportButton as HTMLElement).style.display = '';
      }).catch(err => {
        console.error("שגיאה ביצירת PDF:", err);
        if (exportButton) (exportButton as HTMLElement).style.display = '';
      });
    }
  };


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
    <Card className="mt-12 w-full shadow-xl" id="action-items-card">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-3 text-primary">
          <ListChecks className="h-7 w-7 ml-2" /> 
          <CardTitle className="text-2xl">
            פריטי פעולה מאוחדים
          </CardTitle>
        </div>
        <Button 
          id="export-pdf-button"
          onClick={handleExportToPdf} 
          variant="outline" 
          size="sm"
        >
          <FileDown size={16} className="ml-2" /> 
          ייצא ל-PDF
        </Button>
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
                <ArrowRightCircle size={16} className="ml-2" /> 
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
