interface CacheEntry {
  data: string;
  timestamp: number;
}

class ProfileCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 60 * 60 * 1000;

  set(login: string, profilePicture: string): void {
    this.cache.set(login, {
      data: profilePicture,
      timestamp: Date.now(),
    });
  }

  get(login: string): string | null {
    const entry = this.cache.get(login);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(login);
      return null;
    }

    return entry.data;
  }

  has(login: string): boolean {
    const entry = this.cache.get(login);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(login);
      return false;
    }

    return true;
  }

  setMany(profiles: Map<string, string>): void {
    const now = Date.now();
    profiles.forEach((profilePicture, login) => {
      this.cache.set(login, {
        data: profilePicture,
        timestamp: now,
      });
    });
  }

  getMany(logins: string[]): Map<string, string> {
    const result = new Map<string, string>();
    logins.forEach(login => {
      const value = this.get(login);
      if (value !== null) {
        result.set(login, value);
      }
    });
    return result;
  }

  getMissingLogins(logins: string[]): string[] {
    return logins.filter(login => !this.has(login));
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

interface GenericCacheEntry<T> {
  data: T;
  timestamp: number;
}

class GenericCache<T> {
  private cache: Map<string, GenericCacheEntry<T>> = new Map();
  private readonly TTL: number;

  constructor(ttlMinutes: number) {
    this.TTL = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getAge(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return Math.floor((Date.now() - entry.timestamp) / (60 * 1000));
  }
}

// Global singleton instances - shared across all requests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForCache = global as typeof globalThis & {
  profileCache?: ProfileCache;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progressCache?: GenericCache<any>;
};

export const profileCache = globalForCache.profileCache ?? new ProfileCache();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const progressCache = globalForCache.progressCache ?? new GenericCache<any>(20);

// Ensure singletons persist across hot reloads in development
if (process.env.NODE_ENV !== 'production') {
  globalForCache.profileCache = profileCache;
  globalForCache.progressCache = progressCache;
}

// Log cache initialization
console.log('🔧 Cache initialized - Profile TTL: 1hr, Progress TTL: 20min');
