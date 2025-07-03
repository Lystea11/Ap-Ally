import { LRUCache } from 'lru-cache';

// This cache is used to temporarily store generated lesson content
// to avoid re-generating it on repeated requests.

const options = {
  // Maximum number of items in the cache
  max: 500,
  // Time to live for each item in milliseconds (e.g., 1 hour)
  ttl: 1000 * 60 * 60,
};

export const cache = new LRUCache(options);
