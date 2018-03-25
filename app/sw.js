// defines what I want to cache when installing SW
const staticCache = 'rw-static-v2';
const responsesCache = 'rw-responses';
const urlsToStaticCache = [
    '/',
    '/index.html',
    '/restaurant.html',
    // '/data/restaurants.json',
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
const allCaches = [staticCache, contentImgsCache, responsesCache]; //here we keep the important caches we need

// install event
self.addEventListener('install', event => {

    // e.waitUntil delays the event until the promise resolves
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
    // const requestUrl = new URL(e.request.url);
    // console.log('SW Fetch', requestUrl);

    event.respondWith(

        // Check in cache for the request
        caches.match(event.request).then(response => {

            // If response in cache, return cached version
            if (response) {
                console.log('Served from cache:', event.request.url, response);
                return response;
            }

            // If response not in cache, fetch & cache
            fetch(event.request).then(response => {

                // Open the cache
                caches.open(responsesCache).then(cache => {

                    // Put the cloned response in the cache
                    cache.put(event.request, response.clone());
                    console.log('Response cached:', event.request.url);

                    return response;
                }); 
            });

        })
    );
});


// const requestUrl = new URL(e.request.url);
// console.log(requestUrl.indexOf('https://maps.googleapi.com/js'));
// if (requestUrl.origin === location.origin) {
// console.log(requestUrl);
// if (requestUrl.pathname.startsWith('/img/')) {
//     e.respondWith(servePhoto(e.request));
//     return;
// }
// e.respondWith(
//     caches.match(e.request).then(response => {
//         return response || fetch(e.request);
//     })
// );
// }
// function servePhoto(request) {
//     const storageUrl = request.url.split('_')[0];
//     return caches.open(contentImgsCache).then(cache => {
//         return cache.match(storageUrl).then(response => {
//             if (response) return response;

//             return fetch(request).then(networkResponse => {
//                 cache.put(storageUrl, networkResponse.clone());
//                 return networkResponse;
//             });
//         });
//     });
// }