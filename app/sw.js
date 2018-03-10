// defines what I want to cache when installing SW
const staticCacheName = 'rw-static-v2';
const urlsToStaticCache = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/data/restaurants.json',
    '/css/main.css',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/10.jpg'
];
const contentImgsCache = 'rw-imgs-v1';
const allCaches = [staticCacheName, contentImgsCache];

// install event
self.addEventListener('install', event => {
    console.log('The service worker is being installed');
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            return cache.addAll(urlsToStaticCache);
            // addAll is atomic and uses fetch under the hood, so the request will always go via the browser cache
        })
    );
});

// activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('rw-') && !allCaches.includes(cacheName);
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// fetch event
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    // if (requestUrl.origin === location.origin) {
        // console.log(requestUrl);
        if (requestUrl.pathname.startsWith('/img/')) {
            event.respondWith(servePhoto(event.request));
            return;
        }
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    // }
    
    // if (event.request.url.startsWith('http://localhost:3000/img/')) {
    //     event.respondWith(
    //         fetch('img/icon.svg')
    //     );
    // }
});

function servePhoto(request) {
    const storageUrl = request.url.split('_')[0];
    return caches.open(contentImgsCache).then(cache => {
        return cache.match(storageUrl).then(response => {
            if (response) return response;

            return fetch(request).then(networkResponse => {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}