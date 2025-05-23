import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

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
    // Skip service worker for API routes entirely - let them pass through
    {
      matcher: ({ url }) => url.pathname.startsWith("/api"),
      handler: {
        handle: async ({ event }: { event: FetchEvent }) => {
          // Return undefined to let the request pass through to the network
          return undefined;
        }
      } as any,
    },
    // Keep all default cache entries for offline functionality
    ...defaultCache,
  ],
});

serwist.addEventListeners();