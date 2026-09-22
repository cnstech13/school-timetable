const CACHE_NAME = "school-timetable-v2";

const APP_FILES = [
    "/school-timetable/",
    "/school-timetable/index.html",
    "/school-timetable/style.css",
    "/school-timetable/script.js",
    "/school-timetable/manifest.json",
    "/school-timetable/icons/icon-192.png",
    "/school-timetable/icons/icon-512.png"
];


// =========================================================
// INSTALL SERVICE WORKER
// =========================================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {
                return cache.addAll(APP_FILES);
            })

            .then(() => {
                return self.skipWaiting();
            })

    );

});


// =========================================================
// ACTIVATE SERVICE WORKER
// =========================================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

            .then(cacheNames => {

                return Promise.all(

                    cacheNames

                        .filter(name => name !== CACHE_NAME)

                        .map(name => {
                            return caches.delete(name);
                        })

                );

            })

            .then(() => {
                return self.clients.claim();
            })

    );

});


// =========================================================
// FETCH / OFFLINE SUPPORT
// =========================================================

self.addEventListener("fetch", event => {

    // Only handle GET requests
    if (event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(event.request)

            .then(cachedResponse => {

                // Return cached file if available
                if (cachedResponse) {
                    return cachedResponse;
                }


                // Otherwise try the internet
                return fetch(event.request)

                    .then(networkResponse => {

                        // Don't cache invalid responses
                        if (
                            !networkResponse ||
                            networkResponse.status !== 200 ||
                            networkResponse.type === "opaque"
                        ) {
                            return networkResponse;
                        }


                        // Make a copy before caching
                        const responseClone =
                            networkResponse.clone();


                        // Save the new file to cache
                        caches.open(CACHE_NAME)

                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });


                        return networkResponse;

                    })

                    .catch(() => {

                        // If there is no internet,
                        // return the cached homepage
                        return caches.match(
                            "/school-timetable/index.html"
                        );

                    });

            })

    );

});