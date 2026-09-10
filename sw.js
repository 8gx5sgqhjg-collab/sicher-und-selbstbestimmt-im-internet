/* =============================================================
   Service Worker – Sicher und selbstbestimmt im Internet
   Offline-Fähigkeit: Cache-first für Assets, Network-first für HTML
   Version: update CACHE_VERSION bei jeder Veröffentlichung
   ============================================================= */

const CACHE_VERSION = "v2026-12y";
const CACHE_NAME    = "sicher-im-netz-" + CACHE_VERSION;
/* Altlast: früher lagen die Piktogramme bei static.arasaac.org.
   Heute sind es eigene SVGs in assets/pictograms/. Dieser alte Cache
   wird beim Aktivieren einmalig gelöscht (siehe activate). */
const ALTER_ARASAAC_CACHE = "arasaac-pictograms-v1";

/* Alle Dateien, die sofort beim Installieren gecacht werden */
const PRECACHE_URLS = [
  /* Kern */
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./topics.js",
  "./content-de.js",
  "./begleitung-de.js",
  "./szenarien-de.js",
  "./regeln-de.js",
  "./uebungen-de.js",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./404.html",
  "./fortschritt.html",

  /* Statische Seiten */
  "./barrierefreiheit.html",
  "./beobachtungsbogen.html",
  "./pruefaufgaben.html",
  "./pruefheft.html",
  "./sprachstufen.html",
  "./impressum.html",
  "./datenschutz.html",
  "./ersteller.html",
  "./frank-runge-digitale-bildung.html",
  "./frank-runge-digitale-teilhabe.html",
  "./frank-runge-medienkompetenz.html",
  "./frank-runge-ki-bildung.html",
  "./frank-runge-leichte-sprache-uk.html",
  "./frank-runge-smart-home-digitale-assistenz.html",
  "./frank-runge-mediator-eingliederungshilfe.html",
  "./frank-runge-3d-druck-digitale-teilhabe.html",
  "./projekte-frank-runge.html",
  "./projekte-digitale-bildung-frank-runge.html",
  "./barrierearme-lernplattform-einfache-sprache.html",
  "./datenschutz-social-media-lernangebot.html",

  /* Illustrationen.
     NUR alex-und-tilda.svg wird angezeigt (Begruessung auf der Startseite).
     Die 12 Themen-Illustrationen zeigt die App seit dem Umbau der
     Themenseite nirgends mehr an – getIllustrationHtml() in app.js wird
     nicht mehr aufgerufen. Sie lagen trotzdem im Precache: rund 530 KB,
     die jede Person beim ersten Besuch mitgeladen hat, ohne sie je zu
     sehen. Die Dateien bleiben im Repo, falls sie wieder eingebaut werden. */
  "./assets/illustrations/alex-und-tilda.svg",

  /* Wegzeichen-Figuren (Paket W, statisch, transparent) */
  "./assets/figures/alex-tilda-winken.png",
  "./assets/figures/alex-tilda-themen.png",
  "./assets/figures/alex-tilda-lernweg.png",
  "./assets/figures/alex-tilda-einstellungen.png",
  "./assets/figures/alex-tilda-ruhig.png",

  /* Lektions-Bilder */
  "./assets/lessons/lock.svg",
  "./assets/lessons/data.svg",
  "./assets/lessons/warning.svg",
  "./assets/lessons/check.svg",
  "./assets/lessons/help.svg",
  "./assets/lessons/message.svg",
  "./assets/lessons/link.svg",
  "./assets/lessons/photo.svg",
  "./assets/lessons/stop.svg",
  "./assets/lessons/remember.svg",
  "./assets/lessons/understand.svg",
  "./assets/lessons/example.svg",
  "./assets/lessons/report.svg",
  "./assets/lessons/ki.svg",
  "./assets/lessons/fake.svg",
  "./assets/lessons/betrug.svg",
  "./assets/lessons/einkaufen.svg",

  /* Icons */
  "./assets/icons/home.svg",
  "./assets/icons/remember.svg",
  "./assets/icons/lock.svg",
  "./assets/icons/link.svg",
  "./assets/icons/stop.svg",
  "./assets/icons/check.svg",
  "./assets/icons/warning.svg",
  "./assets/icons/understand.svg",
  "./assets/icons/example.svg",
  "./assets/icons/quiz.svg",
  "./assets/icons/start.svg",
  "./assets/icons/message.svg",
  "./assets/icons/report.svg",
  "./assets/icons/exercise.svg",
  "./assets/icons/data.svg",
  "./assets/icons/help.svg",
  "./assets/icons/block.svg",
  "./assets/icons/photo.svg",
  "./assets/icons/ki.svg",
  "./assets/icons/fake.svg",
  "./assets/icons/betrug.svg",
  "./assets/icons/einkaufen.svg",

  /* Eigene Zeichen fuer die sechs App-Themen (F2). Vorher teilten sich je
     zwei Themen dasselbe Symbol: WhatsApp/Facebook, Instagram/Snapchat und
     YouTube/TikTok waren nur an der Hintergrundfarbe zu unterscheiden. */
  "./assets/icons/whatsapp.svg",
  "./assets/icons/facebook.svg",
  "./assets/icons/instagram.svg",
  "./assets/icons/youtube.svg",
  "./assets/icons/snapchat.svg",
  "./assets/icons/tiktok.svg",

  /* Piktogramme Einfach-Modus */
  "./assets/pictograms/pikto-data.svg",
  "./assets/pictograms/pikto-lock.svg",
  "./assets/pictograms/pikto-ask.svg",
  "./assets/pictograms/pikto-message.svg",
  "./assets/pictograms/pikto-link.svg",
  "./assets/pictograms/pikto-photo.svg",
  "./assets/pictograms/pikto-location.svg",
  "./assets/pictograms/pikto-no.svg",
  "./assets/pictograms/pikto-screen.svg",
  "./assets/pictograms/pikto-pause.svg",
  "./assets/pictograms/pikto-feel.svg",
  "./assets/pictograms/pikto-help.svg",
  "./assets/pictograms/pikto-ki.svg",
  "./assets/pictograms/pikto-fake.svg",
  "./assets/pictograms/pikto-fraud.svg",
  "./assets/pictograms/pikto-shop.svg",
  "./assets/pictograms/pikto-done.svg",
  "./assets/pictograms/pikto-warning.svg",
  "./assets/pictograms/pikto-key.svg",
  "./assets/pictograms/pikto-phone.svg",
  "./assets/pictograms/pikto-birthday.svg",
  "./assets/pictograms/pikto-plan.svg",
  "./assets/pictograms/pikto-money.svg",
  "./assets/pictograms/pikto-bank.svg",
  "./assets/pictograms/pikto-card.svg",
  "./assets/pictograms/pikto-person.svg",
  "./assets/pictograms/pikto-people.svg",
  "./assets/pictograms/pikto-stranger.svg",
  "./assets/pictograms/pikto-video.svg",
  "./assets/pictograms/pikto-house.svg",
  "./assets/pictograms/pikto-search.svg",
  "./assets/pictograms/pikto-code.svg",
  "./assets/pictograms/pikto-globe.svg",
  "./assets/pictograms/pikto-friend.svg",
  "./assets/pictograms/pikto-clock.svg",
  "./assets/pictograms/pikto-mail.svg",

  /* QR-Karten (Workshops und Begleitung) */
  "./assets/qr/datenschutz.svg",
  "./assets/qr/whatsapp.svg",
  "./assets/qr/facebook.svg",
  "./assets/qr/instagram.svg",
  "./assets/qr/youtube.svg",
  "./assets/qr/snapchat.svg",
  "./assets/qr/tiktok.svg",
  "./assets/qr/hilfe.svg",
  "./assets/qr/ki.svg",
  "./assets/qr/fakes.svg",
  "./assets/qr/betrug.svg",
  "./assets/qr/einkaufen.svg",
  "./assets/qr/startseite.svg",

  /* Schriften — WOFF2 (primär) + TTF (Fallback, optional) */
  "./assets/fonts/atkinson-regular.woff2",
  "./assets/fonts/atkinson-regular-ext.woff2",
  "./assets/fonts/atkinson-bold.woff2",
  "./assets/fonts/atkinson-bold-ext.woff2",
  "./assets/fonts/atkinson-regular.ttf",
  "./assets/fonts/atkinson-bold.ttf",

  /* Logos im Footer */
  "./assets/brand/logo-tilbeck-alexianer.jpeg",
  "./assets/brand/logo-sozialstiftung-nrw.jpeg",
];

/* Einfache Offline-Fallback-Seite (wenn Netz und Cache komplett fehlen) */
function offlineFallback() {
  const html = `<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Offline – Sicher im Internet</title>
  <style>
    body { font-family: Arial, sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; min-height: 100svh;
           margin: 0; background: #f1f5fa; color: #16222e; text-align: center; padding: 24px; }
    h1 { font-size: 1.5rem; }
    p  { font-size: 1.1rem; line-height: 1.6; max-width: 360px; }
    a  { color: #00528f; font-weight: bold; }
  </style>
</head>
<body>
  <p style="font-size:3rem">📵</p>
  <h1>Du bist gerade offline.</h1>
  <p>Diese Seite konnte nicht geladen werden.<br>
     Bitte verbinde dich mit dem Internet und lade die Seite neu.</p>
  <p><a href="./">Nochmal versuchen</a></p>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

/* ---- Install ---- */
self.addEventListener("install", (event) => {
  self.skipWaiting(); /* Aktiviert den neuen SW sofort */
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      /* Schriften sind optional – falls noch nicht vorhanden, weitermachen */
      const required = PRECACHE_URLS.filter(
        (u) => !u.includes("assets/fonts/")
      );
      const optional = PRECACHE_URLS.filter(
        (u) => u.includes("assets/fonts/")
      );

      return cache.addAll(required).then(() => {
        /* Schriften einzeln cachen, Fehler ignorieren */
        return Promise.allSettled(
          optional.map((url) =>
            cache.add(url).catch(() => { /* Datei fehlt noch – ok */ })
          )
        );
      });
    })
  );
});

/* ---- Activate: alte Caches löschen, Seite benachrichtigen ---- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      /* Gab es schon einen eigenen Cache? Dann ist das ein Update.
         Wenn nicht, wird die App gerade zum ERSTEN MAL installiert – dann
         darf keine Meldung „wurde aktualisiert" an die Seite gehen.
         (Die Seite prüft das zusätzlich selbst, siehe index.html.) */
      const warUpdate = keys.some(
        (key) => key.startsWith("sicher-im-netz-") && key !== CACHE_NAME
      );
      return Promise.all(
        keys
          .filter((key) =>
            (key.startsWith("sicher-im-netz-") && key !== CACHE_NAME) ||
            key === ALTER_ARASAAC_CACHE)
          .map((key) => caches.delete(key))
      ).then(() => warUpdate);
    }).then((warUpdate) => {
      self.clients.claim();
      if (!warUpdate) return;
      /* Alle offenen Tabs informieren: neues Update ist aktiv */
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "SW_UPDATED" }));
      });
    })
  );
});

/* ---- Fetch-Strategie ---- */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);


  /* Nur eigene Anfragen abfangen (kein Cross-Origin) */
  if (url.origin !== location.origin) return;

  /* HTML-Dateien: Network-first (aktueller Inhalt), Fallback Cache */
  if (event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          /* Aktuelle Version im Cache speichern */
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(
            (cached) => cached || caches.match("./index.html") || caches.match("./404.html") || offlineFallback()
          )
        )
    );
    return;
  }

  /* Alles andere: Cache-first (Bilder, CSS, JS, Schriften) */
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      /* Nicht im Cache: vom Netz laden und speichern */
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
