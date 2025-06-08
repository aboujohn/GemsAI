// EnumText Components - Display enum translations with automatic fallback
// Provides type-safe access to database enum translations

'use client';

import { useEnumTranslation } from '@/lib/hooks/useI18nDatabase';
import { cn } from '@/lib/utils';

// Base enum text component
interface EnumTextProps {
  enumType: string;
  enumValue: string;
  fallback?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EnumText({ enumType, enumValue, fallback, className, children }: EnumTextProps) {
  const { translation, loading } = useEnumTranslation(enumType, enumValue, fallback);

  if (loading) {
    return (
      <span className={cn('animate-pulse bg-gray-200 rounded', className)}>
        {fallback || enumValue}
      </span>
    );
  }

  return (
    <span className={className}>
      {translation}
      {children}
    </span>
  );
}

// Specific enum type components for better type safety

export type OrderStatusType = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'shipped';

interface OrderStatusProps {
  status: OrderStatusType;
  className?: string;
}

export function OrderStatus({ status, className }: OrderStatusProps) {
  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-50',
    confirmed: 'text-blue-600 bg-blue-50',
    in_progress: 'text-orange-600 bg-orange-50',
    completed: 'text-green-600 bg-green-50',
    shipped: 'text-purple-600 bg-purple-50',
  };

  return (
    <EnumText
      enumType="order_status"
      enumValue={status}
      className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[status], className)}
    />
  );
}

export type UserRoleType = 'user' | 'jeweler' | 'admin';

interface UserRoleProps {
  role: UserRoleType;
  className?: string;
}

export function UserRole({ role, className }: UserRoleProps) {
  const roleColors = {
    user: 'text-gray-600 bg-gray-50',
    jeweler: 'text-indigo-600 bg-indigo-50',
    admin: 'text-red-600 bg-red-50',
  };

  return (
    <EnumText
      enumType="user_role"
      enumValue={role}
      className={cn('px-2 py-1 rounded-full text-xs font-medium', roleColors[role], className)}
    />
  );
}

export type ProductCategoryType = 'rings' | 'necklaces' | 'earrings' | 'bracelets';

interface ProductCategoryProps {
  category: ProductCategoryType;
  className?: string;
}

export function ProductCategory({ category, className }: ProductCategoryProps) {
  return (
    <EnumText
      enumType="product_category"
      enumValue={category}
      className={cn('text-sm font-medium text-gray-700', className)}
    />
  );
}

export type JewelryStyleType = 'classic' | 'modern' | 'vintage' | 'minimalist' | 'bohemian';

interface JewelryStyleProps {
  style: JewelryStyleType;
  className?: string;
}

export function JewelryStyle({ style, className }: JewelryStyleProps) {
  return (
    <EnumText
      enumType="jewelry_style"
      enumValue={style}
      className={cn('text-sm text-gray-600', className)}
    />
  );
}

export type MaterialType = 'gold' | 'silver' | 'platinum' | 'diamond' | 'pearl' | 'gemstone';

interface MaterialProps {
  material: MaterialType;
  className?: string;
}

export function Material({ material, className }: MaterialProps) {
  const materialColors = {
    gold: 'text-yellow-700',
    silver: 'text-gray-600',
    platinum: 'text-gray-800',
    diamond: 'text-blue-600',
    pearl: 'text-purple-600',
    gemstone: 'text-green-600',
  };

  return (
    <EnumText
      enumType="material"
      enumValue={material}
      className={cn('text-sm font-medium', materialColors[material], className)}
    />
  );
}

export type EmotionType = 'love' | 'celebration' | 'remembrance' | 'achievement' | 'friendship';

interface EmotionProps {
  emotion: EmotionType;
  className?: string;
}

export function Emotion({ emotion, className }: EmotionProps) {
  const emotionColors = {
    love: 'text-red-600',
    celebration: 'text-yellow-600',
    remembrance: 'text-blue-600',
    achievement: 'text-green-600',
    friendship: 'text-purple-600',
  };

  return (
    <EnumText
      enumType="emotion"
      enumValue={emotion}
      className={cn('text-sm font-medium', emotionColors[emotion], className)}
    />
  );
}
