'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import AdminNav from '@/components/layout/adminNav';
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


export default function RootLayout({ children }) {
  const pathname = usePathname();
  const queryClient = new QueryClient();

  const hideLayout =
    pathname === '/' || pathname === '/admin/signup' || pathname === '/reset-password';

  return (
    <html lang="ko">
      <body>
        <QueryClientProvider client={queryClient}>
        {hideLayout ? (
          <>{children}</>
        ) : (
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
              {/* 전역 상단 AdminNav */}
              <AdminNav />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        )}
      </QueryClientProvider>
      </body>
    </html>
  );
}
