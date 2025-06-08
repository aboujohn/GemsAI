import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useRTL, useFormDirection, useBidiContent } from '@/lib/hooks/useRTL';

export interface DirectionalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Force a specific text direction for the input content
   */
  contentDirection?: 'ltr' | 'rtl' | 'auto';
  
  /**
   * Whether to align text based on content direction
   */
  alignWithContent?: boolean;
  
  /**
   * Whether this input contains mixed bidirectional content
   */
  hasMixedContent?: boolean;
  
  /**
   * Isolate input content from surrounding text direction
   */
  isolateContent?: boolean;
  
  /**
   * Input type for special handling
   */
  inputType?: 'text' | 'email' | 'url' | 'password' | 'search' | 'tel' | 'number';
}

/**
 * An input component that handles RTL/LTR text direction automatically
 */
export const DirectionalInput = forwardRef<HTMLInputElement, DirectionalInputProps>(
  ({ 
    className,
    contentDirection = 'auto',
    alignWithContent = true,
    hasMixedContent = false,
    isolateContent = false,
    inputType = 'text',
    style,
    value,
    onChange,
    ...props 
  }, ref) => {
    const { isRTL, direction } = useRTL();
    const formProps = useFormDirection();
    const bidi = useBidiContent();
    
    // Determine text direction for input content
    const getContentDirection = () => {
      if (contentDirection === 'auto') {
        // For certain input types, force LTR
        if (['email', 'url', 'tel', 'number'].includes(inputType)) {
          return 'ltr';
        }
        return direction;
      }
      return contentDirection;
    };
    
    const actualContentDirection = getContentDirection();
    const contentIsRTL = actualContentDirection === 'rtl';
    
    // Calculate text alignment
    const getTextAlign = () => {
      if (!alignWithContent) return '';
      
      // For number inputs, always align right for LTR, left for RTL
      if (inputType === 'number') {
        return isRTL ? 'text-left' : 'text-right';
      }
      
      // For other inputs, align based on content direction
      return contentIsRTL ? 'text-right' : 'text-left';
    };
    
    // Handle value processing for bidirectional content
    const processValue = (val: string | number | readonly string[] | undefined) => {
      if (typeof val !== 'string' || !hasMixedContent) {
        return val;
      }
      
      if (isolateContent) {
        return bidi.isolate(val);
      }
      
      return val;
    };
    
    const inputClasses = cn(
      // Base input styles
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      
      // Direction-aware alignment
      getTextAlign(),
      
      // RTL-specific classes
      isRTL && 'rtl',
      
      className
    );
    
    const inputStyles = {
      direction: actualContentDirection,
      unicodeBidi: hasMixedContent ? 'isolate' : 'normal',
      ...style,
    };
    
    // Wrap onChange to handle bidirectional content
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };
    
    return (
      <input
        ref={ref}
        type={inputType}
        className={inputClasses}
        style={inputStyles}
        dir={actualContentDirection}
        value={processValue(value)}
        onChange={handleChange}
        data-direction={actualContentDirection}
        data-content-rtl={contentIsRTL}
        data-mixed-content={hasMixedContent}
        {...props}
      />
    );
  }
);

DirectionalInput.displayName = 'DirectionalInput'; 