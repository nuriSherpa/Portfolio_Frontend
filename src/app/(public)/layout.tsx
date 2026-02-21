// src/app/(public)/layout.tsx - SIMPLIFIED NO COOLDOWN/VISITOR
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ConnectionProvider } from '@/components/providers/connection-provider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </ConnectionProvider>
  );
}
