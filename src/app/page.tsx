import type { Metadata } from 'next';
import RetroBoardClient from '@/components/retro-board-client';
import { QueryClientProvider } from '@/components/query-client-provider';


export const metadata: Metadata = {
  title: 'לוח רטרו מתקדם', // Generic title, RetroBoardClient will handle dynamic titles
  description: 'לוח שיתופי לרטרוספקטיבות צוות עם ניהול ספרינטים.',
};

export default function RetroBoardPage() {
  return (
    // container and mx-auto are removed here as RetroBoardClient will manage its own max-width
    <main className="py-8 px-4 min-h-screen flex flex-col items-center">
      <QueryClientProvider>
        <RetroBoardClient />
      </QueryClientProvider>
    </main>
  );
}
