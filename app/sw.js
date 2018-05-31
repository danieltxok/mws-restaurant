// defines what I want to cache when installing SW
const staticCache = 'rw-static';
const responsesCache = 'rw-responses';
const urlsToStaticCache = [
    '/',
    '/manifest.json',
    '/index.html',
    '/restaurant.html',
    '/restaurant.html?id=1',
    '/restaurant.html?id=2',
    '/restaurant.html?id=3',
    '/restaurant.html?id=4',
    '/restaurant.html?id=5',
    '/restaurant.html?id=6',
    '/restaurant.html?id=7',
    '/restaurant.html?id=8',
    '/restaurant.html?id=9',
    '/restaurant.html?id=10',
    '/css/main.css',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    'img/1_sqip.svg',
    'img/2_sqip.svg',
    'img/3_sqip.svg',
    'img/4_sqip.svg',
    'img/5_sqip.svg',
    'img/6_sqip.svg',
    'img/7_sqip.svg',
    'img/8_sqip.svg',
    'img/9_sqip.svg',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/icons/fav-icon-o.png',
    'img/icons/fav-icon.png'
];


// install event
self.addEventListener('install', event => {

    // delays the event until the promise resolves
    event.waitUntil(

        // Open the cache
        caches.open(staticCache).then(cache => {

            // addAll the files to the cache
            return cache.addAll(urlsToStaticCache);
            // addAll is atomic and uses fetch under the hood, so the request will always go via the browser cache
        })
    );
});


// activate event
// const contentImgsCache = 'rw-imgs-v1';
const allCaches = [staticCache, responsesCache]; //here we keep the important caches we need
self.addEventListener('activate', event => {
    console.log('SW activation');
    event.waitUntil(
        // get all the cache keys
        caches.keys().then(cacheNames => {
            return Promise.all(
                // filter all caches to find caches starting with rw- that are not inside allCaches and delete them
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

    // delays the event until the promise resolves
    event.respondWith(

        // Check in cache for the request
        caches.match(event.request).then(response => {

            // If response in cache, return cached version
            // If response not in cache, fetch & cache
            return response || fetch(event.request);
            // return response || fetch(event.request).then(response => {

            //     // Open the cache
            //     caches.open(responsesCache).then(cache => {

            //         // Put the request/response(cloned) in the cache
            //         cache.put(event.request, response.clone());

            //         // return response
            //         return response;
            //     });
            // });
        })
    );
});