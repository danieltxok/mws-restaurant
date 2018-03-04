// defines what I want to cache when installing SW
const cacheName = 'cache-v1';
const urlsToCache = [
    '/index.html',
    '/restaurant.html',
    '/css/main.css',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js'
];

// install event
self.addEventListener('install', function (event) {
    console.log('The service worker is being installed.');
    event.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// activate event
self.addEventListener('activate', function (event) {
    const cacheWhitelist = [cacheName];
    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log('Deleting old caches.');
                    return caches.delete(key);
                }
            }));
        })
    );
});

// // fetch event
// self.addEventListener('fetch', function (event) {
//     console.log('The service worker is serving the asset.' + evt.request.url);
//     evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
//     evt.waitUntil(update(evt.request));
// });










// function precache() {
//     return caches.open(CACHE).then(function (cache) {
//         return cache.addAll(precacheFiles);
//     });
// }


// function fromCache(request) {
//     //we pull files from the cache first thing so we can show them fast
//     return caches.open(CACHE).then(function (cache) {
//         return cache.match(request).then(function (matching) {
//             return matching || Promise.reject('no-match');
//         });
//     });
// }


// function update(request) {
//     //this is where we call the server to get the newest version of the 
//     //file to use the next time we show view
//     return caches.open(CACHE).then(function (cache) {
//         return fetch(request).then(function (response) {
//             return cache.put(request, response);
//         });
//     });
// }

// function fromServer(request) {
//     //this is the fallback if it is not in the cahche to go to the server and get it
//     return fetch(request).then(function (response) { return response })
// }