'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';

interface CartButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function CartButton({ 
  variant = 'outline', 
  size = 'md', 
  showText = false 
}: CartButtonProps) {
  const { cartSummary } = useCart();
  const { t } = useTranslation();

  const handleCartClick = () => {
    window.location.href = '/checkout';
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCartClick}
      className="relative"
    >
      <DirectionalFlex className="items-center gap-2">
        <div className="relative">
          <Icons.ShoppingBag className="h-5 w-5" />
          {cartSummary.itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {cartSummary.itemCount > 99 ? '99+' : cartSummary.itemCount}
            </Badge>
          )}
        </div>
        {showText && (
          <span className="hidden sm:inline">
            {t('common.actions.checkout')}
          </span>
        )}
      </DirectionalFlex>
    </Button>
  );
}