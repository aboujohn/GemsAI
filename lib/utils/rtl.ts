/**
 * RTL (Right-to-Left) utilities for direction-aware styling and layout
 */

export type TextDirection = 'ltr' | 'rtl';
export type SupportedLanguage = 'he' | 'en';

/**
 * Languages that use RTL text direction
 */
export const RTL_LANGUAGES: SupportedLanguage[] = ['he'];

/**
 * Check if a language uses RTL text direction
 */
export function isRTLLanguage(language: string): boolean {
  return RTL_LANGUAGES.includes(language as SupportedLanguage);
}

/**
 * Get text direction for a language
 */
export function getTextDirection(language: string): TextDirection {
  return isRTLLanguage(language) ? 'rtl' : 'ltr';
}

/**
 * Direction-aware spacing utilities
 */
export const rtlUtils = {
  // Margin utilities
  marginLeft: (isRTL: boolean, value: string) =>
    isRTL ? { marginRight: value } : { marginLeft: value },

  marginRight: (isRTL: boolean, value: string) =>
    isRTL ? { marginLeft: value } : { marginRight: value },

  marginStart: (isRTL: boolean, value: string) =>
    isRTL ? { marginRight: value } : { marginLeft: value },

  marginEnd: (isRTL: boolean, value: string) =>
    isRTL ? { marginLeft: value } : { marginRight: value },

  // Padding utilities
  paddingLeft: (isRTL: boolean, value: string) =>
    isRTL ? { paddingRight: value } : { paddingLeft: value },

  paddingRight: (isRTL: boolean, value: string) =>
    isRTL ? { paddingLeft: value } : { paddingRight: value },

  paddingStart: (isRTL: boolean, value: string) =>
    isRTL ? { paddingRight: value } : { paddingLeft: value },

  paddingEnd: (isRTL: boolean, value: string) =>
    isRTL ? { paddingLeft: value } : { paddingRight: value },

  // Border utilities
  borderLeft: (isRTL: boolean, value: string) =>
    isRTL ? { borderRight: value } : { borderLeft: value },

  borderRight: (isRTL: boolean, value: string) =>
    isRTL ? { borderLeft: value } : { borderRight: value },

  borderStart: (isRTL: boolean, value: string) =>
    isRTL ? { borderRight: value } : { borderLeft: value },

  borderEnd: (isRTL: boolean, value: string) =>
    isRTL ? { borderLeft: value } : { borderRight: value },

  // Position utilities
  left: (isRTL: boolean, value: string) => (isRTL ? { right: value } : { left: value }),

  right: (isRTL: boolean, value: string) => (isRTL ? { left: value } : { right: value }),

  // Transform utilities
  translateX: (isRTL: boolean, value: string) =>
    isRTL ? { transform: `translateX(-${value})` } : { transform: `translateX(${value})` },

  // Text alignment
  textAlign: (isRTL: boolean, align: 'start' | 'end' | 'left' | 'right' | 'center') => {
    if (align === 'start') return { textAlign: isRTL ? 'right' : 'left' };
    if (align === 'end') return { textAlign: isRTL ? 'left' : 'right' };
    return { textAlign: align };
  },

  // Flex direction
  flexDirection: (
    isRTL: boolean,
    direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  ) => {
    if (direction === 'row') return { flexDirection: isRTL ? 'row-reverse' : 'row' };
    if (direction === 'row-reverse') return { flexDirection: isRTL ? 'row' : 'row-reverse' };
    return { flexDirection: direction };
  },
};

/**
 * Generate direction-aware CSS classes
 */
export function generateRTLClasses(isRTL: boolean) {
  const prefix = isRTL ? 'rtl' : 'ltr';

  return {
    // Direction classes
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'text-right' : 'text-left',

    // Spacing classes (using logical properties when possible)
    marginStart: `${prefix}:ms-auto`,
    marginEnd: `${prefix}:me-auto`,
    paddingStart: `${prefix}:ps-4`,
    paddingEnd: `${prefix}:pe-4`,

    // Flex utilities
    flexRowReverse: isRTL ? 'flex-row-reverse' : 'flex-row',
    spaceReverse: isRTL ? 'space-x-reverse' : '',

    // Custom RTL classes
    rtlRotate: isRTL ? 'rtl:rotate-180' : '',
    rtlMirror: isRTL ? 'rtl:scale-x-[-1]' : '',
  };
}

/**
 * Convert standard CSS class to RTL-aware version
 */
export function toRTLClass(className: string, isRTL: boolean): string {
  if (!isRTL) return className;

  // Replace directional classes with RTL equivalents
  const replacements: Record<string, string> = {
    // Margin
    'ml-': 'mr-',
    'mr-': 'ml-',
    'pl-': 'pr-',
    'pr-': 'pl-',
    // Border
    'border-l': 'border-r',
    'border-r': 'border-l',
    'rounded-l': 'rounded-r',
    'rounded-r': 'rounded-l',
    // Text alignment
    'text-left': 'text-right',
    'text-right': 'text-left',
    // Positioning
    'left-': 'right-',
    'right-': 'left-',
    // Flex
    'justify-start': 'justify-end',
    'justify-end': 'justify-start',
    'items-start': 'items-end',
    'items-end': 'items-start',
  };

  let result = className;
  for (const [ltr, rtl] of Object.entries(replacements)) {
    result = result.replace(new RegExp(ltr, 'g'), rtl);
  }

  return result;
}

/**
 * Create bidirectional CSS class utility
 */
export function bidiClass(ltrClass: string, rtlClass?: string) {
  return (isRTL: boolean) => {
    if (isRTL) {
      return rtlClass || toRTLClass(ltrClass, true);
    }
    return ltrClass;
  };
}

/**
 * CSS-in-JS style object for direction-aware styling
 */
export function createDirectionalStyles(isRTL: boolean) {
  return {
    container: {
      direction: isRTL ? 'rtl' : 'ltr',
    },
    text: {
      textAlign: isRTL ? 'right' : 'left',
      direction: isRTL ? 'rtl' : 'ltr',
    },
    flexRow: {
      display: 'flex',
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    marginStart: (value: string) => ({
      [isRTL ? 'marginRight' : 'marginLeft']: value,
    }),
    marginEnd: (value: string) => ({
      [isRTL ? 'marginLeft' : 'marginRight']: value,
    }),
    paddingStart: (value: string) => ({
      [isRTL ? 'paddingRight' : 'paddingLeft']: value,
    }),
    paddingEnd: (value: string) => ({
      [isRTL ? 'paddingLeft' : 'paddingRight']: value,
    }),
  };
}

/**
 * Logical property utilities (using modern CSS logical properties)
 */
export const logicalProperties = {
  marginInlineStart: (value: string) => ({ marginInlineStart: value }),
  marginInlineEnd: (value: string) => ({ marginInlineEnd: value }),
  paddingInlineStart: (value: string) => ({ paddingInlineStart: value }),
  paddingInlineEnd: (value: string) => ({ paddingInlineEnd: value }),
  borderInlineStart: (value: string) => ({ borderInlineStart: value }),
  borderInlineEnd: (value: string) => ({ borderInlineEnd: value }),
  insetInlineStart: (value: string) => ({ insetInlineStart: value }),
  insetInlineEnd: (value: string) => ({ insetInlineEnd: value }),
};

/**
 * Direction-aware icon rotation
 */
export function getIconRotation(isRTL: boolean, iconType: 'arrow' | 'chevron' | 'caret') {
  if (!isRTL) return '';

  const rotations = {
    arrow: 'rotate-180',
    chevron: 'rotate-180',
    caret: 'rotate-180',
  };

  return rotations[iconType] || '';
}

/**
 * Bidirectional text rendering utilities
 */
export const bidiText = {
  /**
   * Wrap text with proper Unicode bidirectional formatting
   */
  wrap: (text: string, direction: TextDirection) => {
    const marks = {
      rtl: '\u202B', // Right-to-Left Embedding
      ltr: '\u202A', // Left-to-Right Embedding
    };
    const pop = '\u202C'; // Pop Directional Formatting

    return `${marks[direction]}${text}${pop}`;
  },

  /**
   * Force text direction for mixed content
   */
  force: (text: string, direction: TextDirection) => {
    const overrides = {
      rtl: '\u202E', // Right-to-Left Override
      ltr: '\u202D', // Left-to-Right Override
    };
    const pop = '\u202C'; // Pop Directional Formatting

    return `${overrides[direction]}${text}${pop}`;
  },

  /**
   * Mark text as neutral (for numbers, symbols, etc.)
   */
  neutral: (text: string) => {
    return text; // Unicode will handle this automatically
  },
};
