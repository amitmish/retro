import type { Metadata } from 'next';
import RetroBoardClient from '@/components/retro-board-client';
import { QueryClientProvider } from '@/components/query-client-provider';


export const metadata: Metadata = {
  title: 'Retro Board',
  description: 'A collaborative board for team retrospectives.',
};

export default function RetroBoardPage() {
  return (
    <main className="container mx-auto py-8 px-4 min-h-screen flex flex-col items-center">
      <header className="mb-6 text-center w-full max-w-6xl">
        <h1 className="text-5xl font-bold tracking-tight text-primary">Retro Board</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Event Management Retro
        </p>
      </header>
      <QueryClientProvider>
        <RetroBoardClient />
      </QueryClientProvider>
    </main>
  );
}

