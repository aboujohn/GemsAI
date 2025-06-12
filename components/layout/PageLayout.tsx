'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';

type PageLayoutProps = {
  children: React.ReactNode;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | '2xl';
  className?: string;
  containerClassName?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
};

/**
 * PageLayout component to wrap pages with consistent header, footer, and container
 */
export default function PageLayout({
  children,
  containerSize = 'lg',
  className,
  containerClassName,
  hideHeader = false,
  hideFooter = false,
}: PageLayoutProps) {
  return (
    <div className={cn('flex flex-col min-h-screen', className)}>
      {!hideHeader && <Header />}

      <main className="flex-grow">
        <Container size={containerSize} className={containerClassName}>
          {children}
        </Container>
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}

export { PageLayout };
