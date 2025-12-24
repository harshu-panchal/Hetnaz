/**
 * Translation Service
 * Google Translate API wrapper with caching
 */

import { getStaticTranslation } from '../i18n/staticTranslations';

// const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_AND_TRANSLATE_API;
// const CACHE_KEY_PREFIX = 'translate_cache';

interface TranslationCache {
    [key: string]: string;
}

class TranslateService {
    private cache: TranslationCache = {};
    // private isInitialized = false;

    constructor() {
        this.loadCacheFromStorage();
    }

    /**
     * Load translation cache from localStorage
     */
    private loadCacheFromStorage() {
        // try {
        //     const cached = localStorage.getItem(CACHE_KEY_PREFIX);
        //     if (cached) {
        //         this.cache = JSON.parse(cached);
        //         console.log(`📝 Loaded ${Object.keys(this.cache).length} cached translations`);
        //     }
        //     this.isInitialized = true;
        // } catch (error) {
        //     console.error('Failed to load translation cache:', error);
        //     this.cache = {};
        //     this.isInitialized = true;
        // }
    }

    /**
     * Save cache to localStorage
     */
    // private saveCacheToStorage() {
    //     try {
    //         localStorage.setItem(CACHE_KEY_PREFIX, JSON.stringify(this.cache));
    //     } catch (error) {
    //         console.error('Failed to save translation cache:', error);
    //     }
    // }

    /**
     * Generate cache key
     */
    // private getCacheKey(text: string, sourceLang: string, targetLang: string): string {
    //     // Simple hash for cache key
    //     const hash = text.split('').reduce((a, b) => {
    //         a = ((a << 5) - a) + b.charCodeAt(0);
    //         return a & a;
    //     }, 0);
    //     return `${sourceLang}_${targetLang}_${hash}_${text.length}`;
    // }

    /**
     * Translate a single text
     * (Dynamic Google Translate disabled - only static translations kept)
     */
    async translate(
        text: string,
        sourceLang: 'en' | 'hi' = 'en',
        targetLang: 'en' | 'hi' = 'hi'
    ): Promise<string> {
        // If same language, return as-is
        if (sourceLang === targetLang) {
            return text;
        }

        // Empty text
        if (!text || text.trim() === '') {
            return text;
        }

        // Check static translations first (preserving static translation as requested)
        const staticTraslation = getStaticTranslation(text, targetLang);
        if (staticTraslation) {
            return staticTraslation;
        }

        // If no static translation, return original text (dynamic translation removed)
        return text;
    }

    /**
     * Translate multiple texts in batch
     * (Dynamic Google Translate disabled - only static translations kept)
     */
    async translateBatch(
        texts: string[],
        sourceLang: 'en' | 'hi' = 'en',
        targetLang: 'en' | 'hi' = 'hi'
    ): Promise<string[]> {
        if (sourceLang === targetLang) {
            return texts;
        }

        // Process batch: use static translations where available, otherwise keep original
        return texts.map(text => {
            if (!text || text.trim() === '') return text;

            const staticTranslation = getStaticTranslation(text, targetLang);
            return staticTranslation || text;
        });
    }

    /**
     * Clear all cached translations
     */
    clearCache() {
        this.cache = {};
        // localStorage.removeItem(CACHE_KEY_PREFIX);
        console.log('🗑️ Translation cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            totalEntries: Object.keys(this.cache).length,
            estimatedSize: new Blob([JSON.stringify(this.cache)]).size,
        };
    }
}

export const translateService = new TranslateService();
export default translateService;
