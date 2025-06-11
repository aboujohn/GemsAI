'use client';

import React from 'react';
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import Link from 'next/link';

export const MainNavigation = () => {

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-rose-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <Icons.gem className="h-8 w-8 text-rose-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              GemsAI
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-rose-600"
              >
                <Icons.home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/story/new">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-rose-600"
              >
                <Icons.heart className="mr-2 h-4 w-4" />
                Tell Story
              </Button>
            </Link>
            <Link href="/dashboard/stories">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-rose-600"
              >
                <Icons.shoppingCart className="mr-2 h-4 w-4" />
                Browse
              </Button>
            </Link>
            <Link href="/gift/create">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-rose-600"
              >
                <Icons.gift className="mr-2 h-4 w-4" />
                Create Gift
              </Button>
            </Link>
          </div>

          {/* Business Tools */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-700 hover:text-amber-600"
              >
                <Icons.users className="mr-1 h-4 w-4" />
                Jewelers
              </Button>
            </Link>
            <Link href="/admin">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-700 hover:text-indigo-600"
              >
                <Icons.barChart3 className="mr-1 h-4 w-4" />
                Admin
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 flex flex-wrap gap-2">
          <Link href="/story/new">
            <Button 
              variant="outline" 
              size="sm"
            >
              <Icons.heart className="mr-1 h-3 w-3" />
              Story
            </Button>
          </Link>
          <Link href="/dashboard/stories">
            <Button 
              variant="outline" 
              size="sm"
            >
              <Icons.shoppingCart className="mr-1 h-3 w-3" />
              Browse
            </Button>
          </Link>
          <Link href="/gift/create">
            <Button 
              variant="outline" 
              size="sm"
            >
              <Icons.gift className="mr-1 h-3 w-3" />
              Gift
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              size="sm"
            >
              <Icons.users className="mr-1 h-3 w-3" />
              Jewelers
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};