'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icons } from '@/components/ui/Icons';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslation } from '@/lib/hooks/useTranslation';

/**
 * Header component with navigation, theme toggle, and language switcher
 */
export default function Header() {
  const { theme, setTheme } = useTheme();
  const { t, isRTL, getDirectionalClass } = useTranslation('common');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div
          className={`flex h-16 items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center space-x-2 ${getDirectionalClass('space-x-2', 'space-x-reverse')}`}
          >
            <Icons.sparkles className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-primary to-gold-500 bg-clip-text text-transparent">
              GemsAI
            </span>
          </Link>

          {/* Navigation */}
          <nav
            className={`hidden md:flex items-center text-sm font-medium ${getDirectionalClass('space-x-6', 'space-x-reverse')}`}
          >
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('navigation.dashboard')}
            </Link>
            <Link
              href="/story/new"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('actions.create')} {t('navigation.stories')}
            </Link>
            <Link
              href="/dashboard/stories"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('navigation.stories')}
            </Link>
          </nav>

          {/* Actions */}
          <div
            className={`flex items-center ${getDirectionalClass('space-x-2', 'space-x-reverse')}`}
          >
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              <Icons.sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Icons.moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Menu */}
            <Button variant="ghost" size="icon">
              <Icons.user className="h-4 w-4" />
            </Button>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Icons.menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
