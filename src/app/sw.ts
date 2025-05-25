import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist, Strategy } from "serwist";
import type { StrategyHandler } from "serwist";

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

// Custom strategy that ignores /api routes
class IgnoreApiStrategy extends Strategy {
  async _handle(request: Request, handler: StrategyHandler): Promise<Response | undefined> {
    // Return undefined to let the request pass through to the network
    // without any service worker intervention
    return undefined;
  }
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith("/api"),
      handler: new IgnoreApiStrategy(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();