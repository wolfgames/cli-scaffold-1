/**
 * Node test env shim for @adobe/data
 *
 * @adobe/data's blob-store module eagerly calls `globalThis.caches.open()`
 * at module import time for blob caching. The Node / vitest 'node' env has
 * no Cache API, so the promise rejects as an "unhandled rejection" even for
 * tests that never touch persistence.
 *
 * We stub a minimal CacheStorage here. The stub is only used inside Vitest
 * — production builds run in real browsers with a real Cache API.
 */

type MinimalCache = {
  match: (req: Request | string) => Promise<Response | undefined>;
  put: (req: Request | string, res: Response) => Promise<void>;
  delete: (req: Request | string) => Promise<boolean>;
  keys: () => Promise<Request[]>;
};

if (typeof (globalThis as unknown as { caches?: unknown }).caches === 'undefined') {
  const store = new Map<string, MinimalCache>();
  const makeCache = (): MinimalCache => {
    const entries = new Map<string, Response>();
    return {
      match: async (req) => entries.get(String(req)),
      put: async (req, res) => {
        entries.set(String(req), res);
      },
      delete: async (req) => entries.delete(String(req)),
      keys: async () => [],
    };
  };
  (globalThis as unknown as { caches: { open: (n: string) => Promise<MinimalCache> } }).caches = {
    open: async (name: string) => {
      let c = store.get(name);
      if (!c) {
        c = makeCache();
        store.set(name, c);
      }
      return c;
    },
  };
}

// Some blob ops reference window.location.origin — provide a harmless default.
// posthog-js reads window.location.hash AND the global `location.hash` at
// import time (checks for toolbar query params), so both must be shaped like
// Location or its .match() call throws.
const shimLocation = {
  origin: 'http://localhost',
  href: 'http://localhost/',
  hash: '',
  search: '',
  pathname: '/',
  hostname: 'localhost',
  protocol: 'http:',
  port: '',
  host: 'localhost',
};

if (typeof (globalThis as unknown as { window?: unknown }).window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = {
    location: shimLocation,
    navigator: { userAgent: 'node' },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    devicePixelRatio: 1,
    innerHeight: 844,
    innerWidth: 390,
  };
}

if (typeof (globalThis as unknown as { location?: unknown }).location === 'undefined') {
  (globalThis as unknown as { location: typeof shimLocation }).location = shimLocation;
}
