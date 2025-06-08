import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useRTL, useLayoutDirection } from '@/lib/hooks/useRTL';

export interface DirectionalContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to reverse flex direction in RTL mode
   */
  reverseInRTL?: boolean;
  
  /**
   * Whether to apply text alignment based on direction
   */
  alignText?: boolean;
  
  /**
   * Custom RTL class to override default behavior
   */
  rtlClass?: string;
  
  /**
   * Custom LTR class
   */
  ltrClass?: string;
  
  /**
   * Force a specific direction regardless of current language
   */
  forceDirection?: 'ltr' | 'rtl';
  
  /**
   * Apply padding/margin in a direction-aware manner
   */
  spacing?: {
    paddingStart?: string;
    paddingEnd?: string;
    marginStart?: string;
    marginEnd?: string;
  };
}

/**
 * A container component that automatically handles RTL/LTR layout switching
 */
export const DirectionalContainer = forwardRef<HTMLDivElement, DirectionalContainerProps>(
  ({ 
    className,
    children,
    reverseInRTL = false,
    alignText = false,
    rtlClass,
    ltrClass,
    forceDirection,
    spacing,
    style,
    ...props 
  }, ref) => {
    const { isRTL, direction } = useRTL();
    const layout = useLayoutDirection();
    
    // Determine effective direction
    const effectiveDirection = forceDirection || direction;
    const effectiveIsRTL = forceDirection ? forceDirection === 'rtl' : isRTL;
    
    // Build dynamic classes
    const directionClasses = cn(
      // Base direction class
      effectiveIsRTL ? 'rtl' : 'ltr',
      
      // Flex direction handling
      reverseInRTL && effectiveIsRTL && 'flex-row-reverse',
      
      // Text alignment
      alignText && (effectiveIsRTL ? 'text-right' : 'text-left'),
      
      // Custom classes based on direction
      effectiveIsRTL ? rtlClass : ltrClass,
      
      className
    );
    
    // Build dynamic styles
    const directionStyles = {
      direction: effectiveDirection,
      ...style,
      
      // Apply spacing if provided
      ...(spacing?.paddingStart && {
        [effectiveIsRTL ? 'paddingRight' : 'paddingLeft']: spacing.paddingStart,
      }),
      ...(spacing?.paddingEnd && {
        [effectiveIsRTL ? 'paddingLeft' : 'paddingRight']: spacing.paddingEnd,
      }),
      ...(spacing?.marginStart && {
        [effectiveIsRTL ? 'marginRight' : 'marginLeft']: spacing.marginStart,
      }),
      ...(spacing?.marginEnd && {
        [effectiveIsRTL ? 'marginLeft' : 'marginRight']: spacing.marginEnd,
      }),
    };
    
    return (
      <div
        ref={ref}
        className={directionClasses}
        style={directionStyles}
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

DirectionalContainer.displayName = 'DirectionalContainer'; 