'use client';

import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Icons } from '@/components/ui/Icons';

/**
 * Footer component with links and branding
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <Container>
        <div className="py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Icons.sparkles className="h-6 w-6 text-primary" />
                <span className="font-bold bg-gradient-to-r from-primary to-gold-500 bg-clip-text text-transparent">
                  GemsAI
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform your stories into meaningful jewelry with the power of AI.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/story/new" className="text-muted-foreground hover:text-foreground transition-colors">
                    Create Story
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/stories" className="text-muted-foreground hover:text-foreground transition-colors">
                    My Stories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Connect</h3>
              <div className="flex space-x-4">
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Follow us on Twitter"
                >
                  <Icons.globe className="h-5 w-5" />
                </Link>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Email us"
                >
                  <Icons.mail className="h-5 w-5" />
                </Link>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Call us"
                >
                  <Icons.phone className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <p className="text-sm text-muted-foreground">
                © {currentYear} GemsAI. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Made with <Icons.heart className="inline h-4 w-4 text-red-500" /> for jewelry lovers
              </p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
