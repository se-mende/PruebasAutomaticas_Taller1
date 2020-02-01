importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.precaching.precacheAndRoute([
  { url: "/index.html", revision: "1234"},
  { url: "/styles/inline.css", revision: null},
  { url: "/scripts/app.js", revision: null}
]);

workbox.routing.registerRoute(
  new RegExp("^https://api-ratp.pierre-grimaud.fr/v3/schedules/"),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'APICache',
  })
);