import { useMemo } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  isRTLLanguage,
  getTextDirection,
  generateRTLClasses,
  createDirectionalStyles,
  rtlUtils,
  getIconRotation,
  type TextDirection,
} from '@/lib/utils/rtl';

/**
 * Hook for RTL state and direction utilities
 */
export function useRTL() {
  const { language } = useLanguage();

  const isRTL = useMemo(() => isRTLLanguage(language), [language]);
  const direction = useMemo(() => getTextDirection(language), [language]);

  return {
    isRTL,
    direction,
    language,
  };
}

/**
 * Hook for RTL-aware CSS classes
 */
export function useRTLClasses() {
  const { isRTL } = useRTL();

  const classes = useMemo(() => generateRTLClasses(isRTL), [isRTL]);

  return classes;
}

/**
 * Hook for direction-aware inline styles
 */
export function useDirectionalStyles() {
  const { isRTL } = useRTL();

  const styles = useMemo(() => createDirectionalStyles(isRTL), [isRTL]);

  return styles;
}

/**
 * Hook for RTL utility functions
 */
export function useRTLUtils() {
  const { isRTL } = useRTL();

  const utils = useMemo(
    () => ({
      // Spacing utilities bound to current RTL state
      marginLeft: (value: string) => rtlUtils.marginLeft(isRTL, value),
      marginRight: (value: string) => rtlUtils.marginRight(isRTL, value),
      marginStart: (value: string) => rtlUtils.marginStart(isRTL, value),
      marginEnd: (value: string) => rtlUtils.marginEnd(isRTL, value),

      paddingLeft: (value: string) => rtlUtils.paddingLeft(isRTL, value),
      paddingRight: (value: string) => rtlUtils.paddingRight(isRTL, value),
      paddingStart: (value: string) => rtlUtils.paddingStart(isRTL, value),
      paddingEnd: (value: string) => rtlUtils.paddingEnd(isRTL, value),

      borderLeft: (value: string) => rtlUtils.borderLeft(isRTL, value),
      borderRight: (value: string) => rtlUtils.borderRight(isRTL, value),
      borderStart: (value: string) => rtlUtils.borderStart(isRTL, value),
      borderEnd: (value: string) => rtlUtils.borderEnd(isRTL, value),

      left: (value: string) => rtlUtils.left(isRTL, value),
      right: (value: string) => rtlUtils.right(isRTL, value),

      translateX: (value: string) => rtlUtils.translateX(isRTL, value),
      textAlign: (align: 'start' | 'end' | 'left' | 'right' | 'center') =>
        rtlUtils.textAlign(isRTL, align),
      flexDirection: (direction: 'row' | 'column' | 'row-reverse' | 'column-reverse') =>
        rtlUtils.flexDirection(isRTL, direction),
    }),
    [isRTL]
  );

  return utils;
}

/**
 * Hook for icon rotation based on RTL state
 */
export function useIconRotation(iconType: 'arrow' | 'chevron' | 'caret') {
  const { isRTL } = useRTL();

  const rotation = useMemo(() => getIconRotation(isRTL, iconType), [isRTL, iconType]);

  return rotation;
}

/**
 * Hook for creating bidirectional class utilities
 */
export function useBidiClass() {
  const { isRTL } = useRTL();

  const bidiClass = useMemo(
    () => (ltrClass: string, rtlClass?: string) => {
      if (isRTL) {
        return (
          rtlClass ||
          ltrClass.replace(/^(ml-|mr-|pl-|pr-|left-|right-|text-left|text-right)/, match => {
            const replacements: Record<string, string> = {
              'ml-': 'mr-',
              'mr-': 'ml-',
              'pl-': 'pr-',
              'pr-': 'pl-',
              'left-': 'right-',
              'right-': 'left-',
              'text-left': 'text-right',
              'text-right': 'text-left',
            };
            return replacements[match] || match;
          })
        );
      }
      return ltrClass;
    },
    [isRTL]
  );

  return bidiClass;
}

/**
 * Hook for direction-aware layout calculations
 */
export function useLayoutDirection() {
  const { isRTL, direction } = useRTL();

  const layout = useMemo(
    () => ({
      // Flex utilities
      flexStart: isRTL ? 'flex-end' : 'flex-start',
      flexEnd: isRTL ? 'flex-start' : 'flex-end',
      justifyStart: isRTL ? 'justify-end' : 'justify-start',
      justifyEnd: isRTL ? 'justify-start' : 'justify-end',

      // Text alignment
      textStart: isRTL ? 'text-right' : 'text-left',
      textEnd: isRTL ? 'text-left' : 'text-right',

      // Float utilities
      floatStart: isRTL ? 'float-right' : 'float-left',
      floatEnd: isRTL ? 'float-left' : 'float-right',

      // Transform utilities
      scaleX: isRTL ? 'scale-x-[-1]' : 'scale-x-[1]',

      // Direction attributes
      dirAttributes: {
        dir: direction,
        'data-direction': direction,
        'data-rtl': isRTL,
      },
    }),
    [isRTL, direction]
  );

  return layout;
}

/**
 * Hook for animated transitions that respect RTL direction
 */
export function useRTLTransitions() {
  const { isRTL } = useRTL();

  const transitions = useMemo(
    () => ({
      // Slide transitions
      slideInLeft: isRTL ? 'animate-slide-in-right' : 'animate-slide-in-left',
      slideInRight: isRTL ? 'animate-slide-in-left' : 'animate-slide-in-right',
      slideOutLeft: isRTL ? 'animate-slide-out-right' : 'animate-slide-out-left',
      slideOutRight: isRTL ? 'animate-slide-out-left' : 'animate-slide-out-right',

      // Transform origins
      transformOriginLeft: isRTL ? 'origin-right' : 'origin-left',
      transformOriginRight: isRTL ? 'origin-left' : 'origin-right',

      // Custom transforms for RTL
      enterFromLeft: isRTL ? 'translate-x-full' : '-translate-x-full',
      enterFromRight: isRTL ? '-translate-x-full' : 'translate-x-full',
      exitToLeft: isRTL ? 'translate-x-full' : '-translate-x-full',
      exitToRight: isRTL ? '-translate-x-full' : 'translate-x-full',
    }),
    [isRTL]
  );

  return transitions;
}

/**
 * Hook for form field direction handling
 */
export function useFormDirection() {
  const { isRTL, direction } = useRTL();

  const formProps = useMemo(
    () => ({
      // Input direction
      inputDir: direction,
      textDirection: direction,

      // Label alignment
      labelAlign: isRTL ? 'text-right' : 'text-left',

      // Help text alignment
      helpTextAlign: isRTL ? 'text-right' : 'text-left',

      // Field grouping
      fieldsetDirection: isRTL ? 'rtl' : 'ltr',

      // Error message alignment
      errorAlign: isRTL ? 'text-right' : 'text-left',
    }),
    [isRTL, direction]
  );

  return formProps;
}

/**
 * Hook for handling mixed bidirectional content
 */
export function useBidiContent() {
  const { direction } = useRTL();

  const bidi = useMemo(
    () => ({
      // Wrap content with proper Unicode markers
      wrapContent: (content: string, contentDir?: TextDirection) => {
        const actualDir = contentDir || direction;
        if (actualDir === 'rtl') {
          return `\u202B${content}\u202C`; // RLE + content + PDF
        }
        return `\u202A${content}\u202C`; // LRE + content + PDF
      },

      // Force direction override
      forceDirection: (content: string, forceDir: TextDirection) => {
        const override = forceDir === 'rtl' ? '\u202E' : '\u202D';
        return `${override}${content}\u202C`; // Override + content + PDF
      },

      // Isolate content (useful for user-generated content)
      isolate: (content: string) => {
        return `\u2066${content}\u2069`; // FSI + content + PDI
      },

      // Mark as neutral (for numbers, URLs, etc.)
      neutral: (content: string) => {
        return content; // Let Unicode algorithm handle it
      },
    }),
    [direction]
  );

  return bidi;
}
