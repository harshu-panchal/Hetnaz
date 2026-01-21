/**
 * Memory Cache Service
 * @purpose: In-memory caching for frequently accessed data
 * @note: Simple LRU-style cache without external dependencies
 */

class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map(); // Store expiration times

        // Cleanup expired entries every minute
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any} Cached value or undefined
     */
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }

        // Check if expired
        const expiry = this.ttl.get(key);
        if (expiry && Date.now() > expiry) {
            this.delete(key);
            return undefined;
        }

        return this.cache.get(key);
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttlSeconds - Time to live in seconds (default: 5 minutes)
     */
    set(key, value, ttlSeconds = 300) {
        this.cache.set(key, value);
        this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
    }

    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
    }

    /**
     * Alias for delete
     */
    del(key) {
        return this.delete(key);
    }

    /**
     * Delete all keys matching a pattern
     * @param {string} pattern - Pattern to match (e.g., 'user:*')
     */
    deletePattern(pattern) {
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.delete(key);
            }
        }
    }

    /**
     * Alias for deletePattern
     */
    delPattern(pattern) {
        return this.deletePattern(pattern);
    }

    /**
     * Get all keys in cache
     * @returns {IterableIterator<string>}
     */
    keys() {
        return this.cache.keys();
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.ttl.clear();
    }

    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, expiry] of this.ttl.entries()) {
            if (now > expiry) {
                this.delete(key);
            }
        }
    }

    /**
     * Get cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Cache keys constants
export const CACHE_KEYS = {
    GIFTS: 'static:gifts',
    COIN_PLANS: 'static:coin_plans',
    PAYOUT_SLABS: 'static:payout_slabs',
    USER_PROFILE: (userId) => `user:${userId}:profile`,
    USER_BALANCE: (userId) => `user:${userId}:balance`,
    DISCOVER_FEMALES: (filter) => `discover:females:${filter}`,
    CHAT_LIST: (userId) => `chat:list:${userId}`,
};

// TTL values in seconds
export const CACHE_TTL = {
    STATIC: 600,        // 10 minutes for static data (gifts, plans)
    USER: 60,           // 1 minute for user data
    DISCOVER: 30,       // 30 seconds for discover (more dynamic)
    CHAT: 30,           // 30 seconds for chat lists
};

// Singleton instance
const memoryCache = new MemoryCache();

export default memoryCache;
