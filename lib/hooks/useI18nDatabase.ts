// GemsAI I18n Database React Hooks
// Type-safe hooks for accessing multilingual database content

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { i18nQuery, createI18nQuery } from '@/lib/supabase/i18n-client';
import type {
  Language,
  StoryMultilingual,
  ProductMultilingual,
  JewelerMultilingual,
} from '@/lib/types/database';

// ============================================================================
// LANGUAGE HOOKS
// ============================================================================

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const data = await i18nQuery.getLanguages();
        setLanguages(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch languages:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLanguages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return { languages, loading, error };
}

// ============================================================================
// SYSTEM TRANSLATION HOOKS
// ============================================================================

export function useSystemTranslation(key: string, fallback?: string) {
  const { language } = useLanguage();
  const [translation, setTranslation] = useState<string>(fallback || key);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const result = await query.getSystemTranslation(key, fallback);
        setTranslation(result);
      } catch (error) {
        console.warn(`Failed to fetch translation for "${key}":`, error);
        setTranslation(fallback || key);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [key, language, fallback]);

  return { translation, loading };
}

export function useSystemTranslations(keys: string[]) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const memoizedKeys = useMemo(() => keys.sort().join(','), [keys]);

  useEffect(() => {
    if (keys.length === 0) {
      setTranslations({});
      setLoading(false);
      return;
    }

    const fetchTranslations = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const result = await query.getCachedSystemTranslations(keys);
        setTranslations(result);
      } catch (error) {
        console.warn('Failed to fetch system translations:', error);
        // Fallback to keys as values
        const fallback = keys.reduce((acc, key) => ({ ...acc, [key]: key }), {});
        setTranslations(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [memoizedKeys, language]);

  return { translations, loading };
}

// ============================================================================
// ENUM TRANSLATION HOOKS
// ============================================================================

export function useEnumTranslation(enumType: string, enumValue: string, fallback?: string) {
  const { language } = useLanguage();
  const [translation, setTranslation] = useState<string>(fallback || enumValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranslation = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const result = await query.getEnumTranslation(enumType, enumValue, fallback);
        setTranslation(result);
      } catch (error) {
        console.warn(`Failed to fetch enum translation for "${enumType}.${enumValue}":`, error);
        setTranslation(fallback || enumValue);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [enumType, enumValue, language, fallback]);

  return { translation, loading };
}

export function useEnumTranslations(enumType: string, enumValues: string[]) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const memoizedValues = useMemo(() => enumValues.sort().join(','), [enumValues]);

  useEffect(() => {
    if (enumValues.length === 0) {
      setTranslations({});
      setLoading(false);
      return;
    }

    const fetchTranslations = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const result = await query.getEnumTranslations(enumType, enumValues);
        setTranslations(result);
      } catch (error) {
        console.warn(`Failed to fetch enum translations for "${enumType}":`, error);
        // Fallback to values as keys
        const fallback = enumValues.reduce((acc, value) => ({ ...acc, [value]: value }), {});
        setTranslations(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [enumType, memoizedValues, language]);

  return { translations, loading };
}

// ============================================================================
// CONTENT HOOKS
// ============================================================================

export function useStories(
  options: {
    limit?: number;
    offset?: number;
    userId?: string;
    orderBy?: 'created_at' | 'updated_at';
    orderDirection?: 'asc' | 'desc';
  } = {}
) {
  const { language } = useLanguage();
  const [stories, setStories] = useState<StoryMultilingual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const optionsKey = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const data = await query.getStories(options);
        setStories(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stories:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [language, optionsKey]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const query = createI18nQuery(language);
      const data = await query.getStories(options);
      setStories(data);
      setError(null);
    } catch (err) {
      console.error('Failed to refetch stories:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [language, optionsKey]);

  return { stories, loading, error, refetch };
}

export function useStory(id: string) {
  const { language } = useLanguage();
  const [story, setStory] = useState<StoryMultilingual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setStory(null);
      setLoading(false);
      return;
    }

    const fetchStory = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const data = await query.getStoryById(id);
        setStory(data);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch story ${id}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, language]);

  return { story, loading, error };
}

export function useProducts(
  options: {
    limit?: number;
    offset?: number;
    jewelerId?: string;
    category?: string;
    availableOnly?: boolean;
    orderBy?: 'created_at' | 'updated_at' | 'price';
    orderDirection?: 'asc' | 'desc';
  } = {}
) {
  const { language } = useLanguage();
  const [products, setProducts] = useState<ProductMultilingual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const optionsKey = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const data = await query.getProducts(options);
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [language, optionsKey]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const query = createI18nQuery(language);
      const data = await query.getProducts(options);
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Failed to refetch products:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [language, optionsKey]);

  return { products, loading, error, refetch };
}

export function useProduct(id: string) {
  const { language } = useLanguage();
  const [product, setProduct] = useState<ProductMultilingual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const data = await query.getProductById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch product ${id}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, language]);

  return { product, loading, error };
}

export function useJewelers(
  options: {
    limit?: number;
    offset?: number;
    verifiedOnly?: boolean;
    orderBy?: 'created_at' | 'updated_at';
    orderDirection?: 'asc' | 'desc';
  } = {}
) {
  const { language } = useLanguage();
  const [jewelers, setJewelers] = useState<JewelerMultilingual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const optionsKey = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    const fetchJewelers = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const data = await query.getJewelers(options);
        setJewelers(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch jewelers:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setJewelers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJewelers();
  }, [language, optionsKey]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const query = createI18nQuery(language);
      const data = await query.getJewelers(options);
      setJewelers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to refetch jewelers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [language, optionsKey]);

  return { jewelers, loading, error, refetch };
}

export function useJeweler(id: string) {
  const { language } = useLanguage();
  const [jeweler, setJeweler] = useState<JewelerMultilingual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setJeweler(null);
      setLoading(false);
      return;
    }

    const fetchJeweler = async () => {
      try {
        setLoading(true);
        const query = createI18nQuery(language);
        const data = await query.getJewelerById(id);
        setJeweler(data);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch jeweler ${id}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setJeweler(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJeweler();
  }, [id, language]);

  return { jeweler, loading, error };
}

// ============================================================================
// SEARCH HOOKS
// ============================================================================

export function useSearchStories(
  query: string,
  options: {
    limit?: number;
    offset?: number;
  } = {}
) {
  const { language } = useLanguage();
  const [results, setResults] = useState<StoryMultilingual[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const i18nQueryInstance = createI18nQuery(language);
        const data = await i18nQueryInstance.searchStories(searchQuery, options);
        setResults(data);
      } catch (err) {
        console.error('Failed to search stories:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [language, options]
  );

  useEffect(() => {
    if (query.trim()) {
      search(query);
    } else {
      setResults([]);
    }
  }, [query, search]);

  return { results, loading, error, search };
}

export function useSearchProducts(
  query: string,
  options: {
    limit?: number;
    offset?: number;
    category?: string;
  } = {}
) {
  const { language } = useLanguage();
  const [results, setResults] = useState<ProductMultilingual[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const i18nQueryInstance = createI18nQuery(language);
        const data = await i18nQueryInstance.searchProducts(searchQuery, options);
        setResults(data);
      } catch (err) {
        console.error('Failed to search products:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [language, options]
  );

  useEffect(() => {
    if (query.trim()) {
      search(query);
    } else {
      setResults([]);
    }
  }, [query, search]);

  return { results, loading, error, search };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useTranslationCompleteness(entityType: string, entityId: string) {
  const [completeness, setCompleteness] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityType || !entityId) {
      setCompleteness([]);
      setLoading(false);
      return;
    }

    const fetchCompleteness = async () => {
      try {
        setLoading(true);
        const data = await i18nQuery.getTranslationCompleteness(entityType, entityId);
        setCompleteness(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch translation completeness:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCompleteness([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompleteness();
  }, [entityType, entityId]);

  return { completeness, loading, error };
}
