importScripts('workbox-sw.prod.v2.1.2.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "css/main.css",
    "revision": "f5dcdc482e452429a6126276440875dc"
  },
  {
    "url": "index.html",
    "revision": "410cf3f6eb96b102bc749b92d2337cd7"
  },
  {
    "url": "js/dbhelper.js",
    "revision": "0fa4eeff394561b48796a5fcf26b6318"
  },
  {
    "url": "js/main.js",
    "revision": "5409f3dc332c3faf926d36615c1a519b"
  },
  {
    "url": "js/restaurant_info.js",
    "revision": "56e5171d09656b0ed5759bfe1e73ede8"
  },
  {
    "url": "restaurant.html",
    "revision": "f431a7255053a1bfcf9d7141e192c706"
  }
];

const workboxSW = new self.WorkboxSW({
  "skipWaiting": true,
  "clientsClaim": true
});
workboxSW.precache(fileManifest);
