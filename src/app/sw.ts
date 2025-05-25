import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Filter out any default cache rules that might match API routes
    ...defaultCache.filter(cacheRule => {
      // If the cache rule has a matcher function, test it against API routes
      if (typeof cacheRule.matcher === 'function') {
        try {
          // Test if this cache rule would match an API route
          const testApiUrl = new URL('/api/data', self.location.origin);
          const shouldMatch = cacheRule.matcher({ 
            url: testApiUrl,
            request: new Request(testApiUrl)
          } as any);
          // If it matches API routes, exclude it
          return !shouldMatch;
        } catch {
          // If testing fails, include the rule (safer)
          return true;
        }
      }
      // If no matcher function, include the rule
      return true;
    })
  ],
});

serwist.addEventListeners();