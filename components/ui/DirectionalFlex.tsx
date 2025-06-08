import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useRTL } from '@/lib/hooks/useRTL';

export interface DirectionalFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Flex direction - will be automatically reversed for RTL when appropriate
   */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';

  /**
   * Whether to reverse row direction in RTL mode (default: true)
   */
  reverseInRTL?: boolean;

  /**
   * Justify content - start/end will be direction-aware
   */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

  /**
   * Align items - start/end will be direction-aware
   */
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';

  /**
   * Gap between items
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /**
   * Whether items should wrap
   */
  wrap?: boolean;

  /**
   * Force a specific direction regardless of current language
   */
  forceDirection?: 'ltr' | 'rtl';
}

/**
 * A flex container that automatically handles RTL direction switching
 */
export const DirectionalFlex = forwardRef<HTMLDivElement, DirectionalFlexProps>(
  (
    {
      className,
      children,
      direction = 'row',
      reverseInRTL = true,
      justify = 'start',
      align = 'center',
      gap = 'md',
      wrap = false,
      forceDirection,
      style,
      ...props
    },
    ref
  ) => {
    const { isRTL, direction: currentDirection } = useRTL();

    // Determine effective direction
    const effectiveIsRTL = forceDirection ? forceDirection === 'rtl' : isRTL;

    // Calculate flex direction
    const getFlexDirection = () => {
      if (direction === 'column' || direction === 'column-reverse') {
        return direction; // Column directions don't change with RTL
      }

      if (!reverseInRTL || !effectiveIsRTL) {
        return direction;
      }

      // Reverse row directions for RTL
      if (direction === 'row') return 'row-reverse';
      if (direction === 'row-reverse') return 'row';

      return direction;
    };

    // Calculate justify content classes
    const getJustifyClass = () => {
      const baseClass = 'justify-';

      switch (justify) {
        case 'start':
          return effectiveIsRTL && (direction === 'row' || direction === 'row-reverse')
            ? `${baseClass}end`
            : `${baseClass}start`;
        case 'end':
          return effectiveIsRTL && (direction === 'row' || direction === 'row-reverse')
            ? `${baseClass}start`
            : `${baseClass}end`;
        case 'center':
          return `${baseClass}center`;
        case 'between':
          return `${baseClass}between`;
        case 'around':
          return `${baseClass}around`;
        case 'evenly':
          return `${baseClass}evenly`;
        default:
          return `${baseClass}start`;
      }
    };

    // Calculate align items classes
    const getAlignClass = () => {
      const baseClass = 'items-';

      switch (align) {
        case 'start':
          return `${baseClass}start`;
        case 'end':
          return `${baseClass}end`;
        case 'center':
          return `${baseClass}center`;
        case 'baseline':
          return `${baseClass}baseline`;
        case 'stretch':
          return `${baseClass}stretch`;
        default:
          return `${baseClass}center`;
      }
    };

    // Calculate gap class
    const getGapClass = () => {
      const gapMap = {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
      };

      return gapMap[gap] || 'gap-4';
    };

    // Calculate flex direction class
    const getFlexDirectionClass = () => {
      const flexDir = getFlexDirection();

      switch (flexDir) {
        case 'row':
          return 'flex-row';
        case 'row-reverse':
          return 'flex-row-reverse';
        case 'column':
          return 'flex-col';
        case 'column-reverse':
          return 'flex-col-reverse';
        default:
          return 'flex-row';
      }
    };

    const flexClasses = cn(
      'flex',
      getFlexDirectionClass(),
      getJustifyClass(),
      getAlignClass(),
      getGapClass(),
      wrap && 'flex-wrap',
      className
    );

    const effectiveDirection = forceDirection || currentDirection;

    return (
      <div
        ref={ref}
        className={flexClasses}
        style={style}
        dir={effectiveDirection}
        data-direction={effectiveDirection}
        data-rtl={effectiveIsRTL}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DirectionalFlex.displayName = 'DirectionalFlex';
