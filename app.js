/*
  Lernplattform "Sicher und selbstbestimmt im Internet"
  Version 2026 – komplett neu aufgebaut

  Grundsätze:
  - Einfache Sprache
  - klare Lernlogik: Lesen -> Übung -> Rückmeldung -> Merksatz
  - keine Speicherung von Namen oder Lernstand
  - Töne sind standardmäßig aus
  - Vorlesen nur nach Klick
*/

"use strict";

/* ============================================================
   Zustand
   ============================================================ */

let currentTopicId = null;
let currentMode = "full";
let currentStep = 0;
/* Richtung des Seitenwechsels für das sanfte Blättern (Weiter = vorwärts). */
let pageDirection = "forward";
let currentQuizIndex = 0;
let quizScore = 0;
let quizAnsweredCorrect = new Set();
let soundEnabled = false;
let motionEnabled = true;
let simpleMode = false;

/* Sprachstufe: 'leicht' (Leichte Sprache), 'einfach' (Einfache Sprache),
   'standard' (Alltagssprache). Wird gemerkt. */
let languageLevel = "leicht";
let languageChosen = false;
const LANGUAGE_KEY = "language-level";
const LANGUAGE_LABEL = {
  leicht: "Leichte Sprache",
  einfach: "Einfache Sprache",
  standard: "Alltagssprache"
};
const LANGUAGE_DESC = {
  leicht: "Kurze Sätze. Mit Bildern.",
  einfach: "Etwas mehr Text. Mit Beispielen.",
  standard: "Normaler Text für alle."
};
/* Beispiel-Satz je Stufe – damit man den Unterschied sieht, nicht nur liest. */
const LANGUAGE_EXAMPLE = {
  leicht: "Pass auf deine Daten auf. Sag nicht jedem dein Passwort.",
  einfach: "Schütze deine Daten und gib dein Passwort nicht weiter, damit niemand in dein Konto kommt.",
  standard: "Achte auf deine persönlichen Daten und teile dein Passwort mit niemandem, damit dein Konto geschützt bleibt."
};

/* Sanfter Sprach-Finder: kein Test, kein „richtig/falsch".
   Die Person liest denselben Inhalt in 3 Stufen und wählt, welcher Text
   sich am angenehmsten anfühlt. So entscheidet das Gefühl, nicht eine
   Selbsteinschätzung – würdevoll und selbstbestimmt (§4). */
let sampleTally = { leicht: 0, einfach: 0, standard: 0 };
const SAMPLE_ROUNDS = [
  {
    leicht: "Pass auf deine Daten auf. Sag nicht jedem dein Passwort.",
    einfach: "Schütze deine Daten und gib dein Passwort nicht weiter, damit niemand in dein Konto kommt.",
    standard: "Achte auf deine persönlichen Daten und teile dein Passwort mit niemandem, damit dein Konto geschützt bleibt."
  },
  {
    leicht: "Ein Fremder schreibt dir. Antworte nicht. Erzähle es einer Person, der du vertraust.",
    einfach: "Wenn dir ein Fremder schreibt, antworte besser nicht und erzähle es einer Person, der du vertraust.",
    standard: "Wenn dich eine unbekannte Person anschreibt, reagierst du besser nicht darauf und sprichst mit jemandem, dem du vertraust."
  }
];

function loadLanguageLevel() {
  try {
    const saved = pGet(LANGUAGE_KEY);
    if (saved === "leicht" || saved === "einfach" || saved === "standard") {
      languageLevel = saved;
      languageChosen = true;
      return true;
    }
  } catch (e) { /* nichts tun */ }
  return false;
}

function setLanguageLevel(level) {
  if (level !== "leicht" && level !== "einfach" && level !== "standard") return;
  languageLevel = level;
  languageChosen = true;
  pSet(LANGUAGE_KEY, level);
}

/* ============================================================
   Lernweg: Wie möchte die Person lernen?
   Selbstbestimmt – freiwillig, jederzeit änderbar, kein Pflicht-Schritt.
     'allein'      – die App erklärt alles selbst
     'app'         – bewusst mit Vorlesen, großer Schrift, Sprachwahl
     'begleitung'  – gemeinsam mit einer Begleitperson (Begleit-Material an)
   ============================================================ */
let learnMode = null;
const LEARN_MODE_KEY = "lern-weg";
const LEARN_MODE_SEEN_KEY = "lern-weg-gesehen";
/* Beim ersten Besuch wird die Lernweg-Frage groß gezeigt, danach nur noch
   als kleine umstellbare Zeile. Dieser Schalter öffnet sie wieder. */
let learnModeChooserOpen = false;
/* Einstellungen liegen jetzt als eigene Seite im Hauptmenü. */
function toggleSettings() { renderSettingsPage(); }
/* Wurde in dieser Sitzung mindestens ein Thema fertig gemacht?
   (Steuert, wann die freiwillige Lernstand-Frage erscheint.) */
let finishedTopicThisSession = false;
const LEARN_MODES = {
  allein:     { title: "Ich lerne allein",      desc: "Die App erklärt dir alles. Mit Vorlesen.",        icon: "understand" },
  app:        { title: "Mit Hilfe der App",     desc: "Große Schrift. Vorlesen, wenn du es möchtest.",   icon: "message" },
  begleitung: { title: "Mit einer Begleitung",  desc: "Ihr lernt zu zweit. Mit Tipps zum Reden.",        icon: "help" }
};

function loadLearnMode() {
  try {
    const saved = pGet(LEARN_MODE_KEY);
    if (saved === "allein" || saved === "app" || saved === "begleitung") {
      learnMode = saved;
    }
  } catch (e) { /* nichts tun */ }
}

function chooseLearnMode(mode) {
  if (!LEARN_MODES[mode]) return;
  /* Gleiche Karte noch einmal antippen = wieder abwählen (selbstbestimmt). */
  learnMode = (learnMode === mode) ? null : mode;
  if (learnMode) pSet(LEARN_MODE_KEY, learnMode);
  else pRemove(LEARN_MODE_KEY);

  if (learnMode === "app") {
    /* App-Hilfe-Modus spürbar machen: Schrift mindestens eine Stufe größer.
       Nie automatisch verkleinern – die Person behält die Kontrolle. */
    if (fontSizeStep < 1) {
      fontSizeStep = 1;
      pSet(FONT_SIZE_KEY, fontSizeStep);
      applyFontSize();
    }
    announce("Gut. Die Schrift ist jetzt größer. Automatisches Vorlesen kannst du in den Einstellungen anschalten.");
  } else if (learnMode === "begleitung") {
    announce("Gut. Auf jeder Themen-Seite gibt es jetzt Tipps für das gemeinsame Lernen.");
  } else if (learnMode === "allein") {
    announce("Gut. Such dir ein Thema aus. Die App erklärt dir alles.");
  } else {
    announce("Auswahl entfernt. Du kannst auch einfach ein Thema wählen.");
  }
  /* Auf der Seite bleiben, auf der die Person gerade ist (Vorhersehbarkeit) */
  if (activeTab === "einstellungen") renderSettingsPage();
  else renderMenu();
}

function isCompanionMode() {
  return learnMode === "begleitung";
}

function learnModeWasSeen() {
  return pGet(LEARN_MODE_SEEN_KEY) === "1";
}

function markLearnModeSeen() {
  pSet(LEARN_MODE_SEEN_KEY, "1");
}

/* Lernweg-Frage wieder groß aufklappen (Klick auf die kleine Zeile). */
function openLearnModeChooser() {
  learnModeChooserOpen = true;
  renderMenu();
}

/* Inhalt einer Lektion für die gewählte Sprachstufe holen.
   Fehlt die Stufe noch, wird sinnvoll zurückgefallen, damit die App
   jederzeit funktioniert (Reihenfolge: gewählt → einfach → leicht → Basis). */
/* Einstiegsfrage je Sprachstufe (Fallback: Basis aus topics.js). */
function resolveSelfAssessment(topic, level) {
  if (topic && topic.saVersions) {
    const v = level === "standard"
      ? (topic.saVersions.standard || topic.saVersions.einfach)
      : level === "einfach"
        ? topic.saVersions.einfach
        : null;
    if (v && Array.isArray(v.options) && v.options.length) return v;
  }
  return topic.selfAssessment;
}

function resolveLessonContent(lesson, level) {
  if (!lesson || !lesson.versions) return lesson;
  const v = lesson.versions;
  /* Der Basistext der Lektion IST bereits Leichte Sprache.
     Darum fällt "leicht" auf den Basistext zurück (nie auf "einfach"). */
  let chosen = null;
  if (level === "leicht") chosen = v.leicht || null;
  else if (level === "einfach") chosen = v.einfach || v.leicht || null;
  else chosen = v.standard || v.einfach || v.leicht || null;
  return chosen ? Object.assign({}, lesson, chosen) : lesson;
}

let audioContext = null;
let speechRate = 0.85;

/* Schriftgröße: 3 Stufen */
const FONT_SIZES    = [17, 20, 23]; /* px */
const FONT_SIZE_KEY = "font-size-step";
const MOTION_KEY    = "motion";
let fontSizeStep = 0;

function applyFontSize() {
  document.documentElement.style.fontSize = FONT_SIZES[fontSizeStep] + "px";
}

function loadFontSize() {
  try {
    const saved = parseInt(pGet(FONT_SIZE_KEY), 10);
    if (!isNaN(saved) && saved >= 0 && saved < FONT_SIZES.length) fontSizeStep = saved;
  } catch (e) { /* nichts tun */ }
  applyFontSize();
}

function changeFontSize(direction) {
  const next = fontSizeStep + direction;
  if (next < 0 || next >= FONT_SIZES.length) return;
  fontSizeStep = next;
  pSet(FONT_SIZE_KEY, fontSizeStep);
  applyFontSize();
  /* Buttons in allen sichtbaren Utility-Bars aktualisieren */
  document.querySelectorAll(".font-btn-decrease").forEach(b => { b.disabled = fontSizeStep === 0; });
  document.querySelectorAll(".font-btn-increase").forEach(b => { b.disabled = fontSizeStep === FONT_SIZES.length - 1; });
}

/* ============================================================
   Profile: mehrere Personen an einem Gerät – ohne Login, ohne Namen.
   Jede Person wählt ein Bild (Avatar). Sprache, Schrift, Lernweg und
   Lernstand werden PRO Profil getrennt gespeichert. Alles bleibt lokal
   auf dem Gerät (KDG-konform §14): kein Name nötig, kein Konto, kein Server.
   ============================================================ */
const PROFILES_KEY = "profile-liste";
const ACTIVE_PROFILE_KEY = "profil-aktiv";
let profiles = [];          /* [{ id, avatar }] */
let activeProfileId = null;

/* Wird dieses Gerät geteilt? Steuert, ob beim Öffnen „Wer lernt?" kommt. */
let deviceShared = false;
const DEVICE_SHARED_KEY = "geraet-geteilt";
function loadDeviceShared() {
  try { deviceShared = window.localStorage.getItem(DEVICE_SHARED_KEY) === "1"; }
  catch (e) { deviceShared = false; }
}
function setDeviceShared(shared) {
  deviceShared = !!shared;
  try { window.localStorage.setItem(DEVICE_SHARED_KEY, deviceShared ? "1" : "0"); } catch (e) { /* nichts tun */ }
}
/* Zwischenspeicher beim Zeichen-Bauen (Icon → Farbe → Zahl). */
let signDraft = { icon: null, color: null, number: null };
/* Läuft gerade der Erststart-Ablauf? (Zeichen → Sprache → Vorwissen → Themen) */
let onboarding = false;
/* Vorwissen je Profil: "neu" oder "erfahren". Steuert die Mengen-Empfehlung. */
const VORWISSEN_KEY = "vorwissen";

const AVATARS = [
  { e: "🦊", n: "Fuchs" }, { e: "🐰", n: "Hase" }, { e: "🦉", n: "Eule" },
  { e: "🐢", n: "Schildkröte" }, { e: "🐬", n: "Delfin" }, { e: "🦋", n: "Schmetterling" },
  { e: "🌻", n: "Blume" }, { e: "⚽", n: "Ball" }, { e: "🚲", n: "Fahrrad" },
  { e: "🎸", n: "Gitarre" }, { e: "🐧", n: "Pinguin" }, { e: "🐱", n: "Katze" }
];

/* ============================================================
   Eigenes Zeichen: Symbol (weiß) + Hintergrund-Farbe + Zahl 0–10.
   Erwachsen, gut unterscheidbar, viele Kombinationen.
   ============================================================ */
const SIGN_ICONS = [
  { key: "star",     name: "Stern",   svg: `<polygon points="50,16 61,39 86,42 67,59 72,84 50,72 28,84 33,59 14,42 39,39" fill="#fff"/>` },
  { key: "heart",    name: "Herz",    svg: `<path d="M50 80 C20 58 24 32 44 36 C50 37 50 43 50 45 C50 43 50 37 56 36 C76 32 80 58 50 80 Z" fill="#fff"/>` },
  { key: "moon",     name: "Mond",    svg: `<path d="M64 22 a30 30 0 1 0 14 53 a24 24 0 0 1 -14 -53 z" fill="#fff"/>` },
  { key: "sun",      name: "Sonne",   svg: `<circle cx="50" cy="50" r="14" fill="#fff"/><g stroke="#fff" stroke-width="5" stroke-linecap="round"><line x1="50" y1="20" x2="50" y2="28"/><line x1="50" y1="72" x2="50" y2="80"/><line x1="20" y1="50" x2="28" y2="50"/><line x1="72" y1="50" x2="80" y2="50"/><line x1="29" y1="29" x2="35" y2="35"/><line x1="65" y1="65" x2="71" y2="71"/><line x1="71" y1="29" x2="65" y2="35"/><line x1="35" y1="65" x2="29" y2="71"/></g>` },
  { key: "leaf",     name: "Blatt",   svg: `<path d="M28 72 C28 40 60 28 78 26 C76 50 56 74 28 72 Z" fill="#fff"/>` },
  { key: "key",      name: "Schlüssel", svg: `<circle cx="38" cy="42" r="14" fill="none" stroke="#fff" stroke-width="7"/><line x1="47" y1="51" x2="78" y2="82" stroke="#fff" stroke-width="7" stroke-linecap="round"/><line x1="68" y1="72" x2="76" y2="64" stroke="#fff" stroke-width="7" stroke-linecap="round"/>` },
  { key: "mountain", name: "Berg",    svg: `<path d="M16 78 L42 38 L58 60 L70 42 L88 78 Z" fill="#fff"/>` },
  { key: "drop",     name: "Tropfen", svg: `<path d="M50 18 C66 44 72 56 72 66 a22 22 0 0 1 -44 0 C28 56 34 44 50 18 Z" fill="#fff"/>` },
  { key: "music",    name: "Note",    svg: `<path d="M40 68 a9 9 0 1 0 9 9 V42 l24 -7 v20 a9 9 0 1 0 9 9 V24 l-42 12 z" fill="#fff"/>` },
  { key: "anchor",   name: "Anker",   svg: `<circle cx="50" cy="24" r="7" fill="none" stroke="#fff" stroke-width="5"/><line x1="50" y1="31" x2="50" y2="78" stroke="#fff" stroke-width="6" stroke-linecap="round"/><line x1="34" y1="46" x2="66" y2="46" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M24 56 a26 26 0 0 0 52 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>` },
  { key: "ball",     name: "Ball",    svg: `<circle cx="50" cy="50" r="24" fill="none" stroke="#fff" stroke-width="6"/><polygon points="50,40 60,47 56,59 44,59 40,47" fill="#fff"/>` },
  { key: "cloud",    name: "Wolke",   svg: `<path d="M34 68 a15 15 0 0 1 1 -30 a19 19 0 0 1 36 5 a13 13 0 0 1 -3 25 z" fill="#fff"/>` }
];
const SIGN_COLORS = [
  { name: "Blau",    hex: "#00528f" },
  { name: "Hellblau", hex: "#3e96be" },
  { name: "Türkis",  hex: "#0f6e56" },
  { name: "Grün",    hex: "#2E7D4F" },
  { name: "Lila",    hex: "#534ab7" },
  { name: "Pink",    hex: "#993556" },
  { name: "Rot",     hex: "#B5152B" },
  { name: "Orange",  hex: "#b45309" }
];

/* Zeichen als HTML anzeigen. Neu = Symbol+Farbe+Zahl; alt = Emoji (Rückfall). */
function signHtml(profile, cls) {
  if (!profile) return "";
  const extra = cls ? " " + cls : "";
  if (profile.icon) {
    const ic = SIGN_ICONS.find(s => s.key === profile.icon);
    const color = profile.color || "#00528f";
    const num = (profile.number !== undefined && profile.number !== null)
      ? `<span class="profile-sign-num">${escapeHtml(String(profile.number))}</span>` : "";
    return `<span class="profile-sign${extra}" style="background:${color}" aria-hidden="true"><svg viewBox="0 0 100 100">${ic ? ic.svg : ""}</svg>${num}</span>`;
  }
  return `<span class="profile-sign profile-sign--emoji${extra}" aria-hidden="true">${escapeHtml(profile.avatar || "🙂")}</span>`;
}

/* Zeichen als Text benennen (für Vorlese-/Screenreader-Beschriftung). */
function signLabel(profile) {
  if (!profile) return "Profil";
  if (profile.icon) {
    const ic = SIGN_ICONS.find(s => s.key === profile.icon);
    const col = SIGN_COLORS.find(c => c.hex === profile.color);
    const parts = [];
    if (ic) parts.push(ic.name);
    if (col) parts.push(col.name);
    if (profile.number !== undefined && profile.number !== null) parts.push("Zahl " + profile.number);
    return parts.join(", ") || "Zeichen";
  }
  const found = AVATARS.find(a => a.e === profile.avatar);
  return found ? found.n : "Bild";
}

/* Alle Schlüssel, die pro Profil getrennt gespeichert werden.
   Vollständige Liste – Profil-Löschung (resetProfile/deleteProfile) und
   Auto-Migration (ensureProfiles) laufen darüber. Bewusst als Strings
   (Reihenfolge egal), damit die Deklarations-Reihenfolge der KEY-Konstanten
   im Modul keine Rolle spielt. Global bleiben nur profile-liste,
   profil-aktiv und geraet-geteilt – sie stehen hier NICHT drin. */
const PROFILE_BASE_KEYS = ["language-level", "font-size-step", "lernstand", "lern-weg", "lern-weg-gesehen", "vorwissen", "motion", "vorlesen-automatisch", "vorlesen-gefragt", "vorlese-tempo", "einrichtung-rest", "letzte-lektion", "menue-gesehen", "mengen-wahl", "mengen-zuletzt"];

/* Schlüssel für das aktive Profil. Ohne aktives Profil: alter Schlüssel
   (Rückfall – so bricht nie etwas). */
function pKey(base) {
  return activeProfileId ? base + "::" + activeProfileId : base;
}
function pGet(base) { try { return window.localStorage.getItem(pKey(base)); } catch (e) { return null; } }
function pSet(base, val) { try { window.localStorage.setItem(pKey(base), val); } catch (e) { /* nichts tun */ } }
function pRemove(base) { try { window.localStorage.removeItem(pKey(base)); } catch (e) { /* nichts tun */ } }

function genProfileId() {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function saveProfiles() {
  try {
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    if (activeProfileId) window.localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
  } catch (e) { /* nichts tun */ }
}

function loadProfiles() {
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    profiles = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(profiles)) profiles = [];
    const savedActive = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
    activeProfileId = (savedActive && profiles.some(p => p.id === savedActive))
      ? savedActive
      : (profiles[0] ? profiles[0].id : null);
  } catch (e) { profiles = []; activeProfileId = null; }
}

function getActiveProfile() {
  return profiles.find(p => p.id === activeProfileId) || null;
}

/* Beim ersten Start mit der neuen Version: vorhandene Einstellungen eines
   einzelnen Nutzers in ein Standard-Profil übernehmen – nichts geht verloren. */
function ensureProfiles() {
  loadProfiles();
  if (profiles.length > 0) return;
  /* Gibt es Alt-Daten eines früheren Einzel-Nutzers? Dann in ein
     Standard-Profil übernehmen (nichts geht verloren).
     Wenn es wirklich der erste Besuch ist (keine Alt-Daten): KEIN
     Auto-Profil – das Onboarding lässt die Person zuerst ein Bild wählen. */
  let hasLegacy = false;
  PROFILE_BASE_KEYS.forEach(base => {
    try { if (window.localStorage.getItem(base) !== null) hasLegacy = true; } catch (e) { /* egal */ }
  });
  if (!hasLegacy) return;
  const p = { id: genProfileId(), avatar: "🦊" };
  profiles = [p];
  activeProfileId = p.id;
  PROFILE_BASE_KEYS.forEach(base => {
    try {
      const old = window.localStorage.getItem(base);
      if (old !== null) {
        window.localStorage.setItem(base + "::" + p.id, old);
        window.localStorage.removeItem(base);
      }
    } catch (e) { /* nichts tun */ }
  });
  saveProfiles();
}

/* Einstellungen des aktiven Profils frisch in den Speicher laden. */
function loadActiveProfileSettings() {
  languageChosen = false;
  languageLevel = "leicht";
  learnMode = null;
  learnModeChooserOpen = false;
  fontSizeStep = 0;
  loadFontSize();       /* liest + wendet Schriftgröße an */
  loadReadTempo();      /* Vorlese-Tempo (normal / langsam) */
  loadAutoRead();       /* Automatisches Vorlesen (Wahl, Standard: aus) */
  loadMotion();         /* liest + wendet Bewegungs-Einstellung an */
  loadLanguageLevel();  /* setzt languageLevel + languageChosen, falls gemerkt */
  loadLearnMode();
}

/* ============================================================
   Lernstand – nur mit Einwilligung, jederzeit löschbar
   Es wird kein Name gespeichert. Nichts verlässt das Gerät.
   ============================================================ */

const STORAGE_KEY = "lernstand";

function loadProgress() {
  try {
    const raw = pGet(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function saveProgress(progress) {
  try {
    pSet(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    /* Wenn Speichern nicht geht, läuft alles ohne Lernstand weiter. */
  }
}

function isProgressEnabled() {
  const progress = loadProgress();
  return Boolean(progress && progress.enabled);
}

function setProgressEnabled(enabled) {
  if (enabled) {
    const progress = loadProgress() || {};
    progress.enabled = true;
    progress.done = progress.done || {};
    saveProgress(progress);
  } else {
    pRemove(STORAGE_KEY);
  }
}

/* Sitzungs-Gedächtnis für Erfolge: erkennt „geschafft" auch OHNE
   gespeicherten Lernstand (Bandura: Erfolg muss sofort sichtbar sein).
   Nur im Arbeitsspeicher – verschwindet beim Schließen (KDG-konform §14). */
let sessionDoneTopics = new Set();
/* Erreichte Runde je Thema im Uebungs-Handy. Nur Arbeitsspeicher,
   genau wie sessionDoneTopics – ohne Einwilligung wird nichts gespeichert. */
let sessionScenarioStufe = {};
/* Selbstcheck und Kurz-Frage: nur im Arbeitsspeicher, nichts gespeichert (§14).
   Der Vergleich "vorher/nachher" passt in dieselbe Sitzung – dafuer braucht es
   keine Einwilligung und keine neue Datenkategorie. */
let selfAssessmentStart = {};
let miniCheckDone = {};

function markTopicDone(topicId) {
  sessionDoneTopics.add(topicId);
  if (!isProgressEnabled()) return;
  const progress = loadProgress() || { enabled: true, done: {} };
  progress.done = progress.done || {};
  /* Zeitstempel speichern – für Wiederholungs-Erinnerung */
  const existing = progress.done[topicId];
  progress.done[topicId] = { ts: Date.now(), count: (existing && existing.count ? existing.count + 1 : 1) };
  saveProgress(progress);
}

function isTopicDone(topicId) {
  if (sessionDoneTopics.has(topicId)) return true;
  const progress = loadProgress();
  if (!progress || !progress.done) return false;
  const val = progress.done[topicId];
  /* Rückwärts-kompatibel: alter Wert war true (boolean) */
  return Boolean(val);
}

function getTopicDoneTimestamp(topicId) {
  const progress = loadProgress();
  if (!progress || !progress.done) return null;
  const val = progress.done[topicId];
  if (!val) return null;
  if (val === true) return null; /* alter Eintrag ohne Zeitstempel */
  return val.ts || null;
}

function getTopicsDueForReview() {
  if (!isProgressEnabled()) return [];
  const REVIEW_AFTER_MS = 7 * 24 * 60 * 60 * 1000; /* 7 Tage */
  const now = Date.now();
  return topics.filter(topic => {
    const ts = getTopicDoneTimestamp(topic.id);
    return ts && (now - ts) >= REVIEW_AFTER_MS;
  });
}

function countDoneTopics() {
  /* Zählt gespeicherte UND nur in dieser Sitzung geschaffte Themen */
  return topics.filter(topic => isTopicDone(topic.id)).length;
}

/* Nächstes Thema vorschlagen: das erste Thema, das noch nicht geschafft ist.
   Führung ohne Zwang – die freie Wahl bleibt immer erhalten. */
/* Vorschlag „Dein nächstes Thema" (Prüfbericht B17).
   Früher lief die Suche über die Reihenfolge in topics.js. Die Themenseite
   zeigt die Themen aber in der Reihenfolge der TOPIC_GROUPS – der Vorschlag
   sprang dadurch an offenen Themen der Gruppe „Wichtig für alle" vorbei.
   Jetzt folgt der Vorschlag genau der sichtbaren Reihenfolge. */
function getTopicsInDisplayOrder() {
  if (typeof TOPIC_GROUPS === "undefined" || !Array.isArray(TOPIC_GROUPS)) return topics.slice();
  const geordnet = TOPIC_GROUPS
    .flatMap(g => g.ids)
    .map(id => topics.find(t => t.id === id))
    .filter(Boolean);
  const gesehen = new Set(geordnet.map(t => t.id));
  /* Themen ohne Gruppe hängen hinten an – so wie sie die Seite auch zeigt. */
  return geordnet.concat(topics.filter(t => !gesehen.has(t.id)));
}

function getNextTopicSuggestion() {
  return getTopicsInDisplayOrder().find((topic) => !isTopicDone(topic.id)) || null;
}

function toggleProgressSaving() {
  if (isProgressEnabled()) {
    setProgressEnabled(false);
    sessionDoneTopics = new Set();
  sessionScenarioStufe = {};
  sessionRegeln = {};
    announce("Der Lernstand wurde gelöscht. Es wird nichts mehr gespeichert.");
  } else {
    setProgressEnabled(true);
    /* Erfolge aus dieser Sitzung mitnehmen – sonst wäre das gerade
       geschaffte Thema verloren (Erfolgserlebnis sichern). */
    sessionDoneTopics.forEach((id) => markTopicDone(id));
    announce("Der Lernstand wird jetzt auf diesem Gerät gespeichert.");
  }
  /* Auf der Seite bleiben, auf der die Person gerade ist */
  if (activeTab === "lernweg") renderMyPath();
  else renderMenu();
}

/* Lernstand direkt auf der Abschluss-Seite einschalten – ohne die Seite
   neu zu bauen (kein Kontextverlust, kein Sprung). */
function enableProgressInline(button) {
  setProgressEnabled(true);
  sessionDoneTopics.forEach((id) => markTopicDone(id));
  announce("Der Lernstand wird jetzt auf diesem Gerät gespeichert.");
  const box = button.closest(".progress-consent");
  if (box) box.innerHTML = `<p class="progress-consent-title">✓ Ich merke mir deinen Lernstand. Nur auf diesem Gerät. Ohne Namen.</p>`;
}

/* ============================================================
   Wörter-Hilfe (Glossar)
   Schwierige Wörter werden hervorgehoben.
   Antippen öffnet eine kurze Erklärung in Einfacher Sprache.
   ============================================================ */

const GLOSSAR = {
  "internet":               "Das Internet ist ein riesiges Netz aus vielen Computern. So kann man Internetseiten besuchen und Nachrichten schicken.",
  "selbstbestimmt":         "Selbstbestimmt heißt: Du entscheidest selbst. Du wählst, wie und was du lernst.",
  "app":                    "Eine App ist ein Programm auf dem Handy oder Tablet. Apps kann man im App Store oder Play Store herunterladen.",
  "browser":                "Ein Browser ist ein Programm zum Öffnen von Internetseiten. Zum Beispiel Safari, Chrome oder Firefox.",
  "passwort":               "Ein Passwort ist ein geheimes Wort oder eine geheime Zahlenfolge. Es schützt dein Konto.",
  "pin":                    "Eine PIN ist eine geheime Zahl, die du eingibst. Sie schützt zum Beispiel dein Handy oder deine Bankkarte.",
  "konto":                  "Ein Konto ist dein persönlicher Bereich bei einer App oder Webseite. Du loggst dich mit Benutzername und Passwort ein.",
  "profil":                 "Ein Profil ist deine persönliche Seite bei einer App. Dort stehen oft dein Name und dein Foto.",
  "wlan":                   "WLAN ist eine Verbindung zum Internet ohne Kabel. Das Handy verbindet sich per Funk mit dem Router.",
  "daten":                  "Daten sind Informationen, die ein Computer speichert. Zum Beispiel dein Name, Fotos oder Nachrichten.",
  "datenschutz":            "Datenschutz bedeutet: Deine Daten sollen sicher sein. Niemand darf sie ohne deine Erlaubnis weitergeben.",
  "spam":                   "Spam sind unerwünschte Nachrichten oder E-Mails. Du hast sie nicht angefragt. Oft enthalten sie Werbung oder sind gefährlich.",
  "phishing":               "Beim Phishing versucht jemand, dein Passwort oder deine Daten zu stehlen. Oft mit gefälschten E-Mails oder Webseiten.",
  "link":                   "Ein Link ist ein anklickbares Wort oder Bild. Es führt dich zu einer anderen Seite oder Datei.",
  "qr-code":                "Ein QR-Code ist ein schwarzweißes Quadrat mit Muster. Du scannst es mit der Kamera deines Handys.",
  "update":                 "Ein Update ist eine neue Version eines Programms. Es repariert Fehler und macht das Gerät sicherer.",
  "ki":                     "KI steht für Künstliche Intelligenz. Das ist ein Computer-Programm. Es lernt. Und es löst selbst Aufgaben. Zum Beispiel ChatGPT.",
  "chatbot":                "Ein Chatbot ist ein Programm, das mit dir schreibt oder spricht. Es beantwortet Fragen automatisch.",
  "deepfake":               "Ein Deepfake ist ein gefälschtes Bild oder Video. Es sieht echt aus, wurde aber vom Computer erstellt.",
  "algorithmus":            "Ein Algorithmus ist eine Regel, nach der ein Computer entscheidet. Zum Beispiel, welche Videos oder Beiträge dir angezeigt werden.",
  "cloud":                  "Die Cloud ist ein Speicherplatz im Internet. Fotos und Dateien werden dort gespeichert – nicht nur auf dem Gerät.",
  "e-mail":                 "Eine E-Mail ist eine elektronische Nachricht. Du verschickst sie über das Internet an andere Personen.",
  "impressum":              "Das Impressum steht auf Webseiten. Es gibt an, wer die Seite betreibt und wie man ihn erreichen kann.",
  "abonnement":             "Bei einem Abonnement zahlst du regelmäßig, zum Beispiel jeden Monat. Zum Beispiel für Musik, Filme oder Apps.",
  "benachrichtigung":       "Eine Benachrichtigung ist eine kurze Meldung auf dem Bildschirm. Sie zeigt dir: Etwas Neues ist passiert.",
  "screenshot":             "Ein Screenshot ist ein Foto von dem, was gerade auf dem Bildschirm zu sehen ist.",
  "verschlüsselung":        "Verschlüsselung bedeutet: Nachrichten werden beim Senden so verändert, dass nur der richtige Empfänger sie lesen kann.",
  "einstellungen":          "Die Einstellungen sind ein Bereich in einer App oder auf dem Gerät. Dort kannst du viele Dinge anpassen.",
  "datenschutzerklärung":   "Die Datenschutzerklärung erklärt, welche Daten eine App oder Webseite speichert und warum.",
  "zwei-faktor":            "Zwei-Faktor-Schutz bedeutet: Du gibst erst dein Passwort ein, dann noch einen zweiten Code. So ist das Konto doppelt geschützt.",
  "firewall":               "Eine Firewall ist ein Schutzprogramm. Es blockiert gefährliche Verbindungen aus dem Internet.",
  "viren":                  "Viren sind schädliche Programme. Sie können Daten stehlen oder das Gerät beschädigen.",
  "router":                 "Ein Router ist ein Gerät, das die Internetverbindung im Haus verteilt. Er gibt das WLAN-Signal aus.",
  "abo":                    "Ein Abo ist ein Vertrag. Du bekommst etwas regelmäßig. Und du zahlst regelmäßig Geld.",
  "abo-falle":              "Eine Abo-Falle ist ein Trick. Du klickst auf etwas. Und plötzlich hast du einen teuren Vertrag.",
  "abzocke":                "Abzocke ist ein Trick mit Geld. Jemand will dir Geld wegnehmen. Mit falschen Versprechen.",
  "fake news":              "Fake News sind falsche Nachrichten. Sie sehen echt aus. Aber sie stimmen nicht.",
  "fake-profil":            "Ein Fake-Profil ist ein falsches Profil. Die Person gibt sich als jemand anderes aus.",
  "standort":               "Der Standort ist der Ort, wo du gerade bist. Das Handy kann deinen Standort an Apps senden.",
  "emoji":                  "Ein Emoji ist ein kleines Bild in einer Nachricht. Zum Beispiel ein lachendes Gesicht.",
  "kommentar":              "Ein Kommentar ist eine Antwort unter einem Beitrag. Andere können deinen Kommentar lesen.",
  "posten":                 "Posten heißt: etwas ins Internet stellen. Zum Beispiel ein Foto oder einen Text.",
  "blockieren":             "Blockieren heißt: Du sperrst eine Person. Sie kann dir dann nicht mehr schreiben.",
  "melden":                 "Melden heißt: Du sagst der App, dass etwas nicht in Ordnung ist. Die App prüft das dann.",
  "sprach-nachricht":       "Eine Sprach-Nachricht ist eine gesprochene Nachricht. Du nimmst deine Stimme auf und schickst sie.",
  "gewinnspiel":            "Bei einem Gewinnspiel kann man etwas gewinnen. Vorsicht: Viele Gewinnspiele im Internet sind ein Trick.",
  "kauf auf rechnung":      "Kauf auf Rechnung heißt: Du bekommst die Ware zuerst. Du zahlst erst danach. Das ist sicher.",
  "vorkasse":               "Vorkasse heißt: Du zahlst zuerst. Die Ware kommt erst danach. Bei fremden Shops ist das riskant.",
  "online-shop":            "Ein Online-Shop ist ein Geschäft im Internet. Du bestellst dort Waren. Sie kommen mit der Post.",
  "bewertung":              "Eine Bewertung ist die Meinung von Kunden. Zum Beispiel Sterne von 1 bis 5. Sie hilft beim Prüfen.",
  "zwei-faktor-anmeldung":  "Zwei-Faktor heißt: doppelt sichern. Du gibst dein Passwort ein. Dann noch eine Zahl von deinem Handy. Das ist sehr sicher.",
  "passkey":                "Ein Passkey ist eine Anmeldung ohne Passwort. Du bestätigst mit dem Finger oder mit deinem Gesicht. Das ist sehr sicher.",
  "fakeshop-finder":        "Der Fakeshop-Finder ist eine Prüf-Seite von der Verbraucher-Zentrale. Du gibst die Adresse vom Shop ein. Die Seite sagt dir: sicher oder Vorsicht.",
  "quishing":               "Quishing ist Betrug mit falschen QR-Codes. Betrüger kleben falsche Codes über echte. Scanne nur Codes von vertrauten Menschen."
};

let glossarOverlay = null;

/* ============================================================
   Fokus-Falle und Fokus-Rueckgabe fuer die drei Dialoge
   (Woerter-Erklaerung, Pause machen, Was bedeuten die Zeichen)

   Vorher konnte der Tastatur-Fokus jeden dieser Dialoge schon beim
   ERSTEN Tab verlassen und lief dann durch die Seite dahinter weiter -
   sichtbar war aber nur der Dialog. Wer mit der Tastatur bedient, hat
   den Fokus damit verloren.

   Bewusst von Hand geloest und nicht ueber das inert-Attribut: inert
   wird von aelteren Geraeten stillschweigend ignoriert, und dann gaebe
   es gar keine Falle. Diese Fassung funktioniert ueberall gleich.

   EINE Stelle fuer alle drei Dialoge - vorher hatte die
   Woerter-Erklaerung ihre eigene Loesung fuer die Rueckgabe und die
   beiden anderen gar keine.
   ============================================================ */
let _dialogAktiv = null;   /* der gerade offene Dialog */
let _dialogFokus = null;   /* was vorher den Fokus hatte */

const DIALOG_FOKUSSIERBAR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),' +
  ' textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function dialogFokusListe() {
  if (!_dialogAktiv) return [];
  return Array.from(_dialogAktiv.querySelectorAll(DIALOG_FOKUSSIERBAR))
    .filter(el => el.offsetParent !== null || el === document.activeElement);
}

function dialogTabFalle(event) {
  if (!_dialogAktiv || event.key !== "Tab") return;
  const liste = dialogFokusListe();
  if (!liste.length) { event.preventDefault(); return; }
  const erster = liste[0];
  const letzter = liste[liste.length - 1];
  /* Fokus schon draussen? Zurueckholen. */
  if (!_dialogAktiv.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? letzter : erster).focus();
    return;
  }
  if (event.shiftKey && document.activeElement === erster) {
    event.preventDefault();
    letzter.focus();
  } else if (!event.shiftKey && document.activeElement === letzter) {
    event.preventDefault();
    erster.focus();
  }
}

function dialogOeffnen(dialog) {
  if (!dialog) return;
  /* Nur merken, wenn nicht schon ein Dialog offen war - sonst ginge der
     urspruengliche Ausgangspunkt verloren. */
  if (!_dialogAktiv) _dialogFokus = document.activeElement;
  _dialogAktiv = dialog;
  document.addEventListener("keydown", dialogTabFalle, true);
}

function dialogSchliessen(dialog) {
  /* Nur schliessen, wenn wirklich DIESER Dialog offen ist. Escape ruft
     beide Schliess-Wege auf; ohne diese Pruefung wuerde der eine dem
     anderen den Fokus wegnehmen. */
  if (!_dialogAktiv || (dialog && dialog !== _dialogAktiv)) return;
  document.removeEventListener("keydown", dialogTabFalle, true);
  _dialogAktiv = null;
  const zurueck = _dialogFokus;
  _dialogFokus = null;
  if (zurueck && document.contains(zurueck) && typeof zurueck.focus === "function") {
    zurueck.focus();
  }
}

function initGlossar() {
  if (glossarOverlay) return;

  glossarOverlay = document.createElement("div");
  glossarOverlay.className = "glossar-overlay is-hidden";
  glossarOverlay.setAttribute("role", "dialog");
  glossarOverlay.setAttribute("aria-modal", "true");
  glossarOverlay.setAttribute("aria-label", "Wörter-Erklärung");
  glossarOverlay.innerHTML = `
    <div class="glossar-panel">
      <button class="glossar-close" aria-label="Erklärung schließen" type="button">✕ Schließen</button>
      <p class="glossar-word-label">Was bedeutet:</p>
      <p class="glossar-word-title" id="glossarWordTitle"></p>
      <p class="glossar-word-def" id="glossarWordDef"></p>
    </div>`;
  document.body.appendChild(glossarOverlay);

  glossarOverlay.addEventListener("click", (e) => {
    if (e.target === glossarOverlay || e.target.closest(".glossar-close")) {
      hideGlossar();
    }
  });
}

function showGlossar(termKey) {
  const def = GLOSSAR[termKey];
  if (!def || !glossarOverlay) return;
  dialogOeffnen(glossarOverlay);
  const display = termKey.charAt(0).toUpperCase() + termKey.slice(1);
  document.getElementById("glossarWordTitle").textContent = display;
  document.getElementById("glossarWordDef").textContent = def;
  glossarOverlay.classList.remove("is-hidden");
  glossarOverlay.querySelector(".glossar-close").focus();
}

function hideGlossar() {
  if (!glossarOverlay) return;
  glossarOverlay.classList.add("is-hidden");
  dialogSchliessen(glossarOverlay);
}

function initGlossarEvents() {
  content.addEventListener("click", (e) => {
    const term = e.target.closest(".glossar-term");
    if (term) showGlossar(term.dataset.term);
  });
  content.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("glossar-term")) {
      e.preventDefault();
      showGlossar(e.target.dataset.term);
    }
  });
}

/* Hebt Glossar-Wörter im gerade gerenderten Inhalt hervor */
function applyGlossar() {
  if (!glossarOverlay) return;

  const terms = Object.keys(GLOSSAR);
  /* Längere Begriffe zuerst (z. B. "datenschutzerklärung" vor "datenschutz") */
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  const escRe  = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /* Wortgrenze für deutsche Zeichen: kein Buchstabe / Umlaut / Bindestrich davor oder danach */
  const WB = "(?<![\\w\\u00C0-\\u017E-])";
  const WA = "(?![\\w\\u00C0-\\u017E-])";
  const pattern = new RegExp(WB + "(" + sorted.map(escRe).join("|") + ")" + WA, "gi");

  const SKIP = new Set(["H1","H2","H3","H4","BUTTON","A","SCRIPT","STYLE","LABEL","NOSCRIPT"]);

  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let el = node.parentElement;
      while (el) {
        if (SKIP.has(el.tagName)) return NodeFilter.FILTER_REJECT;
        if (el.classList && el.classList.contains("glossar-term")) return NodeFilter.FILTER_REJECT;
        el = el.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const hits = [];
  let node;
  while ((node = walker.nextNode())) {
    pattern.lastIndex = 0;
    if (pattern.test(node.textContent)) hits.push(node);
  }

  hits.forEach((textNode) => {
    const text = textNode.textContent;
    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const span = document.createElement("span");
      span.className = "glossar-term";
      span.textContent = m[0];
      span.dataset.term = m[0].toLowerCase();
      span.setAttribute("tabindex", "0");
      span.setAttribute("role", "button");
      span.setAttribute("aria-label", `Erklärung: ${m[0]}`);
      frag.appendChild(span);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
}

/* ============================================================
   Elemente
   ============================================================ */

const content = document.getElementById("content");
const appTitle = document.getElementById("appTitle");
const moduleLabel = document.getElementById("moduleLabel");
const stepLabel = document.getElementById("stepLabel");
const levelLabel = document.getElementById("levelLabel");
const progressTrack = document.getElementById("progressTrack");
const progressFill = document.getElementById("progressFill");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const soundToggleButton = document.getElementById("soundToggleButton");
const motionToggleButton = document.getElementById("motionToggleButton");
const liveRegion = document.getElementById("liveRegion");
const orientLine = document.getElementById("orientLine");

/* ============================================================
   Hilfsfunktionen
   ============================================================ */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* Helle Farben für Light-Mode */
const TOPIC_COLORS = {
  datenschutz: ["#00285A", "rgba(0, 40, 90, 0.24)",    "rgba(0, 40, 90, 0.08)",    "#EAF1F8"],
  whatsapp:    ["#1DA855", "rgba(37, 211, 102, 0.30)",  "rgba(37, 211, 102, 0.12)", "#E9FBEF"],
  facebook:    ["#1877F2", "rgba(24, 119, 242, 0.28)",  "rgba(24, 119, 242, 0.10)", "#EAF3FF"],
  instagram:   ["#C13584", "rgba(193, 53, 132, 0.28)",  "rgba(193, 53, 132, 0.10)", "#FBEAF4"],
  youtube:     ["#CC0000", "rgba(255, 0, 0, 0.24)",     "rgba(255, 0, 0, 0.09)",    "#FFECEC"],
  snapchat:    ["#A88A00", "rgba(255, 252, 0, 0.42)",   "rgba(255, 252, 0, 0.18)",  "#FFFBD1"],
  tiktok:      ["#111111", "rgba(37, 244, 238, 0.34)",  "rgba(37, 244, 238, 0.12)", "#E8FFFF"],
  /* Hilfe war #C9541C – nur ΔE 9 von der Warnfarbe --warn entfernt. Ausgerechnet
     das Hilfe-Thema sah damit nach Warnung aus. Jetzt ruhiges Petrol
     (ΔE 40 zum naechsten Ton), 5,4:1 auf Weiss. */
  hilfe:       ["#0E7490", "rgba(14, 116, 144, 0.30)",  "rgba(14, 116, 144, 0.12)", "#E7F3F7"],
  ki:          ["#6B3FA0", "rgba(107, 63, 160, 0.28)",  "rgba(107, 63, 160, 0.10)", "#F1EAFA"],
  /* Fakes war #B45309 – exakt die Warnfarbe --warn. Ein Thema sah damit aus
     wie ein Warnhinweis. Jetzt warmes Braun (ΔE 29 zu --warn), 5,9:1 auf Weiss. */
  fakes:       ["#8A5A2B", "rgba(138, 90, 43, 0.28)",   "rgba(138, 90, 43, 0.10)",  "#F6EFE7"],
  /* Betrug war #B91C1C – derselbe Farbton wie YouTube #CC0000 (beide Hue 0), im Dark
     Mode sogar derselbe Wert. Jetzt Rose (Hue 342), 8,0:1 auf Weiss. */
  betrug:      ["#9F1239", "rgba(159, 18, 57, 0.26)",   "rgba(159, 18, 57, 0.10)",  "#FBE9EE"],
  /* Einkaufen war #15803D – im Dark Mode exakt WhatsApp-Gruen. Jetzt Limette (Hue 86),
     5,0:1 auf Weiss. Damit hat das Thema in hell und dunkel dieselbe Identitaet. */
  einkaufen:   ["#4D7C0F", "rgba(77, 124, 15, 0.28)",   "rgba(77, 124, 15, 0.10)",  "#F0F6E4"]
};

/* Hellere Farben für Dark-Mode (auf dunkelm Hintergrund besser lesbar) */
const TOPIC_COLORS_DARK = {
  datenschutz: ["#58a8e0", "rgba(88,168,224,0.30)",  "rgba(88,168,224,0.12)",  "rgba(88,168,224,0.15)"],
  /* war #4ade80 = exakt --good. Ein gruenes WhatsApp-Thema sah aus wie eine
     Richtig-Rueckmeldung. Jetzt Teal-Gruen (ΔE 32 zu --good), 7,1:1 auf
     --surface – und naeher an WhatsApps heutiger Markenfarbe #00A884. */
  whatsapp:    ["#00c9a7", "rgba(0,201,167,0.30)",   "rgba(0,201,167,0.12)",   "rgba(0,201,167,0.15)"],
  facebook:    ["#60a5fa", "rgba(96,165,250,0.30)",  "rgba(96,165,250,0.12)",  "rgba(96,165,250,0.15)"],
  instagram:   ["#f472b6", "rgba(244,114,182,0.30)", "rgba(244,114,182,0.12)", "rgba(244,114,182,0.15)"],
  /* war #f87171 = exakt --bad. Jetzt Koralle (ΔE 22 zu --bad), 7,5:1 auf
     --surface. Weiter auseinander geht im Dark Mode nicht, ohne unter AA zu
     fallen oder mit hilfe/betrug zu kollidieren – siehe Notiz im Memory. */
  youtube:     ["#ff9e80", "rgba(255,158,128,0.30)", "rgba(255,158,128,0.12)", "rgba(255,158,128,0.15)"],
  snapchat:    ["#fde047", "rgba(253,224,71,0.30)",  "rgba(253,224,71,0.12)",  "rgba(253,224,71,0.15)"],
  tiktok:      ["#a5f3fc", "rgba(165,243,252,0.30)", "rgba(165,243,252,0.12)", "rgba(165,243,252,0.15)"],
  /* war #fb923c – ΔE 13 zu --warn. Jetzt Petrol wie in hell, damit das Thema
     in beiden Modi dieselbe Identitaet hat. 6,2:1 auf --surface. */
  hilfe:       ["#06b6d4", "rgba(6,182,212,0.30)",   "rgba(6,182,212,0.12)",   "rgba(6,182,212,0.15)"],
  ki:          ["#c084fc", "rgba(192,132,252,0.30)", "rgba(192,132,252,0.12)", "rgba(192,132,252,0.15)"],
  fakes:       ["#fbbf24", "rgba(251,191,36,0.30)",  "rgba(251,191,36,0.12)",  "rgba(251,191,36,0.15)"],
  /* war #f87171 = exakt YouTube. Jetzt Rose, 8,0:1 auf --surface. */
  betrug:      ["#fda4af", "rgba(253,164,175,0.30)", "rgba(253,164,175,0.12)", "rgba(253,164,175,0.15)"],
  /* war #4ade80 = exakt WhatsApp. Jetzt Limette, 10,0:1 auf --surface. */
  einkaufen:   ["#a3e635", "rgba(163,230,53,0.30)",  "rgba(163,230,53,0.12)",  "rgba(163,230,53,0.15)"]
};

function isDarkMode() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/* Dunklere Text-Varianten für Marken-Farben, die als SCHRIFT auf Weiß
   zu hell sind (Urkunde, Druck-Merk-Karte). AA: mindestens 4,5:1.
   Im Dark Mode sind alle Themen-Farben hell genug (>= 5,4:1). */
const TOPIC_TEXT_LIGHT = {
  whatsapp: "#178643",
  facebook: "#166fe3",
  snapchat: "#897100",
  hilfe:    "#c0501a"
};

function getTopicColorStyle(topicId) {
  const palette = isDarkMode() ? TOPIC_COLORS_DARK : TOPIC_COLORS;
  const [color, ring, bg, icon] = palette[topicId] || palette.datenschutz;
  const textColor = isDarkMode() ? color : (TOPIC_TEXT_LIGHT[topicId] || color);
  return `--topic-text: ${textColor}; --topic-color:${color};--topic-ring:${ring};--topic-hover-bg:${bg};--topic-icon-bg:${icon}`;
}

/* ============================================================
   Piktogramme: eigene, flach gestaltete Icons (lizenzfrei).
   Die SVG-Dateien liegen unter assets/pictograms/<key>.svg.
   (Früher ARASAAC – wurde durch eigene Icons ersetzt.)
   ============================================================ */
function pictoSrc(key) {
  return `assets/pictograms/${key}.svg`;
}

/* Bessere Bild-Zuordnung: sucht anhand des Satz-Textes ein passenderes Icon.
   Nur klare Treffer überschreiben das hinterlegte Bild – sonst bleibt es.
   Zentral und umkehrbar (topics.js wird nicht verändert). */
const PICTO_RULES = [
  [/\bbank\b|sparkasse/i, "pikto-bank"],
  [/geld|euro|bezahl|gekauft|kostet|\bpreis\b|abzock/i, "pikto-money"],
  [/kreditkarte|bezahl-?karte|bank-?karte/i, "pikto-card"],
  [/\bpin\b|geheim-?zahl|\bcode\b|tan\b/i, "pikto-code"],
  [/videos?\b/i, "pikto-video"],
  [/adresse|wo du wohnst|deine wohnung|zuhause/i, "pikto-house"],
  [/genau an|kontrollier|überprüf|prüfe nach/i, "pikto-search"],
  [/fremde|fremder|unbekannte person|unbekannter/i, "pikto-stranger"],
  [/freund/i, "pikto-friend"],
  [/internet|webseite|online|im netz/i, "pikto-globe"],
  [/e-?mail|brief\b/i, "pikto-mail"],
  [/warnzeichen|warn-?zeichen/i, "pikto-warning"],
  [/blockier/i, "pikto-no"],
  [/telefon-?nummer|handy-?nummer|deine nummer/i, "pikto-phone"],
  [/schreib/i, "pikto-message"],
  [/menschen|mensch\b|leute|andere personen|viele personen/i, "pikto-person"]
];
function refinePicto(key, text) {
  if (!text) return key;
  for (let i = 0; i < PICTO_RULES.length; i++) {
    if (PICTO_RULES[i][0].test(text)) return PICTO_RULES[i][1];
  }
  return key;
}

function getTopicById(topicId) {
  return topics.find(topic => topic.id === topicId) || null;
}

function getCurrentTopic() {
  return getTopicById(currentTopicId);
}

function getIconHtml(iconName) {
  if (!iconName) return "";
  return `<img src="assets/icons/${escapeHtml(iconName)}.svg" alt="" aria-hidden="true">`;
}

/* ============================================================
   Alex-&-Tilda-Rollen-Figuren
   Feste Rollen mit beschreibenden Leichte-Sprache-Alt-Texten.
   Diese Bilder tragen Bedeutung -> echtes alt (nicht aria-hidden).
   ============================================================ */

const ROLE_FIGURES = {
  erklaeren:  { file: "alex-tilda-erklaeren.webp",  alt: "Tilda erklärt dir das Thema." },
  achtung:    { file: "alex-tilda-achtung.webp",    alt: "Tilda hebt die Hand. Achtung: Hier ist Vorsicht wichtig." },
  hilfe:      { file: "alex-tilda-hilfe.webp",      alt: "Alex zeigt dir, wo du Hilfe findest." },
  erfolg:     { file: "alex-tilda-erfolg.webp",     alt: "Alex und Tilda freuen sich mit dir. Gut gemacht." },
  nachdenken: { file: "alex-tilda-nachdenken.webp", alt: "Tilda überlegt. Was weißt du schon?" },
  winken:         { file: "alex-tilda-winken.png",         alt: "Alex und Tilda lernen zusammen. Hier beginnt alles." },
  themen:         { file: "alex-tilda-themen.png",         alt: "Tilda zeigt auf die Themen. Such dir etwas aus." },
  lernweg:        { file: "alex-tilda-lernweg.png",        alt: "Tilda hat ein Buch in der Hand. Das ist dein Lern-Weg." },
  einstellungen:  { file: "alex-tilda-einstellungen.png",  alt: "Tilda zeigt auf die Schalter. Stell es dir passend ein." },
  ruhig:          { file: "alex-tilda-ruhig.png",          alt: "Tilda denkt in Ruhe nach. Das macht nichts." }
};

function roleFigure(role, extraClass = "") {
  const f = ROLE_FIGURES[role];
  if (!f) return "";
  const cls = "role-figure" + (extraClass ? " " + extraClass : "");
  return `<img class="${cls}" src="assets/figures/${f.file}" alt="${escapeHtml(f.alt)}" loading="lazy" onerror="this.remove()">`;
}

/* ============================================================
   Lern-Bilder in den Lektionen
   - eigene Illustrationen aus assets/lessons/ (fest eingebunden,
     keine fremden Server, keine Lizenz-Auflagen)
   - jede Lektion bekommt automatisch das Bild zu ihrem Symbol
   ============================================================ */

function getLessonImageHtml(lesson, topic) {
  const key = (lesson && lesson.icon) || (topic && topic.icon) || "";
  if (!key) return "";
  return `<img class="lesson-illustration" src="assets/lessons/${escapeHtml(key)}.svg" alt="" aria-hidden="true" loading="lazy" onerror="this.remove()">`;
}

function setProgressVisible(isVisible) {
  const progressArea = document.querySelector(".progress-area");
  if (progressArea) progressArea.classList.toggle("is-hidden", !isVisible);
}

function setBottomNavVisible(isVisible) {
  const nav = document.querySelector(".nav");
  if (nav) nav.classList.toggle("is-hidden", !isVisible);
}

function setHeader(title, module, step, level, percent) {
  /* Orientierungssatz zurücksetzen – Seiten setzen ihn danach passend neu */
  setOrientation("");
  /* Kompakter Kopf gilt nur auf Lernschritten; renderLesson setzt ihn neu. */
  document.body.classList.remove("lesson-view");
  appTitle.textContent = title || "Sicher und selbstbestimmt im Internet";
  moduleLabel.textContent = module || "Thema auswählen";
  stepLabel.textContent = step || "Themenübersicht";
  levelLabel.textContent = level || "Start";
  const safePercent = Math.max(0, Math.min(100, percent || 0));
  progressFill.style.width = `${safePercent}%`;
  progressTrack.setAttribute("aria-valuenow", String(safePercent));
  progressTrack.setAttribute("aria-valuetext", `${safePercent} Prozent`);
}

function showNav(showBack, showNext, nextText = "Weiter") {
  backButton.disabled = !showBack;
  nextButton.disabled = !showNext;
  nextButton.textContent = nextText;
}

/* ============================================================
   Hauptmenü (Tab-Leiste), Orientierungssatz, Routen-Gedächtnis
   ============================================================ */

/* Merkt sich den aktiven Hauptmenü-Punkt. Lektionen und Quiz erben den
   Punkt der Seite, von der sie gestartet wurden (Kontext bleibt sichtbar). */
let activeTab = "start";

function setActiveTab(name) {
  activeTab = name;
  document.querySelectorAll(".main-tabbar .tab-item").forEach((item) => {
    const isActive = item.dataset.tab === name;
    item.classList.toggle("is-active", isActive);
    if (isActive) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
}

/* Ein Satz sagt immer, wo die Person gerade ist (COGA: Orientierung).
   setHeader() leert den Satz; Seiten setzen ihn danach neu. */
/* Legt die Themenfarbe auf die GANZE Seite, nicht nur auf die Karte.
   Kopfzeile und Fortschritts-Balken liegen ausserhalb von #content und
   konnten die Farbe deshalb nie sehen – sie waren in jedem Thema gleich.
   Genau das war die Rueckmeldung: „nicht so einfach zu sehen, wo man ist".
   Ohne Thema wird die Eigenschaft entfernt, dann greift der Wert aus
   :root (--accent) und alles sieht aus wie vorher. */
function setPageTopicColor(topicId) {
  const app = document.querySelector(".app");
  if (!app) return;
  const palette = isDarkMode() ? TOPIC_COLORS_DARK : TOPIC_COLORS;
  const p = topicId ? palette[topicId] : null;
  if (!p) { app.style.removeProperty("--topic-color"); return; }
  app.style.setProperty("--topic-color", p[0]);
}

function setOrientation(text) {
  if (!orientLine) return;
  orientLine.classList.toggle("is-hidden", !text);
  if (!text) {
    orientLine.textContent = "";
    orientLine.style.borderLeftColor = "";
    setPageTopicColor(null);
    return;
  }
  /* Dreifache Kodierung desselben Signals (UDL): Farbe (Rand), Bild
     (Themen-Symbol) und Satz. Ein eigener Hör-Knopf existiert seit
     Paket H nicht mehr: Die Vorlese-Pille liest den Ort-Satz zuerst
     (siehe readStart / readCurrentPage, das #orientLine voranstellt). */
  let color = "";
  let iconHtml = "";
  if (typeof currentTopicId !== "undefined" && currentTopicId) {
    const palette = isDarkMode() ? TOPIC_COLORS_DARK : TOPIC_COLORS;
    const p = palette[currentTopicId];
    if (p) color = p[0];
    const topic = getTopicById(currentTopicId);
    if (topic && topic.icon) iconHtml = `<span class="orient-icon" aria-hidden="true">${getIconHtml(topic.icon)}</span>`;
  }
  orientLine.innerHTML = `${iconHtml}<span class="orient-text">${escapeHtml(text)}</span>`;
  orientLine.style.borderLeftColor = color;
  /* Dieselbe Farbe an Kopfzeile und Fortschritts-Balken. */
  setPageTopicColor(color ? currentTopicId : null);
}

/* Schreibt die aktuelle Seite in die Adresszeile, damit der
   Zurück-Knopf des Browsers vorhersehbar funktioniert. */
let handlingRoute = false;

function rememberRoute(route) {
  if (handlingRoute) return; /* Aufruf kam aus handleHash: Hash stimmt schon */
  const target = "#" + route;
  if (window.location.hash === target) return;
  try {
    /* Beim allerersten Aufruf (noch kein Hash) keinen zusätzlichen
       Verlaufs-Eintrag anlegen, sonst führt „Zurück" ins Leere. */
    if (!window.location.hash) history.replaceState(null, "", target);
    else history.pushState(null, "", target);
  } catch (e) { /* nichts tun */ }
}

/* Klick auf einen Hauptmenü-Punkt */
function navigateTab(name) {
  stopReading();
  /* Wer während der Einweisung ins Menü wechselt, hat sich für den
     freien Weg entschieden – die geführte Einweisung endet dann sauber
     (Selbstbestimmung; verhindert spätere Überraschungs-Sprünge). */
  onboarding = false;
  if (name === "start") return renderIntro();
  if (name === "themen") return renderMenu();
  if (name === "lernweg") return renderMyPath();
  if (name === "hilfe") return renderHelpPage();
  if (name === "einstellungen") return renderSettingsPage();
}

function announce(text) {
  if (!liveRegion) return;
  /* Kurz leeren, damit Screenreader dieselbe Meldung erneut vorliest */
  liveRegion.textContent = "";
  if (text) setTimeout(() => { liveRegion.textContent = text; }, 50);
}

function focusContent() {
  content.focus();
  /* Hör-Modus („Mit Hilfe der App"): jede Seite liest sich selbst vor –
     sanft verzögert, jederzeit mit Stopp abbrechbar (Angebot, kein Zwang). */
  if (typeof autoRead !== "undefined" && autoRead && supportsSpeech()) {
    window.setTimeout(() => { if (autoRead) readStart(); }, 450);
  }
  const reduceMotion = !motionEnabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  applyGlossar();
}

/* ============================================================
   Töne (standardmäßig aus, keine Speicherung)
   ============================================================ */

function updateSoundButton() {
  /* Aktualisiert alle Ton-Schalter (z. B. auf der Einstellungen-Seite) */
  document.querySelectorAll(".sound-toggle").forEach((button) => {
    button.classList.toggle("sound-on", soundEnabled);
    button.classList.toggle("sound-off", !soundEnabled);
    button.textContent = soundEnabled ? "Töne an" : "Töne aus";
    button.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
    button.setAttribute(
      "aria-label",
      soundEnabled ? "Töne sind an. Klicken zum Ausschalten." : "Töne sind aus. Klicken zum Einschalten."
    );
  });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  updateSoundButton();
  if (soundEnabled) {
    playSound("toggle");
    announce("Töne sind eingeschaltet.");
  } else {
    announce("Töne sind ausgeschaltet.");
  }
}

/* ============================================================
   Bewegung / Animationen (Schalter; Default = System-Einstellung)
   ============================================================ */

function applyMotion() {
  document.documentElement.classList.toggle("no-motion", !motionEnabled);
}

function updateMotionButton() {
  /* Aktualisiert alle Bewegungs-Schalter (z. B. auf der Einstellungen-Seite) */
  document.querySelectorAll(".motion-toggle").forEach((button) => {
    button.classList.toggle("motion-on", motionEnabled);
    button.classList.toggle("motion-off", !motionEnabled);
    button.textContent = motionEnabled ? "Bewegung an" : "Bewegung aus";
    button.setAttribute("aria-pressed", motionEnabled ? "true" : "false");
    button.setAttribute(
      "aria-label",
      motionEnabled ? "Bewegungen sind an. Klicken zum Ausschalten." : "Bewegungen sind aus. Klicken zum Einschalten."
    );
  });
}

function loadMotion() {
  const saved = pGet(MOTION_KEY);
  if (saved === "on") motionEnabled = true;
  else if (saved === "off") motionEnabled = false;
  else motionEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  applyMotion();
  updateMotionButton();
}

function toggleMotion() {
  motionEnabled = !motionEnabled;
  pSet(MOTION_KEY, motionEnabled ? "on" : "off");
  applyMotion();
  updateMotionButton();
  announce(motionEnabled ? "Bewegungen sind eingeschaltet." : "Bewegungen sind ausgeschaltet.");
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function playTone(frequency, duration, volume, type = "sine", delay = 0) {
  if (!soundEnabled) return;
  try {
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime + delay;
    const endTime = startTime + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime + 0.02);
  } catch (error) {
    /* Ton ist Zusatz. Ohne Ton läuft alles weiter. */
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  if (type === "hover") {
    playTone(520, 0.045, 0.045, "sine");
  } else if (type === "correct") {
    playTone(660, 0.12, 0.075, "sine", 0);
    playTone(880, 0.14, 0.065, "sine", 0.10);
  } else if (type === "wrong") {
    playTone(220, 0.18, 0.060, "triangle", 0);
  } else if (type === "success") {
    playTone(523.25, 0.12, 0.065, "sine", 0);
    playTone(659.25, 0.12, 0.065, "sine", 0.11);
    playTone(783.99, 0.18, 0.060, "sine", 0.22);
  } else if (type === "toggle") {
    playTone(600, 0.10, 0.050, "sine", 0);
  }
}

/* Leiser Orientierungston bei Hover/Fokus – nur wenn Töne an sind. */
let lastHoverSoundAt = 0;
let lastHoverSoundTarget = null;

function playHoverSound(event) {
  if (!soundEnabled) return;
  const target = event.target.closest(
    ".topic-card, .action-card, .support-help-button, .answer-option, .card-read-button, .reading-button, .plain-back-button, .nav-button"
  );
  if (!target) return;

  const now = Date.now();
  if (target === lastHoverSoundTarget && now - lastHoverSoundAt < 1200) return;
  if (now - lastHoverSoundAt < 350) return;

  lastHoverSoundTarget = target;
  lastHoverSoundAt = now;
  playSound("hover");
}

/* ============================================================
   Vorlesen (nur nach Klick, keine Speicherung)
   ============================================================ */

function supportsSpeech() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/* Zustand für satzweises Vorlesen mit Mitlesen-Hervorhebung. */
let _readQueue = [];
let _readIndex = 0;
let _readRate = 0.85;
let _readGen = 0;   /* macht alte Vorlese-Abläufe ungültig */

function clearReadingHighlight() {
  document.querySelectorAll(".reading-highlight").forEach(e => e.classList.remove("reading-highlight"));
}

function readShortText(text, el) {
  if (!supportsSpeech()) return;
  const cleaned = String(text || "").trim();
  if (!cleaned) return;
  _readGen++;
  const gen = _readGen;
  window.speechSynthesis.cancel();
  clearReadingHighlight();
  if (el) el.classList.add("reading-highlight");
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = "de-DE";
  utterance.rate = 0.82;
  utterance.pitch = 1;
  utterance.onend = () => { if (gen === _readGen) clearReadingHighlight(); };
  utterance.onerror = () => { if (gen === _readGen) clearReadingHighlight(); };
  window.speechSynthesis.speak(utterance);
}

function stopReading() {
  if (!supportsSpeech()) return;
  _readGen++;                 /* laufenden Ablauf ungültig machen */
  window.speechSynthesis.cancel();
  clearReadingHighlight();
  setReadingActive(null);
  updateReadingStatus("Vorlesen gestoppt.");
}

/* Markiert den aktiven Vorlese-Knopf grün, damit man immer sieht, was läuft. */
function setReadingActive(mode) {
  const n = document.querySelector(".reading-button-normal");
  const s = document.querySelector(".reading-button-slow");
  if (n) {
    const on = mode === "normal" || mode === "slow";
    n.classList.toggle("is-active", on);
    n.setAttribute("aria-pressed", on ? "true" : "false");
    /* Beschriftung mitschalten, damit der Knopf sagt, was er als Nächstes tut. */
    const label = n.querySelector(".rb-label");
    /* Paket G: Der aktive Zustand heisst "Liest vor" statt "Stopp".
       Das Stopp-Quadrat rechts in der Pille sagt, was ein Druck bewirkt
       (Medien-Konvention); die Schrift sagt, was gerade passiert. */
    if (label) label.textContent = on ? "Liest vor" : "Vorlesen";
  }
  if (s) { s.classList.toggle("is-active", mode === "slow"); s.setAttribute("aria-pressed", mode === "slow" ? "true" : "false"); }
}

function updateReadingStatus(text) {
  const status = document.getElementById("readingStatus");
  if (status) status.textContent = text || "";
}

/* Auswahl-Karten, die selbst <button> sind. Ihr Text muss trotzdem vorgelesen
   werden – siehe readCurrentPage(). An EINER Stelle definiert, damit die beiden
   Nutzungen (Auswahl, Satztrennung) nicht auseinanderlaufen. */
const KARTEN_SELEKTOR = ".topic-card, .action-card, .learn-mode-card";
/* Handlungs-Knoepfe, die mitgelesen werden. Sie bestehen aus mehreren
   Teilen (<strong>Kurz</strong><span>Nur das Wichtigste.</span>) und muessen
   wie Karten zerlegt werden – sonst spricht die Stimme "KurzNur". */
/* `.support-help-button` traegt das Unterstuetzungs-Angebot auf dem
   Themen-Einstieg ("Du brauchst Unterstuetzung? Hilfe anzeigen.").
   Ohne diesen Eintrag war es fuer hoerende Nutzung unsichtbar –
   ausgerechnet das Angebot, das sich an die Menschen richtet, die
   aufs Vorlesen angewiesen sind. */
const AKTION_SELEKTOR = ".topic-start-button, .amount-choice, .later-chip, .support-help-button";

/* Lautsprecher-Symbol der Karten-Vorlesen-Knoepfe. Global, weil es
   frueher als lokale Konstante in renderMenu lag – jede Seite ausserhalb
   warf damit "readCardSvg is not defined". */
const READ_CARD_SVG = `<svg class="rb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L9 9H4z" fill="currentColor"/><path d="M16 8.6a4 4 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.6 6.2a7 7 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

function cleanSpeechText(text) {
  return String(text || "")
    .replace(/[←→➜]/g, "")
    .replace(/[✓✕✔✅]/g, "")     /* Haken/Kreuze werden sonst als Zeichen gesprochen */
    .replace(/ℹ️|👋|📵|📖|🎉|🧠/g, "")   /* Bild-Zeichen in Knopf- und Titeltexten */
    .replace(/%/g, " Prozent")
    .replace(/\s+/g, " ")
    .trim();
}

/* Liest die Seite Satz für Satz vor und hebt den aktuellen Satz hervor
   (Mitlesen, §3). Satzweise = zuverlässig auf allen Geräten. */
function readCurrentPage(rate) {
  if (!supportsSpeech()) {
    updateReadingStatus("Vorlesen geht auf diesem Gerät nicht.");
    return;
  }
  _readGen++;
  const gen = _readGen;
  window.speechSynthesis.cancel();
  clearReadingHighlight();

  const root = document.querySelector("[data-readable='true']") || content;
  /* Antwort-Optionen werden MIT vorgelesen (nummeriert) – sonst hört eine
     nicht lesende Person die Frage, aber nie die Antworten. */
  const OPTION = ".answer-option, .sa-option-btn, .sample-option";
  /* Auswahl-Karten sind selbst <button>. Ohne diese Ausnahme ueberspringt der
     Filter unten ihren gesamten Text – auf der Themen-Seite hiess das: der
     grosse Vorlesen-Knopf sagte "Wähle ein Thema" und nannte dann KEINES der
     12 Themen. Fuer eine nicht lesende Person war die Seite damit nutzlos.
     Die Karten kommen als Ganzes in die Warteschlange, werden also auch
     hervorgehoben und ins Bild gescrollt (Mitlesen, §3). */
  const KARTE = KARTEN_SELEKTOR;
  /* Handlungs-Knoepfe auf dem Themen-Einstieg. Ohne sie hoerte eine nicht
     lesende Person den Themen-Text, aber nie "Lernen starten", "Kurz/Mehr"
     oder "Quiz machen" – die Seite blieb fuer sie eine Sackgasse. */
  const AKTION = AKTION_SELEKTOR;
  const els = root
    ? Array.from(root.querySelectorAll("h2, h3, p, li, " + OPTION + ", " + KARTE + ", " + AKTION)).filter(el => {
        const isOption = el.matches(OPTION);
        const isKarte = el.matches(KARTE);
        const isAktion = el.matches(AKTION);
        /* Nichts vorlesen, was gerade zugeklappt ist: der Begleit-Bereich
           enthaelt Fachtexte (DigComp, ICF) und ist fast 4000 px hoch. Sein
           Kasten hat overflow:hidden – die Kinder behalten dadurch eine
           Groesse, obwohl sie niemand sieht. Nur auf <details open> pruefen. */
        if (el.closest(".companion-panel")) return false;
        if (el.closest("details:not([open])")) return false;
        if (el.closest(".is-hidden, [hidden]")) return false;
        if (!isOption && !isKarte && !isAktion && el.closest(".reading-toolbar, nav, footer, button")) return false;
        /* Text INNERHALB einer Karte nicht zusaetzlich einzeln lesen */
        if (!isKarte && el.closest(KARTE)) return false;
        if (!isAktion && el.closest(AKTION)) return false;
        return cleanSpeechText(el.textContent).length > 0;
      })
    : [];
  /* Optionen nummerieren: „Antwort 1: …" */
  els.forEach(el => {
    if (!el.matches || !el.matches(OPTION) || !el.parentElement) return;
    const geschwister = Array.from(el.parentElement.children).filter(c => c.matches && c.matches(OPTION));
    const n = geschwister.indexOf(el) + 1;
    if (n > 0) el.setAttribute("data-read-prefix", "Antwort " + n + ":");
  });
  /* Zuerst sagen, WO die Person ist – dann den Inhalt (Orientierung zum Hören) */
  if (orientLine && !orientLine.classList.contains("is-hidden")) {
    const orientSpan = orientLine.querySelector(".orient-text");
    if (orientSpan) els.unshift(orientSpan);
  }
  /* Handlungsansage am Ende: Nicht-Leser erfahren sonst nie, welche
     Knöpfe es gibt. Kurz, immer gleiches Muster (Vorhersehbarkeit). */
  const hatOptionen = root && root.querySelector(OPTION);
  /* Rückmeldeseiten (nach einer Antwort, und die Sicherheitsfragen im
     Profil): ihre Knöpfe heißen `feedback-button` und fielen durch jedes
     Raster. Das Vorlesen endete dort nach der Erklärung – wer die App
     hörend bedient, saß nach JEDER Frage vor einer Sackgasse.
     Die Ansage wird aus den Knöpfen gebaut, die wirklich dastehen, damit
     Text und Bildschirm nicht auseinanderlaufen können. */
  const rueckmeldeKnoepfe = root
    ? Array.from(root.querySelectorAll(".feedback-actions .feedback-button"))
        .filter(b => !b.disabled && b.offsetParent !== null)
        .map(b => cleanSpeechText(b.textContent))
        .filter(Boolean)
    : [];
  /* Der Hilfe-Knopf steckt in einem <button> und fiel deshalb durch jedes
     Raster – wer nicht liest, erfuhr nie, dass es ihn gibt (V-5). Der Satz
     wird aus dem Knopf gebaut, der wirklich dasteht. */
  const hilfeKnopf = root ? root.querySelector(".task-help-button") : null;
  const hilfeSatz = hilfeKnopf
    ? " Wenn du unsicher bist, tippe auf: " + cleanSpeechText(hilfeKnopf.textContent) + "."
    : "";
  if (hatOptionen) {
    els.push({ pseudoText: "Tippe jetzt deine Antwort." + hilfeSatz });
  } else if (rueckmeldeKnoepfe.length) {
    els.push({ pseudoText: "Du kannst jetzt auf " + rueckmeldeKnoepfe[0] + " tippen."
      + rueckmeldeKnoepfe.slice(1).map(n => " Oder auf " + n + ".").join("")
      + hilfeSatz });
  } else if (nextButton && !nextButton.disabled) {
    els.push({ pseudoText: backButton && !backButton.disabled
      ? "Du kannst jetzt Weiter drücken. Oder Zurück."
      : "Du kannst jetzt Weiter drücken." });
  } else {
    const start = root ? root.querySelector(".topic-start-button, .intro-start-button, .primary-action") : null;
    if (start) {
      let ansage = "Drücke den großen Knopf: " + cleanSpeechText(start.textContent) + ".";
      /* Zweiter Weg in die App auf der Startseite. Ohne diesen Zusatz
         kennt die Abkürzung nur, wer liest. Kommt NACH dem großen Knopf,
         damit die Hauptsache zuerst genannt wird. */
      const zweiterWeg = root.querySelector(".intro-quickstart-link");
      if (zweiterWeg) ansage += " Oder tippe auf: " + cleanSpeechText(zweiterWeg.textContent) + ".";
      els.push({ pseudoText: ansage });
    }
  }
  if (!els.length) {
    updateReadingStatus("Es gibt keinen Text zum Vorlesen.");
    return;
  }
  _readQueue = els;
  _readIndex = 0;
  _readRate = rate || speechRate;
  speakNextSentence(gen);
}

/* Text einer Auswahl-Karte fuer die Sprachausgabe zusammensetzen.
   Ohne Trennung liefe alles in einem Atemzug durch:
   "Starte hier Datenschutz Private Daten und Passwörter schützen".
   Jede Zeile der Karte wird deshalb ein eigener Satz. */
function kartenText(el) {
  const kopie = el.cloneNode(true);
  kopie.querySelectorAll(".answer-num, .card-read-button").forEach(n => n.remove());
  const teile = [];
  kopie.querySelectorAll("*").forEach(n => {
    if (n.children.length === 0) {
      const t = n.textContent.trim();
      if (t) teile.push(t.replace(/[.\s]+$/, ""));
    }
  });
  if (!teile.length) return kopie.textContent;
  /* Punkt nur setzen, wo noch keines steht. Sonst entsteht bei einer Zeile
     wie "Du brauchst Unterstützung?" das gesprochene "Unterstützung?." */
  return teile.map(t => /[.!?]$/.test(t) ? t : t + ".").join(" ");
}

function speakNextSentence(gen) {
  if (gen !== _readGen) return;
  clearReadingHighlight();
  if (_readIndex >= _readQueue.length) {
    setReadingActive(null);
    updateReadingStatus("Vorlesen fertig.");
    return;
  }
  const el = _readQueue[_readIndex];
  const istPseudo = !!(el && el.pseudoText);
  const prefix = (!istPseudo && el.getAttribute && el.getAttribute("data-read-prefix")) ? el.getAttribute("data-read-prefix") + " " : "";
  let roherText;
  if (istPseudo) {
    roherText = el.pseudoText;
  } else if (el.matches && (el.matches(KARTEN_SELEKTOR) || el.matches(AKTION_SELEKTOR))) {
    roherText = prefix + kartenText(el);
  } else if (el.querySelector && el.querySelector(".answer-num, .card-read-button")) {
    /* Auch bei Karten: der eingebaute Vorlese-Knopf darf nicht mitgesprochen
       werden (sonst hoert man "… Vorlesen" hinter jedem Kartentext). */
    roherText = prefix + kartenText(el);
  } else {
    roherText = prefix + el.textContent;
  }
  const text = cleanSpeechText(roherText);
  if (!text) { _readIndex++; return speakNextSentence(gen); }

  if (!istPseudo) el.classList.add("reading-highlight");
  /* Den aktuellen Satz sichtbar halten – aber nur scrollen, wenn er aus dem
     Bild läuft (kein ständiges Springen). */
  if (!istPseudo) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = el.getBoundingClientRect();
    if (r.top < 90 || r.bottom > window.innerHeight - 90) {
      try { el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); } catch (e) { /* nichts */ }
    }
  }

  const slow = _readRate && _readRate < 0.8;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = _readRate;
  u.pitch = 1;
  u.volume = 1;
  u.onstart = () => {
    if (gen !== _readGen) return;
    setReadingActive(slow ? "slow" : "normal");
    updateReadingStatus(slow ? "Langsam vorlesen läuft." : "Vorlesen läuft.");
  };
  u.onend = () => { if (gen !== _readGen) return; _readIndex++; speakNextSentence(gen); };
  u.onerror = () => { if (gen !== _readGen) return; _readIndex++; speakNextSentence(gen); };
  window.speechSynthesis.speak(u);
}

/* Liest nur EINEN Abschnitt vor (statt der ganzen Seite) – für lange
   Seiten wie Hilfe und Einstellungen. Gleiches Hervorheben wie sonst. */
function readSectionFrom(button) {
  if (!supportsSpeech()) { updateReadingStatus("Vorlesen geht auf diesem Gerät nicht."); return; }
  const section = button.closest(".settings-page-section, .support-help-card, .intro-offer");
  if (!section) return;
  _readGen++;
  const gen = _readGen;
  window.speechSynthesis.cancel();
  clearReadingHighlight();
  const els = Array.from(section.querySelectorAll("h3, h4, p, li")).filter(el =>
    !el.closest("button") && cleanSpeechText(el.textContent).length > 0);
  if (!els.length) return;
  _readQueue = els;
  _readIndex = 0;
  _readRate = (typeof readTempo !== "undefined" && readTempo === "langsam") ? 0.5 : 0.85;
  speakNextSentence(gen);
}

/* Kleiner Lautsprecher-Chip für einen Abschnitt */
function sectionReadChip(label) {
  /* H-01: echter Knopf statt span mit role="button".
     Das war die EINZIGE Stelle, an der die Tastatur-Bedienung von Hand
     nachgebaut war (onkeydown fuer Enter und Leertaste). Ein nativer
     button kann das von sich aus, der Handler faellt ersatzlos weg.
     Hier gefahrlos moeglich, weil dieser Chip in einer Ueberschrift
     steht und nicht - wie der auf der Themenkarte - in einem button.
     Ausserdem traegt er kein data-read-card-text, der zentrale
     Listener greift also nicht und kann nicht doppelt ausloesen. */
  return `<button type="button" class="card-read-button card-read-button--section" onclick="readSectionFrom(this)" aria-label="Abschnitt ${escapeHtml(label)} vorlesen"><svg class="rb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L9 9H4z" fill="currentColor"/><path d="M16 8.6a4 4 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.6 6.2a7 7 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`;
}

function readNormal() { readCurrentPage(0.85); }
function readSlow() { readCurrentPage(0.50); }

/* Vorlese-Tempo ist eine EINSTELLUNG (einmal wählen), keine Entscheidung
   bei jedem Vorlesen. Weniger Knöpfe am Ort der Handlung (Hick, CLT). */
/* Automatisches Vorlesen ist eine WAHL (Standard: aus). Die Person wird
   im Einstieg einmal gefragt und kann es jederzeit in den Einstellungen
   ändern (§3: Vorlesen als Angebot, nie als Zwang). */
const AUTO_READ_KEY = "vorlesen-automatisch";
const AUTO_READ_GEFRAGT_KEY = "vorlesen-gefragt";
let autoRead = false;

function loadAutoRead() {
  autoRead = pGet(AUTO_READ_KEY) === "an";
}

function setAutoRead(an, still) {
  autoRead = !!an;
  pSet(AUTO_READ_KEY, autoRead ? "an" : "aus");
  if (!still) {
    announce(autoRead
      ? "Gut. Ich lese dir jede Seite automatisch vor. Mit Stopp kannst du das Vorlesen immer anhalten."
      : "In Ordnung. Ich lese nur vor, wenn du auf Vorlesen drückst.");
  }
}

const READ_TEMPO_KEY = "vorlese-tempo";
let readTempo = "normal";
function loadReadTempo() {
  const saved = pGet(READ_TEMPO_KEY);
  readTempo = saved === "langsam" ? "langsam" : "normal";
}
function setReadTempo(t) {
  readTempo = t === "langsam" ? "langsam" : "normal";
  pSet(READ_TEMPO_KEY, readTempo);
  announce(readTempo === "langsam" ? "Vorlesen ist jetzt langsam." : "Vorlesen ist jetzt normal schnell.");
  renderSettingsPage();
}
function readStart() {
  if (readTempo === "langsam") readSlow(); else readNormal();
}

function buildReadingToolbar() {
  if (!supportsSpeech()) {
    return `
      <div class="reading-toolbar" aria-label="Vorlesen">
        <p class="reading-unavailable">Vorlesen geht auf diesem Gerät vielleicht nicht.</p>
      </div>
    `;
  }
  /* EIN Umschalter statt zwei Knöpfen: "Vorlesen" wird zu "Stopp", solange
     vorgelesen wird. Vorher stand "Stopp" dauerhaft in Warn-Rot da, obwohl
     nichts lief – das widerspricht §10 ("Rot nur sparsam für Warnungen") und
     kostet auf jedem Schritt eine halbe Zeile. Funktion bleibt vollständig. */
  /* Paket G: EINE laute Primaeraktion. Beide Symbole stehen immer im Markup,
     das CSS blendet ueber .is-active um – so bleibt der Zustandswechsel eine
     reine Darstellungssache und die Vorlese-Logik unberuehrt. Der Wrapper
     .reading-toolbar MUSS bleiben: readCurrentPage() schliesst genau ihn vom
     Vorlesen aus, sonst liest sich die Bedien-Zeile selbst mit vor. */
  return `
    <div class="reading-toolbar" aria-label="Vorlesen">
      <button type="button" class="reading-button reading-button-normal" aria-pressed="false" onclick="toggleReading()">
        <span class="rb-coin" aria-hidden="true">
          <svg class="rb-ico rb-ico-speak" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L9 9H4z" fill="currentColor"/><path d="M16 8.6a4 4 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.6 6.2a7 7 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <span class="rb-eq"><i></i><i></i><i></i><i></i></span>
        </span>
        <span class="rb-label">Vorlesen</span>
        <span class="rb-stop" aria-hidden="true"></span>
      </button>
      <p id="readingStatus" class="reading-status" aria-live="polite"></p>
    </div>
  `;
}

/* Umschalter: läuft gerade etwas -> anhalten, sonst starten. */
function toggleReading() {
  const button = document.querySelector(".reading-button-normal");
  if (button && button.classList.contains("is-active")) stopReading();
  else readStart();
}

/* ============================================================
   Einfach-Modus, Pause, Symbol-Hilfe
   ============================================================ */

function toggleSimpleMode() {
  simpleMode = !simpleMode;
  document.body.classList.toggle("simple-mode", simpleMode);
  updateSimpleModeButton();
}

function updateSimpleModeButton() {
  const button = document.getElementById("simpleModeButton");
  if (!button) return;
  button.textContent = simpleMode ? "Einfach-Modus an" : "Einfach-Modus aus";
  button.setAttribute("aria-pressed", simpleMode ? "true" : "false");
}

function showPauseOverlay() {
  closeCalmOverlay();
  const overlay = document.createElement("div");
  overlay.id = "pauseOverlay";
  overlay.className = "calm-overlay";
  overlay.innerHTML = `
    <div class="calm-box" role="dialog" aria-modal="true" aria-labelledby="pauseTitle">
      <h2 id="pauseTitle">Pause machen</h2>
      <p>Du kannst kurz Pause machen.</p>
      <p>Atme ruhig.</p>
      <p>Mach weiter, wenn du bereit bist.</p>
      <button type="button" class="primary-action" onclick="closeCalmOverlay()">Weiter lernen</button>
    </div>
  `;
  document.body.appendChild(overlay);
  dialogOeffnen(overlay);
  const button = overlay.querySelector("button");
  if (button) button.focus();
}

function showSymbolHelp() {
  closeCalmOverlay();
  const overlay = document.createElement("div");
  overlay.id = "pauseOverlay";
  overlay.className = "calm-overlay";
  overlay.innerHTML = `
    <div class="calm-box symbol-help-dialog" role="dialog" aria-modal="true" aria-labelledby="symbolTitle">
      <h2 id="symbolTitle">Was bedeuten die Zeichen?</h2>
      <ul class="symbol-help-list">
        <li><strong><svg class="rb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L9 9H4z" fill="currentColor"/><path d="M16 8.6a4 4 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.6 6.2a7 7 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></strong> bedeutet: Vorlesen.</li>
        <li><strong>?</strong> bedeutet: Hilfe.</li>
        <li><strong>✓</strong> bedeutet: richtig oder geschafft.</li>
        <li><strong>!</strong> bedeutet: Achtung.</li>
        <li><strong>Stopp</strong> bedeutet: Anhalten.</li>
        <li><strong>Das Menü unten</strong> bringt dich zu: Start, Themen, Mein Lernweg, Hilfe und Einstellungen.</li>
      </ul>
      <button type="button" class="primary-action" onclick="closeCalmOverlay()">Schließen</button>
    </div>
  `;
  document.body.appendChild(overlay);
  dialogOeffnen(overlay);
  const button = overlay.querySelector("button");
  if (button) button.focus();
}

function closeCalmOverlay() {
  const overlay = document.getElementById("pauseOverlay");
  if (!overlay) return;
  overlay.remove();
  /* Erst entfernen, dann den Fokus zurueckgeben - sonst landet er kurz
     auf einem Element, das gleich verschwindet. */
  dialogSchliessen(overlay);
}

/* Sprache und Pause bleiben sichtbar.
   Zwischenzeitlich lagen beide hinter einem Aufklapper ("Sprache und Pause").
   Das spart Platz, widerspricht aber §3/§9: Wer eine Pause braucht, soll den
   Knopf sehen und nicht erst suchen. Der Platz kommt stattdessen aus der
   gemeinsamen Zeile mit dem Vorlese-Knopf (buildToolRow).
   Reihenfolge Pause vor Sprache: "Vorlesen" und "Pause machen" passen zusammen
   in die erste Zeile (131 + 153 px), der breitere Sprach-Knopf rutscht in die
   zweite. Das spart eine ganze Zeile, ohne etwas zu verstecken.
   §1 Pause-Funktion, §2 "Sprache jederzeit umstellbar". */
function buildUtilityBar() {
  /* Paket G: leise Sekundaeraktionen als Chip-Kapsel neben der Vorlese-Pille.
     Sichtbar steht am Sprach-Chip nur der Stufenname; das Wort "Sprache:"
     lebt im aria-label, damit der zugaengliche Name den sichtbaren Text
     enthaelt (WCAG 2.2 SC 2.5.3 Label in Name). */
  return `
    <div class="utility-bar" role="group" aria-label="Pause und Sprache">
      <button type="button" class="utility-chip pause-button" onclick="showPauseOverlay()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>
        <span>Pause</span>
      </button>
      <button type="button" class="utility-chip language-switch-button" onclick="renderLanguageChoice()" aria-label="Sprache: ${escapeHtml(LANGUAGE_LABEL[languageLevel])}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        <span>${escapeHtml(LANGUAGE_LABEL[languageLevel])}</span>
      </button>
    </div>
  `;
}

/* Vorlese-Knopf und "Sprache und Pause" standen als zwei getrennte Karten
   untereinander (90 px + 58 px). Sie gehoeren beide zur Bedienung, nicht zum
   Inhalt – deshalb jetzt EINE Zeile. Auf allen Seiten gleich, damit die
   Bedienung vorhersehbar bleibt (§3 Emotionale Sicherheit). */
function buildToolRow() {
  return `<div class="tool-row">${buildReadingToolbar()}${buildUtilityBar()}</div>`;
}

/* ============================================================
   Fußzeile
   ============================================================ */

function renderLegalFooter() {
  const old = document.querySelector(".small-footer-notice");
  if (old) old.remove();

  const footer = document.createElement("footer");
  footer.className = "small-footer-notice";
  footer.innerHTML = `
    <p>Dies ist ein unabhängiges Bildungsangebot. Es ist kein offizielles Angebot von WhatsApp, Facebook, Instagram, YouTube, Snapchat, TikTok oder anderen Firmen.</p>
    <p>Es wird kein Name gespeichert. Der Lernstand wird nur gespeichert, wenn du das möchtest.<br />
    <a href="ersteller.html">Ersteller</a> · <a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a> · <a href="barrierefreiheit.html">Barrierefreiheit</a> · <a href="sprachstufen.html">Die Sprachstufen</a></p>
  `;
  const appRoot = document.querySelector(".app") || document.body;
  appRoot.appendChild(footer);
}

/* ============================================================
   Startseite: Themenübersicht
   ============================================================ */

function chooseLanguage(level) {
  setLanguageLevel(level);
  /* Im Erststart geht es nach der Sprache direkt zu den Themen (F3).
     Vorwissen und Vorlesen werden nicht mehr vorab gefragt, sondern erst
     hinter dem ersten Thema (Pruefbericht B10) - dann kann die Person die
     Frage aus Erfahrung beantworten statt ins Blaue.
     Beim späteren Ändern zurück dorthin, wo die Person herkam:
     Einstellungen, das gerade offene Thema, sonst die Themenübersicht. */
  if (onboarding) { onboarding = false; return renderMenu(); }
  if (activeTab === "einstellungen") return renderSettingsPage();
  if (currentTopicId && getTopicById(currentTopicId)) return renderTopicChoice(currentTopicId);
  renderMenu();
}

/* Rückweg von der Sprach-Wahl OHNE etwas ändern zu müssen (kein Wahl-Zwang) */
function languageChoiceBack() {
  if (activeTab === "einstellungen") return renderSettingsPage();
  if (currentTopicId && getTopicById(currentTopicId)) return renderTopicChoice(currentTopicId);
  if (languageChosen) return renderMenu();
  renderStart();
}

/* Erststart-Schritt: Wie gut kennt sich die Person schon aus? (Vorwissen)
   Steuert die Empfehlung „Kurz" oder „Mehr" beim Thema. */
function renderVorwissen() {
  stopReading();
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Vorwissen", "Start", "Wie gut kennst du dich aus?", 0);
  showNav(false, false);
  content.innerHTML = `
    ${buildReadingToolbar()}
    <section class="profile-new" data-readable="true">
      <h2 class="profile-picker-title">Wie gut kennst du dich aus?</h2>
      ${setupWeiterZu ? `<p class="profile-picker-intro"><strong>Du hast dein erstes Thema geschafft.</strong> Jetzt noch 2 kurze Fragen. Danach geht es weiter.</p>` : ""}
      <p class="profile-picker-intro">Das hilft uns, dir die passende Menge vorzuschlagen. Du kannst es bei jedem Thema ändern.</p>
      <div class="device-grid">
        <button type="button" class="device-card" onclick="chooseVorwissen('neu')">
          <span class="device-icon" aria-hidden="true">🌱</span>
          <strong>Ich bin ganz neu</strong>
          <span>Zeig mir alles in Ruhe. Ausführlich.</span>
        </button>
        <button type="button" class="device-card" onclick="chooseVorwissen('erfahren')">
          <span class="device-icon" aria-hidden="true">⭐</span>
          <strong>Ich kenne mich schon etwas aus</strong>
          <span>Zeig mir nur das Wichtigste. Kurz.</span>
        </button>
      </div>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

function chooseVorwissen(v) {
  pSet(VORWISSEN_KEY, v === "erfahren" ? "erfahren" : "neu");
  onboarding = false;
  announce(v === "erfahren" ? "Gut. Wir schlagen dir die kurze Menge vor." : "Gut. Wir schlagen dir die ausführliche Menge vor.");
  renderVorleseFrage();
}

/* Einmalige Frage: Soll ich dir vorlesen? EIN Konzept, EIN Bildschirm,
   zwei klare Wege. Jederzeit in den Einstellungen änderbar. */
function renderVorleseFrage() {
  if (pGet(AUTO_READ_GEFRAGT_KEY) === "1" || !supportsSpeech()) {
    if (setupWeiterZu) { const weiter = setupWeiterZu; setupWeiterZu = null; return weiter(); }
    return renderMenu();
  }
  pSet(AUTO_READ_GEFRAGT_KEY, "1");
  stopReading();
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Vorlesen", "Einweisung", "Soll ich dir vorlesen?", 0);
  setActiveTab("start");
  setOrientation("Du bist bei der Einweisung. Es geht um das Vorlesen.");
  showNav(false, false);
  content.innerHTML = `
    ${buildReadingToolbar()}
    <section class="profile-new" data-readable="true">
      <h2 class="language-choice-title">Soll ich dir die Seiten vorlesen?</h2>
      <p class="language-choice-intro">Du kannst das jederzeit in den Einstellungen ändern.</p>
      <div class="device-grid">
        <button type="button" class="device-card" onclick="chooseAutoRead(true)">
          <span class="device-icon" aria-hidden="true">🔊</span>
          <strong>Ja, immer vorlesen</strong>
          <span>Jede Seite wird dir automatisch vorgelesen.</span>
        </button>
        <button type="button" class="device-card" onclick="chooseAutoRead(false)">
          <span class="device-icon" aria-hidden="true">🤫</span>
          <strong>Nein, ich drücke selbst</strong>
          <span>Vorgelesen wird nur, wenn du auf Vorlesen drückst.</span>
        </button>
      </div>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

function chooseAutoRead(an) {
  setAutoRead(an);
  if (setupWeiterZu) { const weiter = setupWeiterZu; setupWeiterZu = null; return weiter(); }
  renderMenu();
}

/* ---- Zwei Restfragen hinter dem ersten Thema (Pruefbericht B10) ----
   Vorwissen und Vorlesen standen frueher im Onboarding, also bevor die
   Person wusste, worauf sie sich einlaesst. Sie kommen jetzt einmalig
   nach dem ersten geschafften Thema und fuehren danach genau dorthin
   weiter, wo die Person hin wollte. */
const SETUP_REST_KEY = "einrichtung-rest";
let setupWeiterZu = null;

function restfragenOffen() {
  return pGet(SETUP_REST_KEY) !== "1";
}

function weiterNachThema(topicId) {
  const ziel = (topicId && getTopicById(topicId))
    ? () => renderTopicChoice(topicId)
    : () => renderMyPath();
  if (!restfragenOffen()) return ziel();
  pSet(SETUP_REST_KEY, "1");
  setupWeiterZu = ziel;
  return renderVorwissen();
}

/* ============================================================
   Profil-Bildschirme: „Wer lernt gerade?", neues Bild, verwalten
   ============================================================ */

function avatarLabel(av) {
  const found = AVATARS.find(a => a.e === av);
  return found ? found.n : "Bild";
}

function switchProfile(id) {
  if (!profiles.some(p => p.id === id)) return;
  activeProfileId = id;
  saveProfiles();
  loadActiveProfileSettings();
  finishedTopicThisSession = false;
  sessionDoneTopics = new Set();
  sessionScenarioStufe = {};
  sessionRegeln = {};
  /* Person gewechselt: Rück-Anker und Mengen-Wahl DIESER Person laden, nicht
     die der vorherigen (der Speicher ist ohnehin je Profil getrennt). */
  loadLastLesson();
  loadTopicAmounts();
  if (languageChosen) renderMenu();
  else renderStart();
}

function renderProfilePicker() {
  stopReading();
  currentTopicId = null;
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Wer lernt?", "Start", "Wer lernt gerade?", 0);
  showNav(false, false);

  const cards = profiles.map(p => `
    <div class="profile-card-wrap">
      <button type="button" class="profile-card" onclick="switchProfile('${escapeHtml(p.id)}')" aria-label="Weiter als ${escapeHtml(signLabel(p))}">
        ${signHtml(p)}
        <span class="profile-name">${escapeHtml(signLabel(p))}</span>
        ${p.id === activeProfileId ? `<span class="profile-active-badge">Das bist du</span>` : ""}
      </button>
      <button type="button" class="profile-edit-link" onclick="renderProfileManage('${escapeHtml(p.id)}')" aria-label="Profil ${escapeHtml(signLabel(p))} ändern">Ändern</button>
    </div>`).join("");

  content.innerHTML = `
    ${buildReadingToolbar()}
    <section class="profile-picker" data-readable="true">
      <h2 class="profile-picker-title">Wer lernt gerade?</h2>
      <p class="profile-picker-intro">Tippe auf dein Zeichen. Dann merkt sich die App, wie du liest, und deinen Lernstand – nur auf diesem Gerät, ohne Namen.</p>
      <div class="profile-grid">
        ${cards}
        <button type="button" class="profile-card profile-card--new" onclick="renderBuildSign(0, null)" aria-label="Neue Person hinzufügen">
          <span class="profile-avatar" aria-hidden="true">＋</span>
          <span class="profile-name">Neue Person</span>
        </button>
      </div>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

/* Erststart-Frage: eigenes oder geteiltes Gerät (F2). */
function renderDeviceQuestion(showSharedChoice = false) {
  stopReading();
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Start", "Start", "Wer lernt heute?", 0);
  showNav(false, false);

  const sharedBlock = showSharedChoice ? `
      <div class="device-sign-choice" style="margin-top: 24px; text-align: center;">
        <h3 class="profile-picker-title" style="font-size: 1.25rem; margin-bottom: 12px;">Such dir ein Zeichen aus:</h3>
        <div class="sign-icon-grid">
          ${SIGN_ICONS.map(ic => `
            <button type="button" class="sign-pick${signDraft.icon === ic.key ? " is-active" : ""}" onclick="pickDeviceSignIcon('${ic.key}')" aria-label="${escapeHtml(ic.name)} wählen">
              <span class="sign-pick-bubble"><svg viewBox="0 0 100 100" aria-hidden="true">${ic.svg.replace(/#fff/g, "#00528f")}</svg></span>
              <span class="sign-pick-name">${escapeHtml(ic.name)}</span>
            </button>`).join("")}
        </div>
        <button type="button" class="intro-start-button" onclick="finishSign(null)" style="margin-top: 16px;">Weiter</button>
      </div>` : "";

  content.innerHTML = `
    ${buildReadingToolbar()}
    <section class="profile-new" data-readable="true">
      <h2 class="profile-picker-title">Wer lernt heute?</h2>
      <p class="profile-picker-intro">Eine Frage zum Anfang: Benutzt du dieses Gerät allein? Oder benutzen es mehrere Personen?</p>
      <div class="device-grid">
        <button type="button" class="device-card" onclick="chooseDevice(false)">
          <span class="device-icon" aria-hidden="true">📱</span>
          <strong>Nur ich</strong>
          <span>Mein eigenes Handy oder Tablet.</span>
        </button>
        <button type="button" class="device-card${showSharedChoice ? " is-active" : ""}" onclick="chooseDevice(true)">
          <span class="device-icon" aria-hidden="true">👥</span>
          <strong>Mehrere Personen</strong>
          <span>Ein Gerät, das wir uns teilen.</span>
        </button>
      </div>
      ${sharedBlock}
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

function pickDeviceSignIcon(key) {
  const n = profiles.length;
  signDraft = {
    icon: key,
    color: SIGN_COLORS[n % SIGN_COLORS.length].hex,
    number: n % 11
  };
  renderDeviceQuestion(true);
}

function chooseDevice(shared) {
  setDeviceShared(shared);
  const n = profiles.length;
  if (shared) {
    if (!signDraft.icon) {
      signDraft = {
        icon: SIGN_ICONS[n % SIGN_ICONS.length].key,
        color: SIGN_COLORS[n % SIGN_COLORS.length].hex,
        number: n % 11
      };
    }
    renderDeviceQuestion(true);
    return;
  }
  /* Eigenes Geraet: Das Zeichen dient nur dazu, mehrere Personen auf einem
     geteilten Geraet auseinanderzuhalten. Wer gerade „Nur ich" geantwortet
     hat, brauchte trotzdem drei Bildschirme mit zusammen 34 Auswahlfeldern
     (Pruefbericht B10). Jetzt vergibt die App das Zeichen selbst; unter
     Einstellungen laesst es sich jederzeit aendern. */
  signDraft = {
    icon: SIGN_ICONS[n % SIGN_ICONS.length].key,
    color: SIGN_COLORS[n % SIGN_COLORS.length].hex,
    number: n % 11
  };
  finishSign(null);
}

/* Vorschau des Zeichens, das gerade gebaut wird. */
function signPreviewHtml() {
  const icon = signDraft.icon || "star";
  const color = signDraft.color || "#c6c7c8";
  const number = (signDraft.number !== null && signDraft.number !== undefined) ? signDraft.number : "";
  return signHtml({ icon, color, number }, "profile-sign--big");
}

/* Zeichen bauen: Symbol → Farbe → Zahl. editId gesetzt = Profil ändern. */
function renderBuildSign(step, editId) {
  stopReading();
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Dein Zeichen", "Start", "Bau dir dein Zeichen", 0);
  showNav(false, false);

  const ed = editId ? "'" + escapeHtml(editId) + "'" : "null";
  const dots = [0, 1, 2].map(j => `<span class="lq-dot${j <= step ? " on" : ""}"></span>`).join("");

  let title = "";
  let body = "";
  let back = "";

  if (step === 0) {
    title = "Such dir ein Symbol aus.";
    body = `<div class="sign-icon-grid">${SIGN_ICONS.map(ic => `
      <button type="button" class="sign-pick${signDraft.icon === ic.key ? " is-active" : ""}" onclick="pickSignIcon('${ic.key}', ${ed})" aria-label="${escapeHtml(ic.name)} wählen">
        <span class="sign-pick-bubble"><svg viewBox="0 0 100 100" aria-hidden="true">${ic.svg.replace(/#fff/g, "#00528f")}</svg></span>
        <span class="sign-pick-name">${escapeHtml(ic.name)}</span>
      </button>`).join("")}</div>`;
    back = editId ? `renderProfileManage(${ed})` : "renderDeviceQuestion()";
  } else if (step === 1) {
    title = "Such dir eine Farbe aus.";
    body = `<div class="sign-color-grid">${SIGN_COLORS.map(c => `
      <button type="button" class="sign-color${signDraft.color === c.hex ? " is-active" : ""}" style="background:${c.hex}" onclick="pickSignColor('${c.hex}', ${ed})" aria-label="${escapeHtml(c.name)} wählen"><span>${escapeHtml(c.name)}</span></button>`).join("")}</div>`;
    back = `renderBuildSign(0, ${ed})`;
  } else {
    title = "Such dir eine Zahl aus.";
    body = `<div class="sign-number-grid">${Array.from({ length: 11 }, (_, n) => `
      <button type="button" class="sign-number${signDraft.number === n ? " is-active" : ""}" onclick="pickSignNumber(${n}, ${ed})" aria-label="Zahl ${n} wählen">${n}</button>`).join("")}</div>`;
    back = `renderBuildSign(1, ${ed})`;
  }

  content.innerHTML = `
    <section class="profile-new">
      <div class="lq-dots" aria-hidden="true">${dots}</div>
      <div class="sign-preview" role="img" aria-label="Dein Zeichen">${signPreviewHtml()}</div>
      <h2 class="profile-picker-title">${title}</h2>
      ${body}
      <button type="button" class="plain-back-button" onclick="${back}">← Zurück</button>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

function pickSignIcon(key, editId) { signDraft.icon = key; renderBuildSign(1, editId); }
function pickSignColor(hex, editId) { signDraft.color = hex; renderBuildSign(2, editId); }
function pickSignNumber(n, editId) { signDraft.number = n; finishSign(editId); }

/* Ausdruckbare „Das bin ich"-Karte mit dem eigenen Zeichen. */
function printSignCard(id) {
  const p = profiles.find(x => x.id === id);
  if (!p) return;
  const color = p.icon ? (p.color || "#00528f") : "#D8EAF2";
  const ic = p.icon ? SIGN_ICONS.find(s => s.key === p.icon) : null;
  const inner = ic ? `<svg viewBox="0 0 100 100">${ic.svg}</svg>`
    : `<span style="font-size:90px">${escapeHtml(p.avatar || "🙂")}</span>`;
  const num = (p.number !== undefined && p.number !== null) ? p.number : "";
  const label = signLabel(p);
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Meine Karte</title>` +
    `<style>body{font-family:Arial,Helvetica,sans-serif;color:#142231;text-align:center;margin:40px;}` +
    `.card{border:3px solid #00528f;border-radius:24px;max-width:420px;margin:0 auto;padding:32px;}` +
    `.sign{width:170px;height:170px;border-radius:42px;background:${color};display:flex;align-items:center;justify-content:center;margin:0 auto 22px;position:relative;}` +
    `.sign svg{width:104px;height:104px;}` +
    `.num{position:absolute;right:-12px;bottom:-12px;background:#fff;color:#142231;border:4px solid ${color};border-radius:50%;width:58px;height:58px;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:bold;}` +
    `h1{font-size:24px;margin:0 0 8px;}p{font-size:18px;line-height:1.55;}.parts{font-weight:bold;}` +
    `.foot{margin-top:24px;color:#555;font-size:13px;}</style></head><body>` +
    `<div class="card"><div class="sign">${inner}${num !== "" ? `<span class="num">${num}</span>` : ""}</div>` +
    `<h1>Das ist mein Zeichen.</h1>` +
    `<p>So finde ich mich wieder.<br>Ich tippe auf mein Zeichen.</p>` +
    `<p class="parts">${escapeHtml(label)}</p>` +
    `<p class="foot">Sicher und selbstbestimmt im Internet · Es wird kein Name gespeichert.</p></div></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch (e) { /* nichts tun */ } }, 300);
}

function finishSign(editId) {
  const sign = { icon: signDraft.icon, color: signDraft.color, number: signDraft.number };
  if (editId) {
    const p = profiles.find(x => x.id === editId);
    if (p) { p.icon = sign.icon; p.color = sign.color; p.number = sign.number; delete p.avatar; saveProfiles(); }
    signDraft = { icon: null, color: null, number: null };
    renderProfileManage(editId);
    return;
  }
  const p = Object.assign({ id: genProfileId() }, sign);
  profiles.push(p);
  activeProfileId = p.id;
  saveProfiles();
  signDraft = { icon: null, color: null, number: null };
  languageChosen = false;
  languageLevel = "leicht";
  learnMode = null;
  learnModeChooserOpen = false;
  fontSizeStep = 0;
  applyFontSize();
  finishedTopicThisSession = false;
  sessionDoneTopics = new Set();
  sessionScenarioStufe = {};
  sessionRegeln = {};
  clearLastLesson();
  clearTopicAmounts();
  onboarding = true;
  renderStart();
}

function renderProfileManage(id) {
  const p = profiles.find(x => x.id === id);
  if (!p) return renderProfilePicker();
  stopReading();
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Profil", "Start", "Profil ändern", 0);
  showNav(false, false);

  content.innerHTML = `
    <section class="profile-manage">
      <h2 class="profile-picker-title"><span class="profile-manage-sign">${signHtml(p)}</span> Dein Zeichen</h2>

      <h3 class="profile-manage-sub">Zeichen ändern</h3>
      <p class="profile-manage-note">Bau dir ein neues Zeichen: Symbol, Farbe und Zahl.</p>
      <button type="button" class="utility-button" onclick="renderBuildSign(0, '${escapeHtml(id)}')">Zeichen neu bauen</button>

      <h3 class="profile-manage-sub">Meine Karte</h3>
      <p class="profile-manage-note">Druck dir dein Zeichen aus, damit du es dir merken kannst.</p>
      <button type="button" class="utility-button" onclick="printSignCard('${escapeHtml(id)}')">🖨 Meine Karte drucken</button>

      <h3 class="profile-manage-sub">Neu anfangen</h3>
      <p class="profile-manage-note">Das löscht für dieses Bild die gewählte Sprache und den Lernstand. Du fängst wieder von vorne an. Andere Personen bleiben.</p>
      <button type="button" class="utility-button" onclick="confirmResetProfile('${escapeHtml(id)}')">Neu anfangen</button>

      <h3 class="profile-manage-sub">Profil löschen</h3>
      <p class="profile-manage-note">Das löscht dieses Bild und seinen Lernstand ganz.</p>
      <button type="button" class="utility-button danger-button" onclick="confirmDeleteProfile('${escapeHtml(id)}')">Dieses Profil löschen</button>

      <button type="button" class="plain-back-button" onclick="renderProfilePicker()">← Zurück</button>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

function confirmResetProfile(id) {
  const p = profiles.find(x => x.id === id);
  if (!p) return renderProfilePicker();
  stopReading();
  setHeader("Sicher und selbstbestimmt im Internet", "Neu anfangen", "Start", "Wirklich neu anfangen?", 0);
  content.innerHTML = `
    <section class="profile-manage">
      <article class="card">
        <h2>Wirklich neu anfangen?</h2>
        <p>Für dein Zeichen ${signHtml(p)} (${escapeHtml(signLabel(p))}) werden die gewählte Sprache und der Lernstand gelöscht. Du fängst wieder von vorne an. Das kann man nicht rückgängig machen.</p>
        <div class="feedback-actions">
        <!-- Die sichere Antwort steht zuerst. Sie ist ohnehin als primary
             gestaltet; im Quelltext stand sie aber hinten, und genau in
             dieser Reihenfolge liest die Sprachausgabe vor - die
             loeschende Antwort kam also als erste Ansage. -->
          <button type="button" class="feedback-button primary" onclick="renderProfileManage('${escapeHtml(id)}')">Nein, behalten</button>
          <button type="button" class="feedback-button secondary danger-button" onclick="resetProfile('${escapeHtml(id)}')">Ja, neu anfangen</button>
        </div>
      </article>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

function resetProfile(id) {
  const wasActive = id === activeProfileId;
  const prevActive = activeProfileId;
  activeProfileId = id;
  PROFILE_BASE_KEYS.forEach(base => pRemove(base));
  activeProfileId = prevActive;
  if (wasActive) {
    loadActiveProfileSettings();
    finishedTopicThisSession = false;
  sessionDoneTopics = new Set();
  sessionScenarioStufe = {};
  sessionRegeln = {};
  clearLastLesson();
  clearTopicAmounts();
    announce("Du fängst neu an.");
    renderStart();
  } else {
    announce("Der Lernstand wurde gelöscht.");
    renderProfilePicker();
  }
}

function confirmDeleteProfile(id) {
  const p = profiles.find(x => x.id === id);
  if (!p) return;
  stopReading();
  setHeader("Sicher und selbstbestimmt im Internet", "Profil löschen", "Start", "Wirklich löschen?", 0);
  content.innerHTML = `
    <section class="profile-manage">
      <article class="card">
        <h2>Profil wirklich löschen?</h2>
        <p>Dein Zeichen ${signHtml(p)} (${escapeHtml(signLabel(p))}) und sein Lernstand werden gelöscht. Das kann man nicht rückgängig machen.</p>
        <div class="feedback-actions">
        <!-- Die sichere Antwort steht zuerst. Sie ist ohnehin als primary
             gestaltet; im Quelltext stand sie aber hinten, und genau in
             dieser Reihenfolge liest die Sprachausgabe vor - die
             loeschende Antwort kam also als erste Ansage. -->
          <button type="button" class="feedback-button primary" onclick="renderProfileManage('${escapeHtml(id)}')">Nein, behalten</button>
          <button type="button" class="feedback-button secondary danger-button" onclick="deleteProfile('${escapeHtml(id)}')">Ja, löschen</button>
        </div>
      </article>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

function deleteProfile(id) {
  const prevActive = activeProfileId;
  activeProfileId = id;
  PROFILE_BASE_KEYS.forEach(base => pRemove(base));
  activeProfileId = prevActive;
  profiles = profiles.filter(p => p.id !== id);
  if (activeProfileId === id) activeProfileId = profiles[0] ? profiles[0].id : null;
  saveProfiles();
  if (profiles.length === 0) {
    /* Keine Person mehr: neues Zeichen bauen. */
    signDraft = { icon: null, color: null, number: null };
    return renderBuildSign(0, null);
  }
  loadActiveProfileSettings();
  renderProfilePicker();
}

/* Einstieg: erst fragen oder gleich selbst wählen */
function renderStart() {
  stopReading();
  currentTopicId = null;
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Start", "Start", "Womit möchtest du starten?", 0);
  showNav(false, false);

  content.innerHTML = `
    <section class="start-entry">
      <h2 class="language-choice-title">Womit möchtest du starten?</h2>
      <p class="language-choice-intro">Du kannst gleich selbst wählen. Oder du beantwortest 2 kurze Fragen und bekommst einen Vorschlag.</p>
      <div class="start-entry-grid">
        <button type="button" class="entry-card" onclick="startLanguageQuiz()">
          <span class="entry-icon" aria-hidden="true">${getIconHtml("help")}</span>
          <span class="entry-text">
            <strong>Hilf mir, die passende Stufe zu finden</strong>
            <span>2 kurze Fragen. Es gibt keine falsche Antwort.</span>
          </span>
        </button>
        <button type="button" class="entry-card" onclick="renderLanguageChoice()">
          <span class="entry-icon" aria-hidden="true">${getIconHtml("check")}</span>
          <span class="entry-text">
            <strong>Ich wähle selbst</strong>
            <span>Direkt eine der drei Stufen auswählen.</span>
          </span>
        </button>
      </div>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

function startLanguageQuiz() {
  sampleTally = { leicht: 0, einfach: 0, standard: 0 };
  renderSampleFinder(0);
}

/* Einfaches Mischen (Fisher-Yates), damit die Reihenfolge der Text-Karten
   wechselt und niemand immer dieselbe Stelle wählt. */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderSampleFinder(round) {
  stopReading();
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Passende Stufe finden", "Beispiel " + (round + 1) + " von " + SAMPLE_ROUNDS.length, "Passende Stufe finden", Math.round((round / SAMPLE_ROUNDS.length) * 100));
  showNav(false, false);

  const r = SAMPLE_ROUNDS[round];
  const dots = SAMPLE_ROUNDS.map((_, j) => `<span class="lq-dot${j <= round ? " on" : ""}"></span>`).join("");
  /* Stufen-Namen werden NICHT gezeigt – die Person wählt nach Gefühl,
     nicht nach Etikett. Reihenfolge wird gemischt. */
  const options = shuffleArray(["leicht", "einfach", "standard"]);
  const cards = options.map(level => `
    <div class="card-read-pair card-read-pair--sample">
      <button type="button" class="sample-option" onclick="pickSample(${round}, '${level}')">
      <span class="sample-text">„${escapeHtml(r[level])}"</span>
      </button>
      <button type="button" class="card-read-button" data-read-card-text="${escapeHtml(r[level])}" aria-label="Text vorlesen"><svg class="rb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L9 9H4z" fill="currentColor"/><path d="M16 8.6a4 4 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.6 6.2a7 7 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    </div>`).join("");
  const back = round > 0 ? `renderSampleFinder(${round - 1})` : `renderStart()`;

  content.innerHTML = `
    <article class="card lang-quiz-card">
      <div class="lq-dots" aria-hidden="true">${dots}</div>
      <h2 class="lq-question">Welcher Text liest sich für dich am angenehmsten?</h2>
      <p class="language-choice-intro">Wähle einfach den Text, der sich für dich gut anfühlt. Es gibt keine falsche Antwort.</p>
      <div class="sample-options">${cards}</div>
      <button type="button" class="plain-back-button" onclick="${back}">← Zurück</button>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function pickSample(round, level) {
  if (sampleTally[level] !== undefined) sampleTally[level]++;
  if (round + 1 < SAMPLE_ROUNDS.length) return renderSampleFinder(round + 1);
  let best = "einfach", max = -1;
  ["leicht", "einfach", "standard"].forEach((k) => { if (sampleTally[k] > max) { max = sampleTally[k]; best = k; } });
  const top = ["leicht", "einfach", "standard"].filter((k) => sampleTally[k] === max);
  if (top.length > 1) best = top.indexOf("einfach") >= 0 ? "einfach" : top[0];
  renderLanguageResult(best);
}

function renderLanguageResult(level) {
  stopReading();
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Vorschlag", "Start", "Dein Vorschlag", 100);
  showNav(false, false);

  content.innerHTML = `
    <article class="card lang-result-card">
      <span class="lang-result-badge">Unser Vorschlag für dich</span>
      <h2 class="lang-result-name">${escapeHtml(LANGUAGE_LABEL[level])}</h2>
      <p class="lang-result-desc">${escapeHtml(LANGUAGE_DESC[level])} Du kannst es jederzeit ändern.</p>
      <button type="button" class="nav-button primary lang-result-go" onclick="chooseLanguage('${level}')">Los geht’s</button>
      <button type="button" class="plain-back-button" onclick="renderLanguageChoice('${level}')">Andere Stufe wählen</button>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function renderLanguageChoice(recommended) {
  stopReading();
  /* currentTopicId bleibt erhalten: wer aus einem Thema kommt,
     soll nach der Wahl (oder per Zurück) wieder dort landen. */
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Lesen wählen", "Start", "Wie möchtest du lesen?", 0);
  setOrientation("Du bist auf der Seite: Lesen wählen.");
  showNav(false, false);

  const card = (level, icon) => `
    <button type="button" class="language-card${recommended === level ? " is-rec" : ""}" onclick="chooseLanguage('${level}')">
      ${recommended === level ? `<span class="language-rec">Vorschlag</span>` : ""}
      <span class="language-icon" aria-hidden="true">${getIconHtml(icon)}</span>
      <span class="language-name">${escapeHtml(LANGUAGE_LABEL[level])}</span>
      <span class="language-desc">${escapeHtml(LANGUAGE_DESC[level])}</span>
      <span class="language-example"><span class="language-example-label">So liest es sich:</span> „${escapeHtml(LANGUAGE_EXAMPLE[level])}"</span>
    </button>`;

  content.innerHTML = `
    ${buildReadingToolbar()}
    <section class="language-choice" data-readable="true">
      <h2 class="language-choice-title">Wie möchtest du lesen?</h2>
      <p class="language-choice-intro">Wähle eine von 3 Stufen. Du kannst sie später jederzeit ändern.</p>
      <div class="language-grid">
        ${card("leicht", "understand")}
        ${card("einfach", "example")}
        ${card("standard", "report")}
      </div>
      <p class="language-finder-link">
        <button type="button" class="utility-button" onclick="startLanguageQuiz()">Nicht sicher? Wir finden die passende Stufe für dich</button>
      </p>
      <p class="language-more-link">
        <a href="sprachstufen.html">Was ist der Unterschied? Hier wird es erklärt.</a>
      </p>
      <button type="button" class="plain-back-button" onclick="languageChoiceBack()">← Zurück. Nichts ändern.</button>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

/* „Los geht's": sanft zu den Themen scrollen und den Fokus dorthin setzen. */
function scrollToTopics() {
  const title = document.querySelector(".topic-grid-title");
  const target = title || document.querySelector(".topic-grid");
  if (!target || !target.scrollIntoView) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  if (title) {
    title.setAttribute("tabindex", "-1");
    try { title.focus({ preventScroll: true }); } catch (e) { /* nichts tun */ }
  }
}

/* Startseite (Intro): kurz, worum es geht, plus ein Start-Knopf.
   Die Lerneinheiten (Themen) liegen auf einer eigenen Seite. */
/* ============================================================
   Frage des Tages: eine Wiederhol-Frage aus den geschafften Themen.
   Verteiltes Wiederholen in kleinster Form (Spacing- + Testing-Effekt).
   Deterministisch über das Datum – kein Tracking, keine Speicherung.
   ============================================================ */

let dailyQuestionCurrent = null;

/* Rück-Anker: merkt die zuletzt offene Lektion.
   Wer zur Hilfe oder zu den Einstellungen wechselt, findet mit einem
   Tipp zurück (COGA: Unterbrechungen sicher machen).

   Seit Prüfbericht B5 überlebt der Anker auch das Schließen der App: vorher
   war er eine reine Variable im Arbeitsspeicher, und ausgerechnet der Fall,
   für den er gebaut wurde – Unterbrechung über Tage – ging verloren. Die App
   bot dann „Hier kannst du weiterlernen" an und begann das Thema bei null.
   Gespeichert wird nur {Thema, Schritt, Menge} im localStorage des Profils –
   eine lokale Einstellung wie Schriftgröße und Sprachstufe, kein
   personenbezogenes Datum (§14, KDG). */
let lastLessonContext = null;
const LAST_LESSON_KEY = "letzte-lektion";

function saveLastLesson() {
  if (!lastLessonContext) { pRemove(LAST_LESSON_KEY); return; }
  try { pSet(LAST_LESSON_KEY, JSON.stringify(lastLessonContext)); } catch (e) { /* nichts tun */ }
}

function loadLastLesson() {
  lastLessonContext = null;
  try {
    const raw = pGet(LAST_LESSON_KEY);
    if (!raw) return;
    const ctx = JSON.parse(raw);
    if (!ctx || typeof ctx.topicId !== "string") return;
    const topic = getTopicById(ctx.topicId);
    if (!topic) return;
    const mode = ctx.mode === "short" ? "short" : "full";
    const anzahl = getLessonsForMode(topic, mode).length;
    const step = Number(ctx.step);
    /* Nur übernehmen, wenn der Schritt heute noch existiert – sonst käme die
       Person nach einer Inhaltsänderung auf einer leeren Seite an. */
    if (!Number.isInteger(step) || step < 0 || step >= anzahl) return;
    lastLessonContext = { topicId: topic.id, step, mode };
  } catch (e) { /* nichts tun */ }
}

function clearLastLesson() {
  lastLessonContext = null;
  pRemove(LAST_LESSON_KEY);
}

function buildResumeLessonChip() {
  const ctx = lastLessonContext;
  if (!ctx) return "";
  const topic = getTopicById(ctx.topicId);
  if (!topic) return "";
  return `
    <p class="resume-lesson-wrap">
      <button type="button" class="review-chip resume-lesson-chip" style="${getTopicColorStyle(topic.id)}" onclick="resumeLastLesson()">
        <span aria-hidden="true">${getIconHtml(topic.icon || "start")}</span>
        <span>Weiter lernen: ${escapeHtml(topic.title)}, Schritt ${ctx.step + 1}</span>
      </button>
    </p>`;
}

function resumeLastLesson() {
  const ctx = lastLessonContext;
  if (!ctx || !getTopicById(ctx.topicId)) return renderMenu();
  currentTopicId = ctx.topicId;
  currentMode = ctx.mode;
  currentStep = ctx.step;
  renderLesson();
}

function getDailyQuestion() {
  const doneTopics = topics.filter(t => isTopicDone(t.id) && getQuizQuestions(t).length);
  if (!doneTopics.length) return null;
  const pool = [];
  doneTopics.forEach(t => getQuizQuestions(t).forEach(q => pool.push({ topic: t, q })));
  if (!pool.length) return null;
  const d = new Date();
  const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
  return pool[seed % pool.length];
}

function buildDailyQuestionCard() {
  const daily = getDailyQuestion();
  dailyQuestionCurrent = daily;
  if (!daily) return "";
  const answers = daily.q.answers.map((a, i) =>
    `<button type="button" class="answer-option daily-answer" onclick="answerDailyQuestion(${i})">${answerNumBadge(i)}${answerPikto(a)}<span class="answer-text">${escapeHtml(answerText(a))}</span></button>`
  ).join("");
  return `
      <div class="intro-offer daily-question" id="dailyQuestion" style="${getTopicColorStyle(daily.topic.id)}" data-readable="true" role="region" aria-label="Frage des Tages">
        <h3>Deine Frage für heute</h3>
        <p class="daily-question-topic">Aus dem Thema: ${escapeHtml(daily.topic.title)}</p>
        ${questionPikto(daily.q)}<p class="daily-question-text">${escapeHtml(daily.q.question)}</p>
        <div class="daily-answers">${answers}</div>
      </div>`;
}

function answerDailyQuestion(index) {
  const daily = dailyQuestionCurrent;
  const box = document.getElementById("dailyQuestion");
  if (!daily || !box) return;
  const isCorrect = index === daily.q.correctIndex;
  const feedback = isCorrect
    ? (daily.q.feedbackCorrect || "Das ist richtig.")
    : (falschFeedback(daily.q, index) || "Das war nicht richtig. Das macht nichts.");
  playSound(isCorrect ? "correct" : "wrong");
  box.innerHTML = `
        <h3>${isCorrect ? "✓ Richtig! Gut gemacht." : "Das macht nichts."}</h3>
        <p class="daily-question-text">${escapeHtml(feedback)}</p>
        ${isCorrect ? "" : `<button type="button" class="review-chip" style="${getTopicColorStyle(daily.topic.id)}" onclick="renderTopicChoice('${escapeHtml(daily.topic.id)}')"><span aria-hidden="true">${getIconHtml(daily.topic.icon || "start")}</span><span>${escapeHtml(daily.topic.title)} nochmal ansehen</span></button>`}
      `;
  announce(feedback);
}

/* Menü-Erklärung als wiederverwendbarer Baustein (dauerhaft in Hilfe) */
function buildMenuExplainList() {
  return `
      <ul class="intro-offer-list">
        <li><span class="intro-offer-icon" aria-hidden="true">${getIconHtml("start")}</span><span><strong>Start</strong> bringt dich zur ersten Seite zurück.</span></li>
        <li><span class="intro-offer-icon" aria-hidden="true">${getIconHtml("example")}</span><span><strong>Themen</strong> zeigt dir alle 12 Themen.</span></li>
        <li><span class="intro-offer-icon" aria-hidden="true">${getIconHtml("check")}</span><span><strong>Mein Lernweg</strong> zeigt dir: Das hast du geschafft. Hier kannst du üben.</span></li>
        <li><span class="intro-offer-icon" aria-hidden="true">${getIconHtml("help")}</span><span><strong>Hilfe</strong> ist immer für dich da.</span></li>
        <li><span class="intro-offer-icon" aria-hidden="true">${getIconHtml("understand")}</span><span>Bei <strong>Einstellungen</strong> änderst du Schrift, Töne und Sprache.</span></li>
      </ul>`;
}

/* Menü-Einweisungs-Zustand (F3): Chip beim ersten Themen-Besuch, Erklärungen dauerhaft in der Hilfe */
const MENU_INTRO_KEY = "menue-gesehen";
function menuIntroSeen() { return pGet(MENU_INTRO_KEY) === "1"; }

function renderIntro() {
  stopReading();
  currentTopicId = null;
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Willkommen", "Willkommen", "Los geht’s", 0);
  setActiveTab("start");
  setOrientation("Du bist auf der Seite: Start.");
  rememberRoute("start");
  showNav(false, false);

  /* Wiederkehrende sehen zuerst den einen nächsten Schritt (CLT: eine
     Hauptaufgabe), Neue sehen die volle Begrüßung. „Wiederkehrend" heißt:
     Sprache gewählt ODER schon ein Thema geschafft. */
  const isReturning = languageChosen || countDoneTopics() > 0;
  const nextTopic = isReturning ? getNextTopicSuggestion() : null;
  const dailyCard = isReturning ? buildDailyQuestionCard() : "";
  const lessonChip = buildResumeLessonChip();
  /* Ehrliche Beschriftung (Prüfbericht B5): Diese Kachel führt zu einem NEUEN
     Thema, nicht zurück in eine offene Lektion. Sie hieß trotzdem „Hier kannst
     du weiterlernen" und landete auf der Themen-Einstiegsseite. Der echte
     Rück-Anker steht jetzt als lessonChip darüber und überlebt das Schließen
     der App; diese Kachel erscheint nur noch, wenn nichts offen ist. */
  const resumeCard = (nextTopic && !lessonChip) ? `
      <div class="intro-offer" role="region" aria-label="Nächstes Thema">
        <h3>${countDoneTopics() > 0 ? "Dein nächstes Thema:" : "Hier kannst du anfangen:"}</h3>
        <button type="button" class="topic-card" style="${getTopicColorStyle(nextTopic.id)}" onclick="renderTopicChoice('${escapeHtml(nextTopic.id)}')">
          <span class="topic-icon" aria-hidden="true">${getIconHtml(nextTopic.icon || "start")}</span>
          <span class="topic-title">${escapeHtml(nextTopic.title)}</span>
          <span class="topic-desc">${escapeHtml(nextTopic.desc || "")}</span>
        </button>
      </div>` : "";

  content.innerHTML = `
    ${buildReadingToolbar()}
    <section class="intro-page" data-readable="true">
      <!-- Begruessung und Figuren in EINER Zeile (August 2026).
           Vorher zwei Karten uebereinander (dunkle Hero-Karte 329 px +
           Figuren-Karte 232 px). Zusammen mit der Angebots-Liste stand der
           Hauptknopf dadurch erst bei y = 1208 px – 1,4 Bildschirme unter der
           Falz. Wer die Seite oeffnete, sah keinen Startknopf.
           Der Satz "In kurzen Schritten. Mit Bildern und zum Vorlesen."
           entfaellt: er steht inhaltlich in der Liste weiter unten. -->
      <div class="intro-welcome">
        ${roleFigure("winken", "intro-welcome-figure")}
        <div class="intro-welcome-text">
          <h2>Willkommen!</h2>
          <p>Alex und Tilda begleiten dich. Du lernst, sicher und selbstbestimmt im Internet zu sein.</p>
        </div>
      </div>

      <p class="intro-principle-plain"><strong>So lernst du:</strong> <span aria-hidden="true">🧠</span> Merken <span aria-hidden="true">→</span> <span aria-hidden="true">✅</span> Prüfen <span aria-hidden="true">→</span> <span aria-hidden="true">➜</span> Handeln</p>

      ${isReturning ? `
      <button type="button" class="intro-start-button" onclick="renderMenu()">Zu den Themen</button>
      ` : `
      <button type="button" class="intro-start-button" onclick="introStart()">Los geht’s</button>
      <button type="button" class="intro-quickstart-link" onclick="introQuickStart()">Lieber gleich ein Thema wählen</button>
      `}

      ${lessonChip}

      ${dailyCard}

      ${resumeCard}

      ${isReturning ? "" : `
      <details class="intro-more"><summary>Mehr über dieses Angebot</summary>
        <div class="intro-offer">
          <h3>Das kannst du hier machen:</h3>
          <ul class="intro-offer-list">
            <li><span class="intro-offer-icon" aria-hidden="true">${getIconHtml("start")}</span><span>Du lernst über 12 Themen. Zum Beispiel: WhatsApp, Betrug und KI.</span></li>
            <li><span class="intro-offer-icon" aria-hidden="true">${getIconHtml("message")}</span><span>Du kannst dir alles vorlesen lassen.</span></li>
            <li><span class="intro-offer-icon" aria-hidden="true">${getIconHtml("help")}</span><span>Du lernst allein. Oder mit einer Begleit-Person.</span></li>
          </ul>
        </div>
        <p class="intro-meta">12 Themen &nbsp;·&nbsp; 3 Sprachstufen &nbsp;·&nbsp; kostenlos &nbsp;·&nbsp; kein Name nötig</p>
      </details>
      `}
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

/* Abkürzung: sofort lernen, ohne Fragen (COGA: geringe Einstiegs-Last).
   Sinnvolle Standards: Leichte Sprache, ausführlicher Lernweg.
   Alles bleibt später über die Einstellungen änderbar. */
function introQuickStart() {
  setLanguageLevel("leicht");
  pSet(VORWISSEN_KEY, "neu");
  renderMenu();
}

function introStart() {
  /* Noch kein Zeichen: volles Onboarding (Gerät → Zeichen → Sprache → Lernstand). */
  if (profiles.length === 0) return renderDeviceQuestion();
  /* Geteiltes Gerät (z. B. iPad): IMMER zuerst „Wer lernt gerade?".
     So wählt jede Person ihr eigenes Zeichen und macht mit ihrem eigenen
     Lernstand weiter – auch wenn bisher nur ein Zeichen da ist, kann eine
     weitere Person hier ein neues anlegen. Niemand kommt durcheinander. */
  if (deviceShared) return renderProfilePicker();
  /* Onboarding noch nicht fertig (keine Sprache gewählt): weiter im Onboarding. */
  if (!languageChosen) return renderStart();
  /* Alles eingestellt: kurz bestätigen, dann zu den Themen. */
  return renderResume();
}

/* Kurzer Bestätigungs-Schritt für Wiederkehrende.
   Zeigt Zeichen, Sprache und Lernstand. Alles änderbar – oder gleich weiter.
   So machen es Profis bei inklusiven Seiten: geführt, vorhersehbar, aber ohne
   die Person jedes Mal alles neu einstellen zu lassen. */
function renderResume() {
  stopReading();
  currentTopicId = null;
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Bereit?", "Start", "Willkommen zurück", 0);
  showNav(false, false);

  const prof = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const vw = pGet(VORWISSEN_KEY) === "erfahren" ? "erfahren" : "neu";
  const vwLabel = vw === "erfahren" ? "Ich kenne mich schon etwas aus" : "Ich bin ganz neu";
  const langLabel = LANGUAGE_LABEL[languageLevel] || "Leichte Sprache";

  content.innerHTML = `
    ${buildReadingToolbar()}
    <section class="resume-page" data-readable="true">
      <div class="resume-head">
        ${signHtml(prof, "profile-sign--big")}
        <div class="resume-head-text">
          <h2>Willkommen zurück!</h2>
          <p>Das ist dein Zeichen: ${escapeHtml(signLabel(prof))}.</p>
        </div>
      </div>
      <p class="resume-intro">So lernst du gerade. Du kannst alles ändern. Oder gleich weiter.</p>
      <ul class="resume-list">
        <li class="resume-row">
          <span class="resume-row-label"><span class="resume-row-icon" aria-hidden="true">${getIconHtml("understand")}</span> Du liest: <strong>${escapeHtml(langLabel)}</strong></span>
          <button type="button" class="resume-change" onclick="renderLanguageChoice('${languageLevel}')">ändern</button>
        </li>
        <li class="resume-row">
          <span class="resume-row-label"><span class="resume-row-icon" aria-hidden="true">${getIconHtml("start")}</span> Dein Lernstand: <strong>${escapeHtml(vwLabel)}</strong></span>
          <button type="button" class="resume-change" onclick="renderVorwissen()">ändern</button>
        </li>
        <li class="resume-row">
          <span class="resume-row-label"><span class="resume-row-icon" aria-hidden="true">${getIconHtml("check")}</span> Dein Zeichen</span>
          <button type="button" class="resume-change" onclick="renderProfileManage('${escapeHtml(prof.id)}')">ändern</button>
        </li>
      </ul>
      <button type="button" class="intro-start-button" onclick="renderMenu()">Weiter zu den Themen</button>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

/* Themen in 3 benannte Gruppen (Chunking: kleine, benannte Pakete
   statt 12 gleichzeitiger Wahlmöglichkeiten). Reine Anzeige-Gliederung,
   keine inhaltliche Änderung der Themen. */
/* „Hilfe bei Problemen" steht in der ersten Gruppe (Prüfbericht B18):
   Fast jedes andere Thema endet mit „hole dir Hilfe" oder „frag eine Person,
   der du vertraust". Als letzte Kachel der letzten Gruppe wurde genau das
   zuletzt gelehrt, worauf sich alle anderen Themen stützen. */
const TOPIC_GROUPS = [
  { title: "Wichtig für alle",   hint: "Das hilft dir überall im Internet.", ids: ["datenschutz", "hilfe", "ki", "einkaufen"] },
  { title: "Apps",               hint: "So nutzt du diese Apps sicher.",     ids: ["whatsapp", "facebook", "instagram", "youtube", "snapchat", "tiktok"] },
  { title: "Gefahren und Hilfe", hint: "So erkennst du Tricks. So holst du Hilfe.", ids: ["fakes", "betrug"] }
];

function renderMenu() {
  stopReading();
  currentTopicId = null;
  currentStep = 0;
  currentQuizIndex = 0;
  quizScore = 0;
  quizAnsweredCorrect = new Set();

  const ersterBesuch = !menuIntroSeen();
  if (ersterBesuch) {
    pSet(MENU_INTRO_KEY, "1");
  }

  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Thema auswählen", "Themenübersicht", "Wähle ein Thema", 0);
  setActiveTab("themen");
  setOrientation("Du bist auf der Seite: Themen. Wähle ein Thema aus.");
  rememberRoute("themen");
  showNav(false, false);

  const nextSuggestion = getNextTopicSuggestion();
  const anyTopicDone = countDoneTopics() > 0;
  const cardFor = (topic, isFirstCardOfFirstGroup) => {
    const done = isTopicDone(topic.id);
    const showFirstBadge = ersterBesuch && isFirstCardOfFirstGroup;
    const showNextBadge = !ersterBesuch && anyTopicDone && nextSuggestion && topic.id === nextSuggestion.id && !done;
    return `
    <div class="card-read-pair card-read-pair--topic">
      <button type="button" class="topic-card topic-${escapeHtml(topic.id)}${done ? " topic-card--done" : ""}" style="${getTopicColorStyle(topic.id)}" onclick="renderTopicChoice('${escapeHtml(topic.id)}')">
      ${showFirstBadge ? `<span class="topic-start-badge topic-start-badge--first">Fang hier an</span>` : ""}
      ${showNextBadge ? `<span class="topic-start-badge">Dein nächstes Thema</span>` : ""}
      ${done ? `<span class="topic-done-corner" aria-label="Geschafft" title="Geschafft">✓</span>` : ""}
      <span class="topic-icon" aria-hidden="true">${getIconHtml(topic.icon || "start")}</span>
      <span class="topic-title">${escapeHtml(topic.title)}</span>
      <span class="topic-desc">${escapeHtml(topic.desc || "")}</span>
      ${done ? `<span class="topic-done-badge">✓ Geschafft</span>` : ""}
      </button>
      <button type="button" class="card-read-button" data-read-card-text="${escapeHtml(topic.title)}. ${escapeHtml(topic.desc || "")}" aria-label="Thema ${escapeHtml(topic.title)} vorlesen">
        <svg class="rb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L9 9H4z" fill="currentColor"/><path d="M16 8.6a4 4 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.6 6.2a7 7 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
  `;};

  /* Gruppen aufbauen; Themen ohne Gruppe landen sicherheitshalber am Ende */
  const grouped = new Set(TOPIC_GROUPS.flatMap(g => g.ids));
  const rest = topics.filter(t => !grouped.has(t.id));
  const groupSections = TOPIC_GROUPS.map((g, gIdx) => {
    const groupTopics = g.ids.map(id => topics.find(t => t.id === id)).filter(Boolean);
    if (!groupTopics.length) return "";
    return `
      <section class="topic-group" aria-label="${escapeHtml(g.title)}">
        <h3 class="topic-grid-title">${escapeHtml(g.title)}</h3>
        <p class="topic-grid-hint">${escapeHtml(g.hint)}</p>
        <div class="topic-grid">${groupTopics.map((t, tIdx) => cardFor(t, gIdx === 0 && tIdx === 0)).join("")}</div>
      </section>`;
  }).join("") + (rest.length ? `
      <section class="topic-group" aria-label="Weitere Themen">
        <h3 class="topic-grid-title">Weitere Themen</h3>
        <div class="topic-grid">${rest.map(t => cardFor(t, false)).join("")}</div>
      </section>` : "");

  /* Lernweg-Auswahl: selbstbestimmt, freiwillig, jederzeit änderbar. */
  const learnModeCards = Object.keys(LEARN_MODES).map(key => {
    const m = LEARN_MODES[key];
    const active = learnMode === key;
    return `
      <button type="button" class="learn-mode-card${active ? " is-active" : ""}" aria-pressed="${active ? "true" : "false"}" onclick="chooseLearnMode('${key}')">
        <span class="learn-mode-icon" aria-hidden="true">${getIconHtml(m.icon)}</span>
        <span class="learn-mode-text">
          <strong>${escapeHtml(m.title)}</strong>
          <span>${escapeHtml(m.desc)}</span>
        </span>
        ${active ? `<span class="learn-mode-check" aria-hidden="true">✓</span>` : ""}
      </button>`;
  }).join("");

  let companionNote = "";
  if (learnMode === "begleitung") {
    companionNote = languageLevel === "leicht"
      ? `<p class="learn-mode-status" role="status"><span aria-hidden="true">👋</span> Begleit-Tipps sind an. Auf jeder Themen-Seite findet ihr Hinweise für das gemeinsame Lernen.</p>`
      : `<p class="learn-mode-status" role="status"><span aria-hidden="true">👋</span> Begleit-Tipps sind an. Die ausführlichen Hinweise für Begleitpersonen findet ihr in der Leichten Sprache.</p>`;
  } else if (learnMode === "app") {
    companionNote = `<p class="learn-mode-status" role="status"><span aria-hidden="true"><svg class="rb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L9 9H4z" fill="currentColor"/><path d="M16 8.6a4 4 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.6 6.2a7 7 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span> App-Hilfe ist an. Die Schrift ist größer und jede Seite wird dir vorgelesen.</p>`;
  }

  /* Beim ersten Besuch die Lernweg-Frage einmal groß zeigen; danach steckt
     der Lernweg im Hauptmenü unter „Einstellungen". */
  /* Die Lernweg-Frage steht NICHT mehr automatisch über der Themenliste
     (Prüfbericht B19): sie schob die erste Themenkachel auf y=1033 und stand
     ein zweites Mal in den Einstellungen. Sie erscheint jetzt nur noch, wenn
     die Person sie ausdrücklich aufklappt (openLearnModeChooser). */
  const showFullChooser = learnModeChooserOpen;
  let learnModeSection;
  if (showFullChooser) {
    markLearnModeSeen();
    learnModeSection = `
    <section class="learn-mode-section" aria-label="Wie möchtest du lernen?">
      <h3 class="learn-mode-title">Wie möchtest du heute lernen?</h3>
      <p class="learn-mode-sub">Such dir etwas aus. Du kannst es jederzeit ändern.</p>
      <div class="learn-mode-grid">${learnModeCards}</div>
      ${companionNote}
      <p class="learn-mode-hint"><span aria-hidden="true">ℹ️</span> Du musst dich nicht festlegen. Du kannst auch einfach ein Thema wählen und loslegen.</p>
    </section>`;
  } else {
    learnModeSection = companionNote;
  }

  /* Themen-Seite bewusst schlank: eine Hauptaufgabe – Thema wählen (CLT).
     Üben, Wiederholen und Lernstand liegen unter „Mein Lernweg". */
  content.innerHTML = `
    <section class="start-page">
      ${buildReadingToolbar()}
      ${learnModeSection}
      ${buildResumeLessonChip()}
      <h2 class="topic-grid-title">Wähle ein Thema</h2>
      <p class="topic-grid-hint">Tippe auf ein Thema. Dann geht es los.</p>
      ${roleFigure("themen")}
      ${groupSections}
      ${ersterBesuch ? `<div class="menu-hint-chip">Das Menü unten ist immer da.</div>` : ""}
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Seite „Mein Lernweg": Lernstand, Wiederholen, Üben
   ============================================================ */

function renderMyPath() {
  stopReading();
  currentTopicId = null;
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Mein Lernweg", "Mein Lernweg", "Dein Lernstand", 0);
  setActiveTab("lernweg");
  setOrientation("Du bist auf der Seite: Mein Lernweg.");
  rememberRoute("lernweg");
  showNav(false, false);

  const doneCount = countDoneTopics();

  /* Lernstand-Anzeige (Bandura: sichtbare Erfolgserlebnisse) –
     zeigt auch Erfolge aus dieser Sitzung, ohne dass etwas gespeichert wird */
  const heroProgress = doneCount > 0
    ? `<div class="hero-progress-row" role="region" aria-label="Dein Lernfortschritt">
         <div class="hero-progress-numbers">
           <span class="hero-progress-count" aria-live="polite">${doneCount}</span>
           <span class="hero-progress-of">von ${topics.length} Themen geschafft</span>
         </div>
         <div class="hero-progress-track" role="progressbar" aria-valuenow="${doneCount}" aria-valuemin="0" aria-valuemax="${topics.length}" aria-label="${doneCount} von ${topics.length} Themen">
           <div class="hero-progress-fill" style="width:${Math.round((doneCount/topics.length)*100)}%"></div>
         </div>
       </div>`
    : "";

  /* Geschaffte Themen als Liste (Erfolg sichtbar machen) */
  const doneTopics = topics.filter(t => isTopicDone(t.id));
  const doneSection = doneTopics.length > 0
    ? `<div class="review-chips">
         ${doneTopics.map(t => `
           <button type="button" class="review-chip" style="${getTopicColorStyle(t.id)}" onclick="renderTopicChoice('${escapeHtml(t.id)}')">
             <span aria-hidden="true">✓</span>
             <span>${escapeHtml(t.title)}</span>
           </button>`).join("")}
       </div>
       <p class="topic-grid-hint" style="margin-top:12px;">
         <button type="button" class="setting-big-button" onclick="printSuccessBook()">🖨 Mein Erfolgs-Heft drucken</button>
       </p>`
    : `<p class="topic-grid-hint">Noch nichts. Das ist in Ordnung. Fang mit einem Thema an.</p>`;

  /* Wiederholungs-Erinnerung (verteiltes Lernen) */
  const reviewTopics = getTopicsDueForReview();
  const reviewSection = reviewTopics.length > 0
    ? `<div class="review-section" role="region" aria-label="Wiederholung fällig">
         <div class="review-header">
           <span class="review-icon" aria-hidden="true">🔁</span>
           <div>
             <p class="review-title">Zeit zum Wiederholen!</p>
             <p class="review-sub">Du hast ${reviewTopics.length === 1 ? "dieses Thema" : "diese Themen"} vor mehr als einer Woche gelernt.</p>
           </div>
         </div>
         <div class="review-chips">
           ${reviewTopics.map(t => `
             <button type="button" class="review-chip" style="${getTopicColorStyle(t.id)}" onclick="startQuiz('${escapeHtml(t.id)}')">
               <span aria-hidden="true">${getIconHtml(t.icon || "start")}</span>
               <span>${escapeHtml(t.title)} – Quiz wiederholen</span>
             </button>`).join("")}
         </div>
       </div>`
    : "";

  /* Freiwillige Lernstand-Speicherung (KDG: nur lokal, ohne Namen) */
  let progressConsent = "";
  if (isProgressEnabled()) {
    progressConsent = `
      <div class="progress-consent">
        <p class="progress-consent-title">Du hast ${doneCount} von ${topics.length} Themen geschafft.</p>
        <p class="progress-consent-note">Der Lernstand wird nur auf diesem Gerät gespeichert. Ohne Namen.</p>
        <button type="button" class="utility-button" onclick="toggleProgressSaving()">Lernstand löschen und nicht mehr merken</button>
      </div>`;
  } else if (doneCount > 0) {
    progressConsent = `
      <div class="progress-consent">
        <p class="progress-consent-title">Soll ich mir merken, welche Themen du geschafft hast?</p>
        <p class="progress-consent-note">Das wird nur auf diesem Gerät gespeichert. Ohne Namen. Du kannst es jederzeit löschen.</p>
        <button type="button" class="utility-button" onclick="toggleProgressSaving()">Ja, Lernstand merken</button>
      </div>`;
  } else {
    progressConsent = `
      <div class="progress-consent">
        <p class="progress-consent-note">Die Seite speichert deinen Lernstand nicht von allein. Du entscheidest das. Nach deinem ersten Thema fragen wir dich.</p>
      </div>`;
  }

  const readCardSvg = READ_CARD_SVG;

  /* Drei benannte Blöcke statt eines Regals (Prüfbericht B6): Der Name der
     Seite verspricht einen Weg – also muss sie zuerst sagen, wo die Person
     gerade steht, dann was geschafft ist, dann was noch aussteht. Die
     Übungsangebote sind danach klar nachgeordnet. */
  const resumeChip = buildResumeLessonChip();
  const vorschlag = getNextTopicSuggestion();
  const hierBistDu = resumeChip
    ? `<section class="path-block" aria-label="Da bist du gerade">
         <h3 class="topic-grid-title">Da bist du gerade</h3>
         ${resumeChip}
       </section>`
    : (vorschlag
        ? `<section class="path-block" aria-label="Da bist du gerade">
             <h3 class="topic-grid-title">Da bist du gerade</h3>
             <p class="topic-grid-hint">${doneCount > 0 ? "Du hast gerade kein Thema offen." : "Du hast noch nicht angefangen."}</p>
             <button type="button" class="path-next-button" style="${getTopicColorStyle(vorschlag.id)}" onclick="renderTopicChoice('${escapeHtml(vorschlag.id)}')">
               <span class="path-next-icon" aria-hidden="true">${getIconHtml(vorschlag.icon || "start")}</span>
               <span class="path-next-text">
                 <span class="path-next-label">${doneCount > 0 ? "Dein nächstes Thema" : "Starte hier"}</span>
                 <span class="path-next-title">${escapeHtml(vorschlag.title)}</span>
               </span>
             </button>
           </section>`
        : "");

  /* Deine Karte: der Sammelstand. Steht bewusst oben beim Fortschritt und
     nicht als weitere Kachel unter "Zusätzlich üben" – dort stehen schon
     fünf gleichrangige Angebote, und keines sagt, wann es dran ist. */
  const kz = (typeof regelZaehlung === "function") ? regelZaehlung() : null;
  const karteBlock = !kz ? "" : `
    <button type="button" class="karte-block" onclick="renderRegelKarte()">
      <span class="karte-block-kopf">
        <span class="karte-block-titel">Deine Karte</span>
        <span class="karte-block-zahl">${kz.gefunden} <span>von ${kz.gesamt}</span></span>
      </span>
      <span class="karte-block-balken" aria-hidden="true">
        <span class="karte-block-fuell" style="width:${Math.round((kz.gefunden / kz.gesamt) * 100)}%"></span>
      </span>
      <span class="karte-block-sub">${
        kz.gefunden === 0
          ? "Beim Üben sammelst du deine eigenen Regeln."
          : (kz.gefunden < kz.gesamt
              ? "Dir fehlen noch " + (kz.gesamt - kz.gefunden) + " " + (kz.gesamt - kz.gefunden === 1 ? "Regel" : "Regeln") + ". " + (kz.sitzt === 1 ? "Davon sitzt 1." : "Davon sitzen " + kz.sitzt + ".")
              : (kz.sitzt < kz.gesamt
                  ? (kz.sitzt === 1 ? "Alle Regeln gefunden. Eine davon sitzt schon." : "Alle Regeln gefunden. " + kz.sitzt + " davon sitzen schon.")
                  : "Alle Regeln sitzen. Deine Karte ist voll."))
      }</span>
    </button>`;

  /* Was noch offen ist – in der Reihenfolge, in der die Themenseite es zeigt. */
  const offeneTopics = getTopicsInDisplayOrder().filter(t => !isTopicDone(t.id));
  const offenSection = offeneTopics.length > 0
    ? `<section class="path-block" aria-label="Das ist noch offen">
         <h3 class="topic-grid-title">Das ist noch offen</h3>
         <p class="topic-grid-hint">${offeneTopics.length === 1 ? "Noch 1 Thema. Fast geschafft." : "Noch " + offeneTopics.length + " Themen. Du musst nicht alle machen."}</p>
         <div class="review-chips">
           ${offeneTopics.map(t => `
             <button type="button" class="review-chip review-chip--open" style="${getTopicColorStyle(t.id)}" onclick="renderTopicChoice('${escapeHtml(t.id)}')">
               <span aria-hidden="true">${getIconHtml(t.icon || "start")}</span>
               <span>${escapeHtml(t.title)}</span>
             </button>`).join("")}
         </div>
       </section>`
    : "";

  content.innerHTML = `
    <section class="start-page">
      ${buildReadingToolbar()}
      <h2 class="topic-grid-title">Mein Lernweg</h2>
      ${roleFigure("lernweg")}
      ${hierBistDu}
      ${buildGrandFinish()}
      <section class="path-block" aria-label="Das hast du geschafft">
        <h3 class="topic-grid-title">Das hast du geschafft</h3>
        ${heroProgress}
        ${karteBlock}
        ${reviewSection}
        ${doneSection}
      </section>
      ${offenSection}

      <section class="practice-section path-block" aria-label="Zusätzlich üben">
        <h3 class="topic-grid-title">Zusätzlich üben</h3>
        <p class="topic-grid-hint">Hier kannst du üben. Ganz ohne Druck.</p>
        <div class="action-grid practice-grid">
          <div class="card-read-pair card-read-pair--action">
            <button type="button" class="action-card" onclick="startBigQuiz()">
            <span class="action-icon" aria-hidden="true">${getIconHtml("quiz")}</span>
            <span class="action-text">
              <span class="action-title">Das große Quiz</span>
              <span class="action-desc">Fragen aus allen Themen.</span>
            </span>
          </button>
            <button type="button" class="card-read-button card-read-button--path" data-read-card-text="Das große Quiz. Fragen aus allen Themen." aria-label="Das große Quiz vorlesen">${readCardSvg} Vorlesen</button>
          </div>
          <div class="card-read-pair card-read-pair--action">
            <button type="button" class="action-card" onclick="startRepeatQuiz()">
            <span class="action-icon" aria-hidden="true">${getIconHtml("exercise")}</span>
            <span class="action-text">
              <span class="action-title">Wiederholen</span>
              <span class="action-desc">Fragen aus deinen Themen.</span>
            </span>
          </button>
            <button type="button" class="card-read-button card-read-button--path" data-read-card-text="Wiederholen. Fragen aus deinen Themen." aria-label="Wiederholen vorlesen">${readCardSvg} Vorlesen</button>
          </div>
          <div class="card-read-pair card-read-pair--action">
            <button type="button" class="action-card" onclick="renderScenarioChooser()">
            <span class="action-icon" aria-hidden="true">${getIconHtml("start")}</span>
            <span class="action-text">
              <span class="action-title">Übungs-Handy</span>
              <span class="action-desc">Üben wie auf dem Handy.</span>
            </span>
          </button>
            <button type="button" class="card-read-button card-read-button--path" data-read-card-text="Übungs-Handy. Üben wie auf dem Handy." aria-label="Übungs-Handy vorlesen">${readCardSvg} Vorlesen</button>
          </div>
          <div class="card-read-pair card-read-pair--action">
            <button type="button" class="action-card" onclick="startTrainingInbox()">
            <span class="action-icon" aria-hidden="true">${getIconHtml("message")}</span>
            <span class="action-text">
              <span class="action-title">Trainings-Postfach</span>
              <span class="action-desc">Trick oder echt? Gefahrlos üben.</span>
            </span>
          </button>
            <button type="button" class="card-read-button card-read-button--path" data-read-card-text="Trainings-Postfach. Trick oder echt? Gefahrlos üben." aria-label="Trainings-Postfach vorlesen">${readCardSvg} Vorlesen</button>
          </div>
          <div class="card-read-pair card-read-pair--action">
            <button type="button" class="action-card" onclick="renderAllMemoryCards()">
            <span class="action-icon" aria-hidden="true">${getIconHtml("remember")}</span>
            <span class="action-text">
              <span class="action-title">Alle Merk-Karten</span>
              <span class="action-desc">Alle Regeln ansehen.</span>
            </span>
          </button>
            <button type="button" class="card-read-button card-read-button--path" data-read-card-text="Alle Merk-Karten. Alle Regeln ansehen." aria-label="Alle Merk-Karten vorlesen">${readCardSvg} Vorlesen</button>
          </div>
        </div>
      </section>

      ${progressConsent}
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

/* Mein Erfolgs-Heft: Urkunden-Seite + Merk-Regeln aller geschafften
   Themen als druckbares Heft. Mitnahme-Artefakt (Bandura: sichtbarer
   Erfolg), dialogische Grundlage mit der Begleitperson. Keine Speicherung. */
function printSuccessBook() {
  const doneTopics = topics.filter(t => isTopicDone(t.id));
  if (!doneTopics.length) return;
  const prof = getActiveProfile();
  const wer = prof ? signLabel(prof) : "";
  const datum = new Date().toLocaleDateString("de-DE");
  const seiten = doneTopics.map(t => {
    const rules = Array.isArray(t.memoryRules) ? t.memoryRules.slice(0, 5) : [];
    return `<section class="heft-seite">
      <h2>✓ ${escapeHtml(t.title)}</h2>
      <p class="heft-geschafft">Das habe ich geschafft.</p>
      ${rules.length ? `<h3>Das ist wichtig:</h3><ul>${rules.map(r => `<li>${escapeHtml(r)}</li>`).join("")}</ul>` : ""}
    </section>`;
  }).join("");
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">` +
    `<title>Mein Erfolgs-Heft</title>` +
    `<style>body{font-family:Arial,Helvetica,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#16222e;line-height:1.6;}` +
    `h1{font-size:26px;margin:0 0 4px;text-align:center;}` +
    `.heft-titel{border:3px solid #00528f;border-radius:16px;padding:28px 20px;text-align:center;margin-bottom:24px;}` +
    `.heft-titel p{margin:6px 0;font-size:15px;}` +
    `.heft-seite{border:2px solid #c6c7c8;border-radius:12px;padding:16px 20px;margin-bottom:16px;page-break-inside:avoid;}` +
    `.heft-seite h2{font-size:19px;margin:0 0 2px;color:#00528f;}` +
    `.heft-geschafft{margin:0 0 10px;color:#2E7D4F;font-weight:bold;}` +
    `h3{font-size:15px;margin:10px 0 4px;}ul{margin:4px 0;padding-left:22px;}li{margin-bottom:5px;}` +
    `.heft-fuss{margin-top:20px;color:#555;font-size:12px;text-align:center;}</style></head><body>` +
    `<div class="heft-titel"><h1>Mein Erfolgs-Heft</h1>` +
    (wer ? `<p>Von: ${escapeHtml(wer)}</p>` : "") +
    `<p>${doneTopics.length} von ${topics.length} Themen geschafft · Stand: ${datum}</p>` +
    `<p>Sicher und selbstbestimmt im Internet</p></div>` +
    seiten +
    `<p class="heft-fuss">Lernplattform der Alexianer Stift Tilbeck GmbH · gefördert von der Sozialstiftung NRW</p>` +
    `</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch (e) { /* nichts tun */ } }, 300);
}

/* Gesamt-Urkunde: der größte Erfolgsmoment der Plattform.
   Erscheint erst, wenn ALLE Themen geschafft sind. Druckbar, ohne
   Speicherung – Empowerment-Sprache, nicht kindisch. */
function printGrandCertificate() {
  if (countDoneTopics() < topics.length) return;
  const prof = getActiveProfile();
  const wer = prof ? signLabel(prof) : "";
  const datum = new Date().toLocaleDateString("de-DE");
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">` +
    `<title>Urkunde – Alle Themen geschafft</title>` +
    `<style>body{font-family:Arial,Helvetica,sans-serif;max-width:680px;margin:40px auto;padding:0 16px;color:#16222e;text-align:center;line-height:1.7;}` +
    `.rahmen{border:5px double #00285A;border-radius:20px;padding:44px 30px;}` +
    `h1{font-size:34px;letter-spacing:0.12em;margin:0 0 18px;color:#00285A;}` +
    `.wer{font-size:24px;font-weight:bold;margin:14px 0;}` +
    `.was{font-size:19px;margin:12px 0;}` +
    `.gross{font-size:21px;font-weight:bold;color:#2E7D4F;margin:16px 0;}` +
    `.datum{margin-top:26px;font-size:15px;color:#555;}` +
    `.fuss{margin-top:18px;font-size:12px;color:#555;}</style></head><body>` +
    `<div class="rahmen">` +
    `<h1>URKUNDE</h1>` +
    (wer ? `<p class="wer">${escapeHtml(wer)}</p>` : "") +
    `<p class="was">hat alle ${topics.length} Themen geschafft:</p>` +
    `<p class="was"><strong>Sicher und selbstbestimmt im Internet</strong></p>` +
    `<p class="gross">Du kennst dich jetzt gut aus.<br>Du kannst dich sicher im Internet bewegen.</p>` +
    `<p class="datum">Geschafft am ${datum}</p>` +
    `<p class="fuss">Lernplattform der Alexianer Stift Tilbeck GmbH · gefördert von der Sozialstiftung NRW</p>` +
    `</div></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch (e) { /* nichts tun */ } }, 300);
}

/* Feier-Baustein: erscheint auf Abschluss-Seite und in „Mein Lernweg",
   sobald alle Themen geschafft sind. */
function buildGrandFinish() {
  if (countDoneTopics() < topics.length) return "";
  return `
    <div class="grand-finish" role="region" aria-label="Alle Themen geschafft">
      <h3>🎉 Du hast alle ${topics.length} Themen geschafft!</h3>
      <p>Das ist eine große Leistung.</p>
      <p>Du kennst dich jetzt gut aus. Du kannst dich sicher im Internet bewegen.</p>
      <button type="button" class="setting-big-button" onclick="printGrandCertificate()">🖨 Deine große Urkunde drucken</button>
    </div>`;
}

/* ============================================================
   Seite „Hilfe": jederzeit über das Hauptmenü erreichbar (COGA)
   ============================================================ */

function renderHelpPage() {
  stopReading();
  currentTopicId = null;
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Hilfe", "Hilfe", "Du kannst Hilfe holen", 0);
  setActiveTab("hilfe");
  setOrientation("Du bist auf der Seite: Hilfe.");
  rememberRoute("hilfe");
  showNav(false, false);

  content.innerHTML = `
    <section class="start-page" data-readable="true">
      ${buildReadingToolbar()}
      <h2 class="topic-grid-title">Hilfe</h2>
      <p class="topic-grid-hint">Du musst das nicht allein schaffen.</p>
      ${buildResumeLessonChip()}
      ${roleFigure("hilfe")}

      <div class="help-page-actions">
        <button type="button" class="setting-big-button" onclick="showSymbolHelp()">Zeichen erklären</button>
        <button type="button" class="setting-big-button" onclick="showPauseOverlay()">Pause machen</button>
      </div>

      <div class="support-help-grid">
        <div class="support-help-card">
          <h4>Wenn du die Seite nicht bedienen kannst ${sectionReadChip("Wenn du die Seite nicht bedienen kannst")}</h4>
          <ul>
            <li>Zeige auf die Stelle.</li>
            <li>Sage: Ich brauche Hilfe bei der Bedienung.</li>
            <li>Bitte um langsames Erklären.</li>
          </ul>
        </div>
        <div class="support-help-card">
          <h4>Wenn du etwas nicht verstehst ${sectionReadChip("Wenn du etwas nicht verstehst")}</h4>
          <ul>
            <li>Lies den Text noch einmal.</li>
            <li>Nutze den Knopf: Vorlesen.</li>
            <li>Bitte eine Person um Erklärung.</li>
            <li>Sage: Bitte erkläre mir das einfacher.</li>
          </ul>
        </div>
        <div class="support-help-card">
          <h4>Wen kannst du fragen? ${sectionReadChip("Wen kannst du fragen?")}</h4>
          <ul>
            <li>Eine Person, der du vertraust.</li>
            <li>Eine Person, die dich unterstützt.</li>
            <li>Eine Digital-Begleiterin oder einen Digital-Begleiter.</li>
            <li>Jemanden im Wohnbereich oder Dienst.</li>
          </ul>
        </div>
        <div class="support-help-card">
          <h4>Wenn dir im Internet etwas Schlechtes passiert ${sectionReadChip("Wenn dir im Internet etwas Schlechtes passiert")}</h4>
          <ul>
            <li>Das ist nicht deine Schuld.</li>
            <li>Sprich mit einer Person, der du vertraust.</li>
            <li>Es gibt das Thema: Hilfe bei Problemen. Dort steht mehr.</li>
          </ul>
        </div>
      </div>
      <p class="support-help-remember">Du musst das nicht allein schaffen.</p>

      <div class="intro-offer" role="region" aria-label="Deine Meinung ist wichtig">
        <h3>Deine Meinung ist wichtig ${sectionReadChip("Deine Meinung ist wichtig")}</h3>
        <p>Du kannst diese Lern-Seite prüfen.</p>
        <p>Sag uns: Was ist gut? Was ist schwer?</p>
        <p>Dafür gibt es das Prüf-Heft. Ohne Namen. Es gibt kein richtig und kein falsch.</p>
        <p><a class="setting-big-button pruefheft-link" href="pruefheft.html">Zum Prüf-Heft</a></p>
      </div>

      <div class="intro-offer" role="region" aria-label="Das Menü">
        <h3>Das Menü ${sectionReadChip("Das Menü")}</h3>
        ${buildMenuExplainList()}
      </div>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Seite „Einstellungen": alle Einstellungen an einem Ort
   ============================================================ */

function renderSettingsPage() {
  stopReading();
  currentTopicId = null;
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", "Einstellungen", "Einstellungen", "Stell dir alles passend ein", 0);
  setActiveTab("einstellungen");
  setOrientation("Du bist auf der Seite: Einstellungen.");
  rememberRoute("einstellungen");
  showNav(false, false);

  const activeProfile = getActiveProfile();
  const profileSection = activeProfile ? `
    <section class="settings-page-section" aria-label="Dein Zeichen">
      <h3>Dein Zeichen</h3>
      <p class="settings-explain">Du bist gerade: ${escapeHtml(signLabel(activeProfile))}.</p>
      <div class="settings-toggle-row">
        <button type="button" class="setting-big-button" onclick="renderProfilePicker()">Person wechseln</button>
        <button type="button" class="setting-big-button" onclick="renderProfileManage('${escapeHtml(activeProfile.id)}')">Zeichen ändern</button>
      </div>
    </section>` : "";

  const learnModeButtons = Object.keys(LEARN_MODES).map(key => {
    const m = LEARN_MODES[key];
    const active = learnMode === key;
    return `<button type="button" class="setting-big-button" aria-pressed="${active ? "true" : "false"}" onclick="chooseLearnMode('${key}')">${escapeHtml(m.title)}</button>`;
  }).join("");

  content.innerHTML = `
    <section class="start-page" data-readable="true">
      ${buildReadingToolbar()}
      <h2 class="topic-grid-title">Einstellungen</h2>
      ${roleFigure("einstellungen")}
      <p class="topic-grid-hint">Hier kannst du vieles einstellen. So passt die Seite gut zu dir.</p>
      ${buildResumeLessonChip()}

      <section class="settings-page-section" aria-label="Schrift">
        <h3>Schrift ${sectionReadChip("Schrift")}</h3>
        <p class="settings-explain">Du kannst die Schrift größer oder kleiner machen.</p>
        <div class="settings-toggle-row" role="group" aria-label="Schriftgröße ändern">
          <button type="button" class="setting-big-button font-btn font-btn-decrease" onclick="changeFontSize(-1)" aria-label="Schrift kleiner" ${fontSizeStep === 0 ? "disabled" : ""}>A− kleiner</button>
          <button type="button" class="setting-big-button font-btn font-btn-increase" onclick="changeFontSize(1)" aria-label="Schrift größer" ${fontSizeStep === FONT_SIZES.length - 1 ? "disabled" : ""}>A+ größer</button>
        </div>
      </section>

      <section class="settings-page-section" aria-label="Vorlesen">
        <h3>Vorlesen ${sectionReadChip("Vorlesen")}</h3>
        <p class="settings-explain">Soll jede Seite automatisch vorgelesen werden?</p>
        <div class="settings-toggle-row" role="group" aria-label="Automatisch vorlesen">
          <button type="button" class="setting-big-button" aria-pressed="${autoRead ? "true" : "false"}" onclick="setAutoRead(true); renderSettingsPage();">Ja, immer vorlesen</button>
          <button type="button" class="setting-big-button" aria-pressed="${autoRead ? "false" : "true"}" onclick="setAutoRead(false); renderSettingsPage();">Nein, ich drücke selbst</button>
        </div>
        <p class="settings-explain" style="margin-top:14px;">Wie schnell soll die Stimme lesen?</p>
        <div class="settings-toggle-row" role="group" aria-label="Vorlese-Tempo">
          <button type="button" class="setting-big-button" aria-pressed="${readTempo === "normal" ? "true" : "false"}" onclick="setReadTempo('normal')">Normal</button>
          <button type="button" class="setting-big-button" aria-pressed="${readTempo === "langsam" ? "true" : "false"}" onclick="setReadTempo('langsam')">Langsam</button>
        </div>
      </section>

      <section class="settings-page-section" aria-label="Töne und Bewegung">
        <h3>Töne und Bewegung ${sectionReadChip("Töne und Bewegung")}</h3>
        <p class="settings-explain">Du kannst Töne anschalten oder ausschalten. Das Gleiche geht mit Bewegungen.</p>
        <div class="settings-toggle-row">
          <button type="button" class="setting-big-button sound-toggle" onclick="toggleSound()">Töne</button>
          <button type="button" class="setting-big-button motion-toggle" onclick="toggleMotion()">Bewegung</button>
        </div>
      </section>

      <section class="settings-page-section" aria-label="Sprache">
        <h3>Sprache ${sectionReadChip("Sprache")}</h3>
        <p class="settings-explain">Du liest gerade: <strong>${escapeHtml(LANGUAGE_LABEL[languageLevel])}</strong>.</p>
        <div class="settings-toggle-row">
          <button type="button" class="setting-big-button" onclick="renderLanguageChoice('${escapeHtml(languageLevel)}')">Sprache wechseln</button>
        </div>
      </section>

      <section class="settings-page-section" aria-label="Lernweg">
        <h3>Wie möchtest du lernen? ${sectionReadChip("Wie möchtest du lernen?")}</h3>
        <p class="settings-explain">Such dir etwas aus. Du kannst es jederzeit ändern.</p>
        <div class="settings-toggle-row">${learnModeButtons}</div>
      </section>

      ${profileSection}
    </section>
  `;
  updateSoundButton();
  updateMotionButton();
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Themenseite: Lernweg wählen
   ============================================================ */

/* Kompetenz-Einordnung (DigComp 2.2 + ICF) als Block.
   Reine Fachkräfte-Information: zeigt, was die Person danach im ALLTAG
   kann (Aktivität und Teilhabe), nicht nur, was sie weiß. */
function buildCompetenceBlock(c) {
  const k = c && c.kompetenzen;
  if (!k) return "";
  const liste = (items, mitStufe) => {
    if (!Array.isArray(items) || !items.length) return "";
    return `<ul class="komp-liste">` + items.map(e =>
      `<li><span class="komp-code">${escapeHtml(e.code)}</span>` +
      `<span class="komp-titel">${escapeHtml(e.titel)}</span>` +
      (mitStufe && e.stufe ? `<span class="komp-stufe">${escapeHtml(e.stufe)}</span>` : "") +
      `<span class="komp-bezug">${escapeHtml(e.bezug)}</span></li>`).join("") + `</ul>`;
  };
  const dc = liste(k.digcomp, true);
  const icf = liste(k.icf, false);
  if (!dc && !icf) return "";
  return `<div class="companion-section companion-kompetenz">
      <h4>Kompetenz-Einordnung</h4>
      ${dc ? `<h5>DigComp 2.2 – Europäischer Referenzrahmen für digitale Kompetenzen</h5>${dc}` : ""}
      ${icf ? `<h5>ICF – Aktivität, Teilhabe und Umweltfaktoren</h5>${icf}` : ""}
      <p class="komp-fuss">Die Stufen 1–2 stehen für grundlegende Kompetenz: mit Anleitung bis selbstständig bei einfachen Aufgaben. Die ICF-Bezüge benennen den Alltags-Nutzen, nicht ein Defizit.</p>
    </div>`;
}

/* Begleit-Material als saubere Druck-/PDF-Ansicht (Handout für Fachkräfte). */
function printCompanion(topicId) {
  const topic = getTopicById(topicId);
  const c = topic && topic.companion;
  if (!c) return;
  const sections = [
    ["Lernziele", c.lernziele],
    ["Methodische Hinweise", c.methodik],
    ["Gesprächsanlässe", c.gespraechsanlaesse],
    ["Hinweise zur Begleitung", c.begleithinweise],
    ["Rechts- und Fachbezüge", c.rechtsbezuege],
    ["Alltagstransfer", c.transfer]
  ];
  /* Kompetenz-Einordnung fürs Handout (steht direkt hinter den Lernzielen). */
  const k = c.kompetenzen;
  const kompListe = (items, mitStufe) => (Array.isArray(items) && items.length)
    ? `<ul>${items.map(e => `<li><b>${escapeHtml(e.code)}</b> ${escapeHtml(e.titel)}` +
        (mitStufe && e.stufe ? ` <span class="stufe">${escapeHtml(e.stufe)}</span>` : "") +
        `<br>${escapeHtml(e.bezug)}</li>`).join("")}</ul>`
    : "";
  const kompPrint = k
    ? `<h2>Kompetenz-Einordnung</h2>` +
      (kompListe(k.digcomp, true) ? `<h3>DigComp 2.2 – Europäischer Referenzrahmen für digitale Kompetenzen</h3>${kompListe(k.digcomp, true)}` : "") +
      (kompListe(k.icf, false) ? `<h3>ICF – Aktivität, Teilhabe und Umweltfaktoren</h3>${kompListe(k.icf, false)}` : "") +
      `<p class="meta">Stufe 1–2 = grundlegende Kompetenz: mit Anleitung bis selbstständig bei einfachen Aufgaben. Die ICF-Bezüge benennen den Alltags-Nutzen, kein Defizit.</p>`
    : "";
  const body = sections
    .filter(([, it]) => Array.isArray(it) && it.length)
    .map(([t, it]) => {
      const block = `<h2>${escapeHtml(t)}</h2><ul>${it.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
      return t === "Lernziele" ? block + kompPrint : block;
    })
    .join("");
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">` +
    `<title>Begleit-Material – ${escapeHtml(topic.title)}</title>` +
    `<style>body{font-family:Arial,Helvetica,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#142231;line-height:1.55;}` +
    `h1{font-size:20px;margin:0 0 4px;}h2{font-size:15px;margin:18px 0 4px;border-bottom:1px solid #ccd;padding-bottom:4px;}` +
    `h3{font-size:13px;margin:12px 0 2px;color:#334;}` +
    `.stufe{color:#555;font-size:11px;white-space:nowrap;}b{font-family:"Courier New",monospace;}` +
    `ul{margin:6px 0;padding-left:20px;}li{margin-bottom:5px;}.meta{color:#555;font-size:12px;margin:0 0 12px;}` +
    `.foot{margin-top:24px;border-top:1px solid #ccd;padding-top:8px;color:#555;font-size:11px;}</style></head><body>` +
    `<h1>Für Begleitpersonen und Fachkräfte</h1>` +
    `<p class="meta">Thema: ${escapeHtml(topic.title)} · Sicher und selbstbestimmt im Internet</p>` +
    body +
    `<p class="foot">Begleit-Material zur Lernplattform „Sicher und selbstbestimmt im Internet". ` +
    `Diese Hinweise richten sich an Fachkräfte und sind nicht Teil der Lern-Texte.</p></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch (e) { /* nichts tun */ } }, 300);
}

/* QR-Karten drucken: eine Karte je Thema (Titel + QR + Adresse).
   Für Workshops und Begleitung: scannen und dasselbe Thema am eigenen
   Handy weiterlernen. QR-Codes liegen lokal in assets/qr/ (kein externer
   Dienst, KDG-konform). */
function printQrCards() {
  const base = "https://alex-und-tilda.github.io/sicher-und-selbstbestimmt-im-internet/";
  const cards = topics.map(t => `
    <div class="qr-karte">
      <h2>${escapeHtml(t.title)}</h2>
      <img src="${new URL("assets/qr/" + escapeHtml(t.id) + ".svg", window.location.href).href}" alt="QR-Code für das Thema ${escapeHtml(t.title)}" width="180" height="180">
      <p class="qr-anleitung">Mit der Handy-Kamera scannen.<br>Dann öffnet sich das Thema.</p>
    </div>`).join("");
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">` +
    `<title>QR-Karten – Sicher und selbstbestimmt im Internet</title>` +
    `<style>body{font-family:Arial,Helvetica,sans-serif;margin:16px;color:#16222e;}` +
    `h1{font-size:20px;text-align:center;}` +
    `.qr-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}` +
    `.qr-karte{border:2px solid #00285A;border-radius:12px;padding:14px;text-align:center;page-break-inside:avoid;}` +
    `.qr-karte h2{font-size:17px;margin:0 0 8px;}` +
    `.qr-anleitung{font-size:13px;margin:8px 0 0;line-height:1.5;}` +
    `.qr-fuss{margin-top:14px;font-size:11px;color:#555;text-align:center;}</style></head><body>` +
    `<h1>QR-Karten: Themen zum Scannen</h1>` +
    `<div class="qr-grid">${cards}</div>` +
    `<p class="qr-fuss">${escapeHtml(base)} · Alexianer Stift Tilbeck GmbH · Sozialstiftung NRW</p>` +
    `</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch (e) { /* nichts tun */ } }, 500);
}

/* Begleit-Panel „Für Begleitpersonen und Fachkräfte" (eigene Ebene,
   keine Sprach-Stufe). Erscheint nur, wenn das Thema Begleit-Material hat. */
function buildCompanionPanel(topic) {
  /* Die Begleit-Ebene ist nach §7 KEINE Sprach-Stufe für Lernende, sondern
     eine eigene Ebene für Fachkräfte. Sie war trotzdem an die Leichte Sprache
     gebunden und fehlte in Einfacher Sprache und Alltagssprache vollständig
     (Prüfbericht B21) – eine Fachkraft, die jemanden auf B1-Niveau begleitet,
     sah weder Lernziele noch Methodik noch Rechtsbezüge. Das Panel ist
     zugeklappt und trägt eine eindeutige Überschrift; es stört den
     SOLO-Gebrauch also auch in den anderen Stufen nicht. */
  const c = topic && topic.companion;
  if (!c) return "";
  const sections = [
    ["Lernziele", c.lernziele],
    ["Methodische Hinweise", c.methodik],
    ["Gesprächsanlässe", c.gespraechsanlaesse],
    ["Hinweise zur Begleitung", c.begleithinweise],
    ["Rechts- und Fachbezüge", c.rechtsbezuege],
    ["Alltagstransfer", c.transfer]
  ];
  const blocks = sections
    .filter(([, items]) => Array.isArray(items) && items.length)
    .map(([titel, items]) =>
      `<div class="companion-section">
         <h4>${escapeHtml(titel)}</h4>
         <ul>${items.map(it => `<li>${escapeHtml(it)}</li>`).join("")}</ul>
       </div>`)
    .join("");
  if (!blocks) return "";
  return `
    <details class="companion-panel"${isCompanionMode() ? " open" : ""}>
      <summary>
        <span class="companion-badge">Für Begleitpersonen und Fachkräfte</span>
        <span class="companion-hint">Lernziele, Methodik, Rechtsbezüge – zum Aufklappen</span>
      </summary>
      <div class="companion-body">
        <p class="companion-intro">Diese Hinweise richten sich an Betreuende, Assistenz, Angehörige und Fachkräfte. Sie sind nicht Teil der Lern-Texte.</p>
        ${buildCompetenceBlock(c)}
        ${blocks}
        <div class="companion-qr">
          <img src="assets/qr/${escapeHtml(topic.id)}.svg" alt="QR-Code für das Thema ${escapeHtml(topic.title)}" width="132" height="132" loading="lazy">
          <p>Zum Weiterlernen am eigenen Handy: QR-Code scannen – das Thema öffnet sich direkt.</p>
        </div>
        <button type="button" class="companion-print" onclick="printCompanion('${escapeHtml(topic.id)}')">🖨 Drucken / als PDF speichern</button>
        <button type="button" class="companion-print" onclick="printQrCards()">🖨 QR-Karten für alle Themen drucken</button>
        <p class="companion-intro"><a href="beobachtungsbogen.html">Beobachtungsbogen für Prüfgruppen-Sitzungen</a> – strukturierte, datensparsame Beobachtung zum Ausdrucken.</p>
        <p class="companion-intro"><a href="pruefaufgaben.html">Prüf-Aufgaben für die Begleitung</a> – konkrete Aufgaben mit Erfolgskriterium und Wort-Test, zum Ausdrucken.</p>
        <p class="companion-intro"><a href="pruefheft.html">Prüf-Heft für Klientinnen und Klienten</a> – Aufgaben in Leichter Sprache mit Smiley-Antworten, zum Ausdrucken.</p>
        ${buildPraxisLinks(topic)}
      </div>
    </details>`;
}

/* Workshop-Material erreichbar machen (Prüfbericht B22).
   Die sieben Klick-Anleitungen in praxis/ und die Workshop-Dateien in
   material/ lagen im veröffentlichten Stand, waren aber aus der App über
   keinen einzigen Link zu erreichen – weder für Lernende noch für
   Fachkräfte. Sie hängen jetzt an der Begleit-Ebene, wo sie hingehören. */
const PRAXIS_SEITEN = ["whatsapp", "facebook", "instagram", "youtube", "snapchat", "tiktok"];

function buildPraxisLinks(topic) {
  const eigene = topic && PRAXIS_SEITEN.includes(topic.id)
    ? `<p class="companion-intro"><a href="praxis/${escapeHtml(topic.id)}.html">Klick-Anleitung ${escapeHtml(topic.title)}</a> – Schritt für Schritt durch die Einstellungen: Konto privat stellen, blockieren, melden.</p>`
    : "";
  return eigene
    + `<p class="companion-intro"><a href="praxis/index.html">Alle Klick-Anleitungen und Workshop-Material</a> – Anleitungen für 6 Apps, dazu Folien, Methodik-Blätter und Quiz-Vorlagen zum Herunterladen.</p>`
    + `<p class="companion-intro"><a href="fortschritt.html">Abdeckung der drei Sprachstufen</a> – zeigt für jedes Thema, welche Stufen schon vorliegen. Rechnet lokal, ohne fremden Server.</p>`;
}

/* Mengen-Wahl (Kurz/Mehr) je Thema – nur für die Sitzung gemerkt.
   Standard kommt aus der Vorwissens-Frage: erfahren -> Kurz, sonst Mehr. */
/* Mengen-Wahl je Thema (Prüfbericht B9).
   Vorher hielt eine einzige Variable genau EIN Thema fest: Wer bei
   Datenschutz auf „Mehr" stellte und danach WhatsApp öffnete, stand wieder
   bei „Kurz" – und musste die Wahl bei jedem der 12 Themen neu treffen.
   Jetzt merkt sich die App die Wahl je Thema und trägt die zuletzt
   getroffene Wahl auf noch unbesuchte Themen weiter. Die Vorwissens-Antwort
   ist damit nur noch der Vorschlag für das allererste Thema.
   Gespeichert wird eine Zuordnung {themaId: "short"|"full"} im localStorage
   des Profils – eine lokale Einstellung wie Schriftgröße (§14, KDG). */
const TOPIC_AMOUNT_KEY = "mengen-wahl";
const LAST_AMOUNT_KEY  = "mengen-zuletzt";
let topicAmounts = {};
let lastAmountChoice = null;

function loadTopicAmounts() {
  topicAmounts = {};
  lastAmountChoice = null;
  try {
    const raw = pGet(TOPIC_AMOUNT_KEY);
    const daten = raw ? JSON.parse(raw) : null;
    if (daten && typeof daten === "object") {
      Object.keys(daten).forEach(id => {
        if (getTopicById(id) && (daten[id] === "short" || daten[id] === "full")) {
          topicAmounts[id] = daten[id];
        }
      });
    }
  } catch (e) { /* nichts tun */ }
  const zuletzt = pGet(LAST_AMOUNT_KEY);
  if (zuletzt === "short" || zuletzt === "full") lastAmountChoice = zuletzt;
}

function saveTopicAmounts() {
  try { pSet(TOPIC_AMOUNT_KEY, JSON.stringify(topicAmounts)); } catch (e) { /* nichts tun */ }
  if (lastAmountChoice) pSet(LAST_AMOUNT_KEY, lastAmountChoice);
}

function clearTopicAmounts() {
  topicAmounts = {};
  lastAmountChoice = null;
  pRemove(TOPIC_AMOUNT_KEY);
  pRemove(LAST_AMOUNT_KEY);
}

/* Hat die Person für DIESES Thema schon selbst gewählt? Steuert den
   Hinweistext unter der Wahl – „vorausgewählt" wäre dann eine Unwahrheit. */
function hasOwnTopicAmount(topicId) {
  return Boolean(topicAmounts[topicId]);
}

function getTopicAmount(topicId) {
  if (topicAmounts[topicId]) return topicAmounts[topicId];
  if (lastAmountChoice) return lastAmountChoice;
  return pGet(VORWISSEN_KEY) === "erfahren" ? "short" : "full";
}

function setTopicAmount(topicId, amount) {
  const wahl = amount === "short" ? "short" : "full";
  if (getTopicById(topicId)) topicAmounts[topicId] = wahl;
  lastAmountChoice = wahl;
  saveTopicAmounts();
  renderTopicChoice(topicId);
}

/* Auch der Weg über „Mehr lernen" oder „Nochmal von vorne" ist eine Wahl –
   sonst stünde beim nächsten Öffnen des Themas wieder die alte Menge da. */
function rememberTopicAmount(topicId, mode) {
  const wahl = mode === "short" ? "short" : "full";
  if (!getTopicById(topicId)) return;
  if (topicAmounts[topicId] === wahl && lastAmountChoice === wahl) return;
  topicAmounts[topicId] = wahl;
  lastAmountChoice = wahl;
  saveTopicAmounts();
}

function renderTopicChoice(topicId) {
  stopReading();
  const topic = getTopicById(topicId);
  if (!topic) return renderMenu();

  currentTopicId = topic.id;
  currentStep = 0;
  currentQuizIndex = 0;
  quizScore = 0;
  quizAnsweredCorrect = new Set();

  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Sicher und selbstbestimmt im Internet", topic.title, "Thema auswählen", "Wie möchtest du lernen?", 0);
  setActiveTab("themen");
  setOrientation(`Du bist beim Thema: ${topic.title}.`);
  rememberRoute(topicRoute(topic.id));
  showNav(false, false);

  /* Reihenfolge dieser Seite folgt Prüfbericht B1: erst die Hauptaktion, dann
     alles Weitere. Vorher lagen Zurück-Knopf, Vorlese-Leiste und eine 384 px
     hohe Karte davor – „Lernen starten" saß dadurch bei y=793 und damit unter
     der festen Menüleiste (y=764), war also beim Öffnen unsichtbar. Die Karte
     ist jetzt eine Zeile; der Zurück-Knopf steht am Seitenende (die Menüleiste
     leistet dasselbe dauerhaft). */
  content.innerHTML = `
    <section class="topic-choice" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      ${buildReadingToolbar()}
      ${/* Nur Bild und Titel. Das Symbol stand hier ein zweites Mal neben dem
            Bild, und die Beschreibung ein drittes Mal: sie steht schon auf der
            Kachel, die gerade angetippt wurde, und die Orientierungszeile
            darüber nennt das Thema beim Namen. Die drei Wiederholungen kosteten
            zusammen 60 px und schoben die Hauptaktion nach unten. */""}
      <div class="topic-intro-line">
        <span class="topic-intro-symbol" aria-hidden="true">${getIconHtml(topic.icon || "start")}</span>
        <h2>${escapeHtml(topic.title)}</h2>
      </div>

      ${(() => {
        /* Adaptive Hauptaktion (Program Control mit Opt-out):
           1) Offene Lektion hier -> Weiter lernen
           2) Thema geschafft     -> Quiz wiederholen (Retrieval Practice)
           3) Neu                 -> Lernen starten + Mengen-Wahl */
        const done = isTopicDone(topic.id);
        const resume = (lastLessonContext && lastLessonContext.topicId === topic.id) ? lastLessonContext : null;
        const amount = getTopicAmount(topic.id);
        const hasQuiz = getQuizQuestions(topic).length > 0;
        const laterChip = (label, click) => `<button type="button" class="later-chip" onclick="${click}">${label}</button>`;
        const training = (topic.id === "betrug" || topic.id === "fakes")
          ? laterChip("Trainings-Postfach", "startTrainingInbox()") : "";
        /* Uebungs-Handy: jedes Thema hat ein eigenes Szenario (szenarien-de.js). */
        const uebung = hasScenario(topic.id)
          ? laterChip("Übungs-Handy", `startScenario('${escapeHtml(topic.id)}')`) : "";
        const merkChip = laterChip("Merk-Karte ansehen", `renderMemoryCard('${escapeHtml(topic.id)}')`);

        /* Mengen-Wahl beziffern (Prüfbericht B8): „Kurz" und „Mehr" allein
           sagen nicht, worauf man sich einlässt – Kurz ist rund ein Viertel
           des Themas. Die Zahlen kommen aus dem echten Bestand, nicht fest
           eingetragen. */
        const stepWord = (n) => n === 1 ? "1 Schritt" : `${n} Schritte`;
        const shortSteps = stepWord(getLessonsForMode(topic, "short").length);
        const fullSteps  = stepWord(getLessonsForMode(topic, "full").length);
        const amountToggle = `
          <div class="amount-box" role="group" aria-label="Wie viel möchtest du lernen?">
            <p class="amount-title">Wie viel möchtest du?</p>
            <div class="amount-row">
              <button type="button" class="amount-choice${amount === "short" ? " is-active" : ""}" aria-pressed="${amount === "short" ? "true" : "false"}" onclick="setTopicAmount('${escapeHtml(topic.id)}', 'short')"><strong>${amount === "short" ? "✓ " : ""}Kurz — ${shortSteps}</strong><span>Nur das Wichtigste.</span></button>
              <button type="button" class="amount-choice${amount === "full" ? " is-active" : ""}" aria-pressed="${amount === "full" ? "true" : "false"}" onclick="setTopicAmount('${escapeHtml(topic.id)}', 'full')"><strong>${amount === "full" ? "✓ " : ""}Mehr — ${fullSteps}</strong><span>Mit Beispielen.</span></button>
            </div>
            <p class="amount-hint">${hasOwnTopicAmount(topic.id)
              ? "Das hast du dir so ausgesucht. Du kannst es ändern."
              : "Für dich vorausgewählt. Du kannst es ändern."}</p>
          </div>`;

        if (resume) {
          return `
            <button type="button" class="topic-start-button" onclick="resumeLastLesson()">Weiter lernen: Schritt ${resume.step + 1}</button>
            <p class="later-title">Oder:</p>
            <div class="later-row">
              ${laterChip("Von vorne anfangen", `startTopicMode('${escapeHtml(topic.id)}', '${amount}')`)}
              ${hasQuiz ? laterChip("Quiz machen", `startQuiz('${escapeHtml(topic.id)}')`) : ""}
              ${merkChip}${uebung}${training}
            </div>`;
        }
        if (done) {
          return `
            <p class="done-note">✓ Du hast dieses Thema geschafft. Wiederholen festigt dein Wissen.</p>
            ${hasQuiz ? `<button type="button" class="topic-start-button" onclick="startQuiz('${escapeHtml(topic.id)}')">Quiz wiederholen</button>` : ""}
            <p class="later-title">Oder:</p>
            <div class="later-row">
              ${laterChip("Nochmal lernen", `startTopicMode('${escapeHtml(topic.id)}', '${amount}')`)}
              ${merkChip}${uebung}${training}
            </div>`;
        }
        return `
          <button type="button" class="topic-start-button" onclick="startTopicMode('${escapeHtml(topic.id)}', '${amount}')">Lernen starten</button>
          ${amountToggle}
          <p class="later-title">Für später:</p>
          <div class="later-row">
            ${hasQuiz ? laterChip("Quiz machen", `startQuiz('${escapeHtml(topic.id)}')`) : ""}
            ${merkChip}${uebung}${training}
          </div>`;
      })()}

      ${/* Begleit-Panel direkt hinter die Hauptaktion (B21): vorher lag es bei
            y=1364 unter allem anderen, eine Fachkraft musste dreimal scrollen.
            ÜBER die Hauptaktion darf es nicht – §7: Begleit-Hinweise dürfen den
            SOLO-Gebrauch nicht stören. */""}
      ${buildCompanionPanel(topic)}

      ${buildUtilityBar()}

      ${buildSupportBox()}

      <button type="button" class="plain-back-button plain-back-button--end" onclick="renderMenu()">← Zur Themenübersicht</button>
    </section>
  `;
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Hilfe-Bereiche
   ============================================================ */

function buildSupportBox() {
  return `
    <div class="support-help-area">
      <button type="button" class="support-help-button" onclick="toggleSupportHelp()" aria-expanded="false" aria-controls="supportHelpPanel">
        <span class="support-help-icon" aria-hidden="true">${getIconHtml("help")}</span>
        <span class="support-help-text">
          <span class="support-help-title">Du brauchst Unterstützung?</span>
          <span class="support-help-desc">Hilfe anzeigen.</span>
        </span>
      </button>

      <div id="supportHelpPanel" class="support-help-panel" hidden>
        <h3>Du kannst Hilfe holen.</h3>
        ${roleFigure("hilfe")}
        <div class="support-help-grid">
          <div class="support-help-card">
            <h4>Wenn du die Seite nicht bedienen kannst ${sectionReadChip("Wenn du die Seite nicht bedienen kannst")}</h4>
            <ul>
              <li>Zeige auf die Stelle.</li>
              <li>Sage: Ich brauche Hilfe bei der Bedienung.</li>
              <li>Bitte um langsames Erklären.</li>
            </ul>
          </div>
          <div class="support-help-card">
            <h4>Wenn du eine Frage nicht verstehst ${sectionReadChip("Wenn du eine Frage nicht verstehst")}</h4>
            <ul>
              <li>Lies die Frage noch einmal.</li>
              <li>Bitte eine Person um Erklärung.</li>
              <li>Sage: Bitte erkläre mir das einfacher.</li>
            </ul>
          </div>
          <div class="support-help-card">
            <h4>Wen kannst du fragen? ${sectionReadChip("Wen kannst du fragen?")}</h4>
            <ul>
              <li>Eine Person, der du vertraust.</li>
              <li>Eine Person, die dich unterstützt.</li>
              <li>Eine Digital-Begleiterin oder einen Digital-Begleiter.</li>
              <li>Jemanden im Wohnbereich oder Dienst.</li>
            </ul>
          </div>
        </div>
        <p class="support-help-remember">Du musst das nicht allein schaffen.</p>
        <button type="button" class="support-help-close" onclick="closeSupportHelp()">Hilfe ausblenden</button>
      </div>
    </div>
  `;
}

function toggleSupportHelp() {
  const panel = document.getElementById("supportHelpPanel");
  const button = document.querySelector(".support-help-button");
  const desc = document.querySelector(".support-help-desc");
  if (!panel) return;
  const show = panel.hasAttribute("hidden");
  if (show) {
    panel.removeAttribute("hidden");
    if (button) button.setAttribute("aria-expanded", "true");
    if (desc) desc.textContent = "Hilfe wieder ausblenden.";
  } else {
    closeSupportHelp();
  }
}

function closeSupportHelp() {
  const panel = document.getElementById("supportHelpPanel");
  const button = document.querySelector(".support-help-button");
  const desc = document.querySelector(".support-help-desc");
  if (panel) panel.setAttribute("hidden", "");
  if (button) button.setAttribute("aria-expanded", "false");
  if (desc) desc.textContent = "Hilfe anzeigen.";
}

/* Rückmeldung zur GEWÄHLTEN falschen Antwort (Prüfbericht B4).
   Solange es nur zwei Antworten gab, reichte ein einziger Falsch-Text: es gab
   ja nur einen Weg, danebenzuliegen. Mit einer dritten Möglichkeit gibt es
   zwei verschiedene Denkfehler – und der eine wird anders erklärt als der
   andere. `feedbackWrong` darf deshalb jetzt auch eine Liste sein, mit einem
   Eintrag je Antwort-Position (null an der Stelle der richtigen Antwort).
   Ein einzelner Text funktioniert unverändert weiter. */
function falschFeedback(frage, index) {
  const f = frage && frage.feedbackWrong;
  if (Array.isArray(f)) {
    const eigen = f[index];
    if (typeof eigen === "string" && eigen.trim()) return eigen.trim();
    const ersatz = f.find(x => typeof x === "string" && x.trim());
    return ersatz ? ersatz.trim() : "";
  }
  return (typeof f === "string" && f.trim()) ? f.trim() : "";
}

/* Hilfe zur Aufgabe in zwei Stufen (Prüfbericht B14).
   Vorher bekamen alle Fragen der Plattform denselben Text: fünf allgemeine
   Ratschläge. Beim dritten Mal ist das Rauschen, und wer inhaltlich nicht
   weiterkommt, bekommt eine Strategie statt einer Erklärung.

   Stufe 1 ist jetzt inhaltlich und führt zum Nachdenken, ohne die Antwort zu
   nennen – aus dem Feld `hinweis` der Frage, sonst je nach Ort ein Zeiger auf
   die Stelle, an der die Antwort steht.
   Stufe 2 bleibt die allgemeine Liste. Der Satz „Überlege: Welche Antwort
   schützt dich besser?" ist raus: Bei zwei Antworten verrät er fast immer
   die Lösung. */
function taskHint(frage, ort) {
  if (frage && typeof frage.hinweis === "string" && frage.hinweis.trim()) return frage.hinweis.trim();
  if (ort === "lektion") return "Die Antwort steht oben in diesem Schritt. Lies den Text noch einmal.";
  if (ort === "rueckmeldung") return "Du kannst die Lektion noch einmal lesen. Der Knopf dafür steht oben.";
  return "";
}

/* `vorneDran` = der Kasten steht VOR den Antworten (V-5). Hilfe gehoert vor
   die Entscheidung, nicht dahinter – wer unsicher ist, musste den Knopf
   vorher unter allen Antworten suchen. Die Klasse nimmt nur den oberen
   Abstand weg, damit die Antworten nicht zusaetzlich nach unten rutschen. */
function buildTaskHelpBox(hinweis, vorneDran) {
  const stufe1 = (typeof hinweis === "string" && hinweis.trim())
    ? `<p class="task-help-tip"><span class="task-help-tip-label">Tipp:</span> ${escapeHtml(hinweis.trim())}</p>`
    : "";
  return `
    <div class="task-help-area${vorneDran ? " task-help-area--vorne" : ""}">
      <button type="button" class="task-help-button" onclick="toggleTaskHelp()" aria-expanded="false" aria-controls="taskHelpPanel">
        Ich bin unsicher
      </button>
      <div id="taskHelpPanel" class="task-help-panel" hidden>
        <h3>Du bist unsicher?</h3>
        <p>Du musst nicht raten.</p>
        ${stufe1}
        <ul>
          <li>Lies die Frage noch einmal langsam.</li>
          <li>Schau dir alle Antworten an.</li>
          <li>Du kannst eine Pause machen.</li>
          <li>Du kannst eine Person fragen, der du vertraust.</li>
        </ul>
      </div>
    </div>
  `;
}

function toggleTaskHelp() {
  const panel = document.getElementById("taskHelpPanel");
  const button = document.querySelector(".task-help-button");
  if (!panel || !button) return;
  const show = panel.hasAttribute("hidden");
  if (show) {
    panel.removeAttribute("hidden");
    button.setAttribute("aria-expanded", "true");
    button.textContent = "Hilfe ausblenden";
  } else {
    panel.setAttribute("hidden", "");
    button.setAttribute("aria-expanded", "false");
    button.textContent = "Ich bin unsicher";
  }
}

/* ============================================================
   Lektionen
   ============================================================ */

function getLessonsForMode(topic, mode) {
  if (!topic || !Array.isArray(topic.lessons)) return [];
  if (mode === "short") {
    if (Array.isArray(topic.einfachLessons) && topic.einfachLessons.length) {
      /* Der Kurz-Modus bekommt denselben Rahmen wie der lange Weg
         (Prüfbericht B8): vorne die Start-Seite mit den Lernzielen, hinten die
         Zusammenfassung „Das merke ich mir". Vorher fing er ohne Ankündigung
         an und endete ohne Regel-Liste – ausgerechnet der Weg für Personen mit
         kürzerer Aufmerksamkeitsspanne verzichtete auf die zwei Stützen, die
         kurze Wege am nötigsten brauchen.
         Es entsteht KEIN neuer Inhalt: beide Seiten liegen schon in
         topic.lessons und werden hier nur wiederverwendet. */
      const start = topic.lessons[0];
      const ende  = topic.lessons[topic.lessons.length - 1];
      const rahmen = [];
      if (start && start.module === "Start") rahmen.push(start);
      rahmen.push(...topic.einfachLessons);
      if (ende && ende !== start && /merke ich mir/i.test(ende.title || "")) rahmen.push(ende);
      return rahmen;
    }
    /* Rueckfallebene fuer Themen OHNE einfachLessons. Aktuell haben alle 12
       welche, das Feld shortLessonIndexes wurde deshalb aus topics.js
       entfernt. Der Zweig bleibt, damit ein spaeteres Thema ohne eigene
       Kurzfassung nicht ins Leere laeuft. */
    if (Array.isArray(topic.shortLessonIndexes)) {
      return topic.shortLessonIndexes.map(index => topic.lessons[index]).filter(Boolean);
    }
  }
  return topic.lessons;
}

function startTopicMode(topicId, mode) {
  const topic = getTopicById(topicId);
  if (!topic) return renderMenu();
  rememberTopicAmount(topic.id, mode);
  currentTopicId = topic.id;
  currentMode = mode === "short" ? "short" : "full";
  currentStep = 0;
  if (topic.selfAssessment) {
    renderSelfAssessment();
  } else {
    renderLesson();
  }
}

function renderSelfAssessment() {
  stopReading();
  const topic = getCurrentTopic();
  if (!topic || !topic.selfAssessment) return renderLesson();

  const sa = resolveSelfAssessment(topic, languageLevel);
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader(topic.title, "", "", "Start", 0);
  setOrientation(`Du startest das Thema: ${topic.title}. Zuerst kommt eine Frage an dich.`);

  const optionButtons = sa.options.map((opt, i) =>
    `<button class="sa-option-btn" data-index="${i}" type="button">${answerNumBadge(i)}<span class="answer-text">${escapeHtml(answerText(opt))}</span></button>`
  ).join("");

  content.innerHTML = `
    ${buildReadingToolbar()}
    <article class="card sa-card" data-readable="true" style="${getTopicColorStyle(topic.id)}">
      <div class="symbol-heading">
        <span class="access-box-symbol" aria-hidden="true">${getIconHtml(topic.icon || "start")}</span>
        <h2>${escapeHtml(topic.title)}</h2>
      </div>
      <p class="sa-intro">Bevor wir starten:</p>
      ${questionPikto(sa)}<p class="sa-question">${escapeHtml(sa.question)}</p>
      ${roleFigure("nachdenken")}
      <div class="sa-options" role="group" aria-label="Einschätzung wählen">
        ${optionButtons}
      </div>
      <p class="sa-hint">Es gibt keine falsche Antwort. Wähle einfach, was für dich stimmt.</p>
    </article>
  `;

  content.querySelectorAll(".sa-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      /* Antwort merken – die Abschluss-Seite zeigt damit den eigenen Zuwachs.
         Vorher wurde die Wahl verworfen. */
      selfAssessmentStart[topic.id] = Number(btn.dataset.index);
      renderLesson();
    });
  });

  focusContent();
  renderLegalFooter();
}

/* Fortschritt als schlanker Balken plus Erfolgs-Satz.
   Früher standen hier bis zu 13 nummerierte Kreise nebeneinander (20–26 px,
   sahen antippbar aus, waren es nicht) und haben den Kopf optisch zerhackt.
   Der Satz "X geschafft · noch Y Schritte" bleibt: er trägt die Erfolgs-
   Rückmeldung (§3 Engagement) und wird – anders als die Kreise – vorgelesen.
   "Schritt X von Y" steht bereits im Orientierungssatz darüber. */
/* ------------------------------------------------------------
   Einheitlicher Fortschritts-Baustein (Paket V, §4.5/§2.2)

   buildProgress(done, total) ersetzt schrittweise die drei
   Fortschritts-Bauarten (Schritt-Balken, Abschluss-Balken,
   Quiz-Balken) durch EIN Muster: Balken plus Stand-Satz in Worten.
   Wortlaut, Zahlen und aria-Werte entsprechen exakt dem bisherigen
   Schritt-Balken (bis V3 buildStepPath, in V4 entfernt) –
   wiederverwendet werden dessen CSS-Klassen (.step-bar-*), sodass
   kein neues Balken-CSS nötig ist. Reine Funktion, kein DOM-Eingriff;
   total < 2 ergibt "" (ein einzelner Schritt braucht keinen Balken).
   ------------------------------------------------------------ */
function buildProgress(done, total, opts) {
  /* Abschluss-Variante (Paket V3): „X von 12 Themen" für die
     Abschluss-Seite – GrandFinish, Themen-Balken und Speicher-Angebot.
     Exakt das bisherige buildCompletionProgress-Muster, nur mit
     übergebenen Zahlen statt fest verdrahteten. */
  /* Fortschritts-Rückmeldung direkt nach dem Erfolg (Bandura: unmittelbares
     Erfolgserlebnis). Bietet – falls noch nicht aktiv – das freiwillige
     Merken des Lernstands genau in dem Moment an, in dem es Sinn ergibt. */
  if (opts && opts.complete) {
    const saveOffer = !isProgressEnabled() ? `
    <div class="progress-consent">
      <p class="progress-consent-title">Soll ich mir merken, welche Themen du geschafft hast?</p>
      <p class="progress-consent-note">Das wird nur auf diesem Gerät gespeichert. Ohne Namen. Du kannst es jederzeit löschen.</p>
      <button type="button" class="utility-button" onclick="enableProgressInline(this)">Ja, Lernstand merken</button>
    </div>` : "";
    return `
    ${buildGrandFinish()}
    <div class="hero-progress-row" role="region" aria-label="Dein Lernfortschritt">
      <div class="hero-progress-numbers">
        <span class="hero-progress-count">${done}</span>
        <span class="hero-progress-of">von ${total} Themen geschafft</span>
      </div>
      <div class="hero-progress-track" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${total}" aria-label="${done} von ${total} Themen">
        <div class="hero-progress-fill" style="width:${Math.round((done / total) * 100)}%"></div>
      </div>
    </div>
    ${saveOffer}`;
  }
  if (!total || total < 2) return "";
  const currentIndex = Math.max(0, Math.min(total - 1, done));
  const remaining = total - currentIndex - 1;
  const percent = Math.round(((currentIndex + 1) / total) * 100);
  const summary = remaining > 0
    ? `<span class="step-done-count">${currentIndex} geschafft</span> · noch ${remaining} ${remaining === 1 ? "Schritt" : "Schritte"}`
    : `<span class="step-done-count">${currentIndex} geschafft</span> · letzter Schritt`;
  return `
    <div class="step-bar-wrap">
      <div class="step-bar" role="progressbar" aria-label="Dein Fortschritt in diesem Thema"
           aria-valuemin="0" aria-valuemax="100"
           aria-valuenow="${percent}" aria-valuetext="Schritt ${currentIndex + 1} von ${total}">
        <div class="step-bar-fill" style="width:${percent}%"></div>
      </div>
      <p class="step-path-summary">${summary}</p>
    </div>`;
}

/* ------------------------------------------------------------
   Wegweiser (Paket V, §2.2): Ort-Satz und Fortschritt in EINER Karte.

   buildWegweiser(text, { index, total }) gibt die sichtbare Karte
   zurück: oben der Ort-Satz mit Themen-Symbol, darunter
   buildProgress. Der Aufrufer ruft setOrientation(text) wie bisher auf –
   #orientLine bleibt dadurch Live-Region, Farbfaden-Quelle und erstes
   Vorlese-Element (kein Doppel-Aufruf, keine Doppel-Meldung).

   Barrierefreiheit: Für Screenreader steht der Satz EINMAL im Zugriff
   (die sichtbare Kopie trägt aria-hidden, #orientLine bleibt die
   Quelle). Ein eigener Hör-Knopf existiert seit Paket H nicht mehr:
   Die Vorlese-Pille liest den Ort-Satz zuerst.
   ------------------------------------------------------------ */
function buildWegweiser(text, opts) {
  const o = opts || {};
  let iconHtml = "";
  if (typeof currentTopicId !== "undefined" && currentTopicId) {
    const topic = getTopicById(currentTopicId);
    if (topic && topic.icon) iconHtml = `<span class="orient-icon" aria-hidden="true">${getIconHtml(topic.icon)}</span>`;
  }
  const progressHtml = (typeof o.index === "number" && o.total) ? buildProgress(o.index, o.total) : "";
  return `
    <div class="wegweiser">
      <div class="wegweiser-ort">${iconHtml}<span class="wegweiser-ort-text" aria-hidden="true">${escapeHtml(text)}</span></div>
      ${progressHtml}
    </div>`;
}

/* ============================================================
   Merksatz-Baustein (Lerndesign-Vorschlag, Stufe 1)
   Additiv: hebt den Vorlese-Knopf aus renderLesson() unverändert nach
   global (er nutzt dort nur seinen eigenen Parameter und escapeHtml,
   siehe Prüfung in docs/lerndesign-vorschlag.md), damit buildRememberBox()
   ihn mitnutzen kann. renderLesson() nutzt seit Paket V4 dieselbe
   gemeinsame Funktion (Zusammenführung, lokale Kopie entfernt).
   ============================================================ */
function blockRead(t) {
  return t
    ? `<span class="card-read-button card-read-button--block" role="button" tabindex="0" data-read-card-text="${escapeHtml(t)}" aria-label="Diesen Teil vorlesen"><svg class="rb-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L9 9H4z" fill="currentColor"/><path d="M16 8.6a4 4 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.6 6.2a7 7 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>`
    : "";
}

/* Der handkopierte Merksatz-Kasten als ein Baustein.
   Markup, Klassen und Vorlese-Text sind Zeichen für Zeichen wie in renderLesson.

   WOFÜR DIESER BAUSTEIN DA IST — und wofür nicht:
   Er ist der Kasten für den MERKSATZ (Merken: ein Satz, den die Person
   mitnehmen soll). Er ist ausdrücklich NICHT gedacht für:
   - TRANSFER / Handeln ("Eine Sache für heute", topic.transfer in
     renderCompletionPage). Das ist ein anderes didaktisches Element (§12:
     Transfer-Schritt), auch wenn es heute dieselben CSS-Klassen benutzt.
     Wer das zusammenlegt, verliert die Unterscheidung.
   - LISTEN ("Das nimmst du mit" in renderScenarioResult, <ul> statt <p>).
     Dieser Baustein kennt nur einen Fließtext.
   - Ergebnis-Kästen mit wechselndem, aus dem Zustand berechnetem Titel
     ("Dein Postfach kann noch wachsen", "Noch eine Runde?" …). Das sind
     Rückmeldungen zum Spielstand, keine Merksätze.

   opts.vorlesen (Standard true): steuert den Block-Vorlese-Knopf.
   Seit Stufe 4b (September 2026) haben ALLE Merksatz-Kästen den Knopf.
   Die Option bleibt für künftige Ausnahmen erhalten. */
function buildRememberBox(titel, text, opts) {
  opts = opts || {};
  const vorlesen = opts.vorlesen !== false;
  return text
    ? `<div class="access-box remember remember-box"><h3>${escapeHtml(titel)}</h3><p class="remember-text">${escapeHtml(text)}</p>${vorlesen ? blockRead(titel + ". " + text) : ""}</div>`
    : "";
}

/* Stations-Etikett (Faden Merken → Prüfen → Handeln,
   docs/gesamtlernprinzip-stationen.md §1). Bewusst klein: ein Wort und ein
   Bild-Zeichen, kein Satz, keine Erklärung. Nur Etikett — die Erklärung
   steht auf der Startseite („So lernst du."). §18.8: prüfen lassen. */
function stationBadge(key) {
  const map = {
    merken:  { icon: "🧠", wort: "Merken" },
    pruefen: { icon: "✅", wort: "Prüfen" },
    handeln: { icon: "➜", wort: "Handeln" }
  };
  const e = map[key];
  return e ? `<span class="station-badge"><span aria-hidden="true">${e.icon}</span>${e.wort}</span>` : "";
}

function renderLesson() {
  stopReading();
  const topic = getCurrentTopic();
  if (!topic) return renderMenu();

  const lessons = getLessonsForMode(topic, currentMode);
  if (!lessons.length) return renderTopicChoice(topic.id);

  currentStep = Math.max(0, Math.min(currentStep, lessons.length - 1));

  const lesson = resolveLessonContent(lessons[currentStep], languageLevel);
  const percent = Math.round(((currentStep + 1) / lessons.length) * 100);
  const modeLabel = currentMode === "short" ? "Kurz lernen" : "Mehr lernen";
  const hasPractice = Boolean(lesson.practice);

  /* Modul-Cluster-Badge: zeigen wenn neues Modul beginnt (nicht bei Schritt 0/Start) */
  const prevLesson = currentStep > 0 ? lessons[currentStep - 1] : null;
  /* Im Kurz-Modus kein Modul-Abzeichen: dort gibt es nur einen Inhaltsblock,
     das Abzeichen würde bei jedem Rahmen-Wechsel sinnlos aufblitzen. */
  const isNewModule = currentMode !== "short" && prevLesson && lesson.module
    && lesson.module !== "Start" && prevLesson.module !== lesson.module;
  const moduleBadge = isNewModule
    ? `<div class="module-cluster-badge" role="status" aria-live="polite">
         <span class="module-cluster-label">Jetzt geht es um:</span>
         <span class="module-cluster-name">${escapeHtml(lesson.module)}</span>
       </div>`
    : "";

  /* Die .progress-area bleibt aus: sie ist eine eigene Karte mit Meta-Zeile und
     kostet 77 px – mehr als die Punkte-Reihe, die sie ersetzen sollte. Der
     schlanke Balken steckt stattdessen im Wegweiser (buildProgress, rund 44 px). */
  setProgressVisible(false);
  /* Die untere Leiste bleibt auf JEDEM Lernschritt stehen (Prüfbericht B2).
     Vorher wurde sie bei Lektionen mit Übung ausgeblendet – damit war sie auf
     11 von 13 Schritten weg und Zurückblättern unmöglich. Jetzt bleibt die
     Position der Knöpfe konstant; „Weiter" ist bei offener Übung nur
     deaktiviert (COGA: vorhersehbare Bedienung, WCAG 3.2.3). */
  setBottomNavVisible(true);
  setHeader(topic.title, modeLabel, `Schritt ${currentStep + 1} von ${lessons.length}`, lesson.module || "Lernen", percent);
  setOrientation(`Du lernst: ${topic.title}. Das ist Schritt ${currentStep + 1} von ${lessons.length}.`);
  /* Auf Lernschritten sitzen Titelkarte und Orientierungssatz direkt
     aufeinander (siehe body.lesson-view in styles.css). Beide bleiben
     vollständig erhalten – sie werden nur zu einem Block zusammengezogen
     statt zwei Karten mit Abstand dazwischen. setHeader() nimmt die Klasse
     auf jeder anderen Seite wieder weg. */
  document.body.classList.add("lesson-view");
  lastLessonContext = { topicId: topic.id, step: currentStep, mode: currentMode };
  saveLastLesson();
  showNav(true, !hasPractice, currentStep === lessons.length - 1 ? "Fertig" : "Weiter");

  const plain = (arr) => Array.isArray(arr)
    ? arr.map(i => (typeof i === "object" && i.text) ? i.text : i).join(" ")
    : "";

  /* Text-Sätze — unterstützt Strings und {text, pictogram}-Objekte */
  const textRows = Array.isArray(lesson.text)
    ? lesson.text.map(item => {
        if (typeof item === "object" && item.text) {
          const img = item.pictogram
            ? `<img class="ls-sentence-pikto" src="${pictoSrc(refinePicto(item.pictogram, item.text))}" alt="" width="56" height="56" aria-hidden="true" loading="lazy">`
            : "";
          return `<div class="ls-text-row">${img}<p>${escapeHtml(item.text)}</p></div>`;
        }
        return `<p>${escapeHtml(item)}</p>`;
      }).join("")
    : "";
  const text = textRows
    ? `<div class="ls-text-block">${textRows}${blockRead(plain(lesson.text))}</div>`
    : "";

  /* Bullet-Punkte — unterstützt Strings und {text, pictogram}-Objekte */
  const bullets = Array.isArray(lesson.bullets) && lesson.bullets.length
    ? `<div class="ls-bullet-block"><ul class="ls-bullet-list">${lesson.bullets.map(item => {
        if (typeof item === "object" && item.text) {
          const img = item.pictogram
            ? `<img class="ls-bullet-pikto" src="${pictoSrc(refinePicto(item.pictogram, item.text))}" alt="" width="40" height="40" aria-hidden="true" loading="lazy">`
            : "";
          return `<li class="ls-bullet-item">${img}<span>${escapeHtml(item.text)}</span></li>`;
        }
        return `<li>${escapeHtml(item)}</li>`;
      }).join("")}</ul>${blockRead(plain(lesson.bullets))}</div>`
    : "";

  const examples = Array.isArray(lesson.examples) && lesson.examples.length
    ? `<div class="access-box example"><h3>Beispiele aus dem Alltag</h3><ul>${lesson.examples.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>${blockRead("Beispiele aus dem Alltag. " + plain(lesson.examples))}</div>`
    : "";

  const warning = lesson.warning
    ? `<div class="access-box warning"><h3>Achtung</h3><p>${escapeHtml(lesson.warning)}</p>${blockRead("Achtung. " + lesson.warning)}</div>`
    : "";

  const success = lesson.success
    ? `<div class="access-box success"><h3>Gut</h3><p>${escapeHtml(lesson.success)}</p>${blockRead("Gut. " + lesson.success)}</div>`
    : "";

  /* Stufe 2 (Lerndesign-Vorschlag): nutzt jetzt den gemeinsamen Baustein
     buildRememberBox() statt eigenem Markup. Titel und Text unverändert
     "Wichtig" / lesson.remember - reine Umstellung, kein neuer Text. */
  const remember = buildRememberBox("Wichtig", lesson.remember);

  const practice = hasPractice ? buildPractice(lesson.practice) : "";

  /* Großes Lektions-Piktogramm nur auf der Start-Lektion (Themeneinstieg).
     Alle weiteren Lektionen haben Piktogramme direkt bei jedem Satz/Bullet —
     ein zusätzliches Banner-Bild wäre dort Wiederholung. */
  const isEinfachLesson = simpleMode;
  const isStartLesson_pikto = lesson.module === "Start";
  const pictogram = isStartLesson_pikto && lesson.pictogram && languageLevel !== "standard"
    ? `<div class="einfach-pictogram" aria-hidden="true">
         <img src="${pictoSrc(lesson.pictogram)}" alt="" width="100" height="100" loading="eager">
       </div>`
    : "";

  /* Lernziele und Fehler-Normalisierung nur im Start-Screen */
  const isStartLesson = lesson.module === "Start";

  const learningGoals = isStartLesson && Array.isArray(topic.learningGoals) && topic.learningGoals.length
    ? `<div class="learning-goals-box">
         <h3>Was du hier lernst:</h3>
         <ul class="learning-goals-list">
           ${topic.learningGoals.map(g => `<li>${escapeHtml(g)}</li>`).join("")}
         </ul>
       </div>`
    : "";

  const safeNotice = isStartLesson
    ? `<div class="start-safe-notice" role="note">
         <p class="start-safe-icon" aria-hidden="true">✓</p>
         <div>
           <p class="start-safe-main">Du darfst Fehler machen.</p>
           <p class="start-safe-sub">Das ist beim Lernen ganz normal.</p>
           <p class="start-safe-sub">Du kannst jeden Schritt so oft machen, wie du möchtest.</p>
         </div>
       </div>`
    : "";

  content.innerHTML = `
    ${buildToolRow()}
    ${buildWegweiser(`Du lernst: ${topic.title}. Das ist Schritt ${currentStep + 1} von ${lessons.length}.`, { index: currentStep, total: lessons.length })}
    ${moduleBadge}
    <article class="card lesson-card page-flip page-flip--${pageDirection}${isEinfachLesson ? " lesson-card--einfach" : ""}" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      ${pictogram}
      <div class="symbol-heading">
        <span class="access-box-symbol" aria-hidden="true">${getIconHtml(lesson.icon || topic.icon || "start")}</span>
        <h2>${escapeHtml(lesson.title || topic.title)}</h2>
      </div>
      ${getLessonImageHtml(lesson, topic)}
      ${text}
      ${learningGoals}
      ${safeNotice}
      ${bullets}
      ${examples}
      ${warning}
      ${success}
      ${stationBadge("merken")}
      ${remember}
      ${practice}
    </article>
  `;
  focusContent();
  renderLegalFooter();

  /* Richtung zurücksetzen: Standard ist vorwärts (z. B. beim Einstieg). */
  pageDirection = "forward";

  /* Auto-Vorlesen im Hör-Modus übernimmt zentral focusContent(). */
}

/* Antworten dürfen Strings sein ODER Objekte { text, pictogram }.
   Das Piktogramm ist opt-in (Anzeige nur wo redaktionell gepflegt);
   es zeigt die Bedeutung der Antwort – nie ihre Richtigkeit. */
function answerText(a) {
  return (a && typeof a === "object") ? String(a.text || "") : String(a ?? "");
}

function answerPikto(a) {
  if (!a || typeof a !== "object" || !a.pictogram) return "";
  return `<img class="answer-pikto" src="${pictoSrc(a.pictogram)}" alt="" aria-hidden="true" loading="lazy" onerror="this.remove()">`;
}

/* Nummern-Anker: dieselbe Zahl, die die Stimme spricht („Antwort 1") */
function answerNumBadge(i) {
  return `<span class="answer-num" aria-hidden="true">${i + 1}</span>`;
}

/* Frage-Piktogramm (opt-in): Kontext-Anker, verrät keine Lösung */
function questionPikto(q) {
  if (!q || !q.pictogram) return "";
  return `<img class="question-pikto" src="${pictoSrc(q.pictogram)}" alt="" aria-hidden="true" loading="lazy" onerror="this.remove()">`;
}

function buildPractice(practice) {
  const question = practice.question || "";
  const answers = Array.isArray(practice.answers) ? practice.answers : [];
  const correctIndex = Number(practice.correctIndex ?? 0);
  const answerHtml = answers.map((answer, index) => `
    <button type="button" class="answer-option" onclick="renderPracticeFeedbackPage(${index}, ${correctIndex})">
      ${answerNumBadge(index)}${answerPikto(answer)}<span class="answer-text">${escapeHtml(answerText(answer))}</span>
    </button>
  `).join("");

  return `
    <div class="practice-box">
      <h3>Übung</h3>
      ${questionPikto(practice)}<p class="practice-question">${escapeHtml(question)}</p>
      ${buildTaskHelpBox(taskHint(practice, "lektion"), true)}
      <div class="answers">${answerHtml}</div>
      <p class="practice-nav-hint">Tippe auf eine Antwort. Danach kannst du unten auf Weiter tippen.</p>
    </div>
  `;
}

function renderPracticeFeedbackPage(index, correctIndex) {
  stopReading();
  const topic = getCurrentTopic();
  const lessons = getLessonsForMode(topic, currentMode);
  const lesson = lessons[currentStep];
  const practice = lesson && lesson.practice ? lesson.practice : null;
  if (!topic || !lesson || !practice) return renderLesson();

  const answers = Array.isArray(practice.answers) ? practice.answers : [];
  const selectedText = answerText(answers[index]);
  const isCorrect = index === Number(correctIndex);
  playSound(isCorrect ? "correct" : "wrong");
  const explanation = isCorrect
    ? (practice.feedbackCorrect || "Das ist sicher. Du hast gut entschieden.")
    : (falschFeedback(practice, index) || "Das ist nicht sicher. Du kannst es noch einmal versuchen.");
  /* Deine Karte: angewendete Regel eintragen (nur bei richtiger Antwort). */
  const regelHinweis = isCorrect ? regelHinweisHtml(practice.remember, topic.id) : "";

  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader(topic.title, "Übung", "Rückmeldung", isCorrect ? "Richtig" : "Nochmal üben", 100);
  setOrientation(`Du übst: ${topic.title}.`);

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card feedback-page ${isCorrect ? "feedback-correct" : "feedback-wrong"}" data-readable="true">
      <h2>${isCorrect ? "Genau richtig!" : "Fast!"}</h2>

      <div class="feedback-selected">
        <h3>Deine Antwort:</h3>
        <p>${escapeHtml(selectedText)}</p>
      </div>

      <div class="feedback-explanation">
        <h3>Erklärung:</h3>
        <p>${escapeHtml(explanation)}</p>
      </div>

      ${/* Refaktorierung, die die remember-Prüfung in buildRememberBox kapselt:
            hier stand früher "isCorrect && practice.remember ? … : ''". Der Baustein
            liefert bei leerem Text von sich aus "", deshalb genügt hier isCorrect.
            Das ist keine reine Umstellung, sondern eine kleine Verbesserung — die
            Frage "gibt es überhaupt einen Merksatz?" gehört in den Baustein, nicht
            an jede Aufrufstelle. */""}
      ${stationBadge("merken")}
      ${isCorrect ? buildRememberBox("Wichtig", practice.remember) : ""}
      ${regelHinweis}

      <div class="feedback-actions">
        ${isCorrect
          ? `<button type="button" class="feedback-button primary" onclick="continueAfterPractice()">Weiter</button>`
          : `<button type="button" class="feedback-button secondary" onclick="renderPracticePage()">Frage nochmal versuchen</button>
             <button type="button" class="feedback-button ghost" onclick="renderLesson()">Lektion nochmal lesen</button>
             <button type="button" class="feedback-button quiet" onclick="continueAfterPractice()">Weiter — ich schaue es mir später nochmal an</button>`
        }
      </div>

      ${!isCorrect ? buildTaskHelpBox(taskHint(practice, "rueckmeldung")) : ""}
    </article>
  `;
  announce(isCorrect ? "Genau richtig!" : "Fast! Das war noch nicht ganz richtig.");
  focusContent();
  renderLegalFooter();
}

function renderPracticePage() {
  /* Springt direkt zur Übungsfrage der aktuellen Lektion zurück */
  const topic = getCurrentTopic();
  const lessons = getLessonsForMode(topic, currentMode);
  const lesson = lessons[currentStep];
  if (lesson && lesson.practice) {
    setProgressVisible(false);
    /* Gleiche Leiste wie auf dem Lernschritt (B2): sichtbar, „Weiter" aus. */
    setBottomNavVisible(true);
    const percent = Math.round(((currentStep + 1) / lessons.length) * 100);
    const modeLabel = currentMode === "short" ? "Kurz lernen" : "Mehr lernen";
    setHeader(topic.title, modeLabel, `Schritt ${currentStep + 1} von ${lessons.length}`, lesson.module || "Lernen", percent);
    setOrientation(`Du übst: ${topic.title}. Das ist Schritt ${currentStep + 1} von ${lessons.length}.`);
    showNav(true, false, currentStep === lessons.length - 1 ? "Fertig" : "Weiter");
    content.innerHTML = `
      ${buildToolRow()}
      <article class="card lesson-card" style="${getTopicColorStyle(topic.id)}" data-readable="true">
        <div class="symbol-heading">
          <span class="access-box-symbol" aria-hidden="true">${getIconHtml(lesson.icon || topic.icon || "start")}</span>
          <h2>${escapeHtml(lesson.title || topic.title)}</h2>
        </div>
        ${buildPractice(lesson.practice)}
      </article>
    `;
    focusContent();
    renderLegalFooter();
  } else {
    renderLesson();
  }
}

function continueAfterPractice() {
  const topic = getCurrentTopic();
  const lessons = getLessonsForMode(topic, currentMode);
  if (!topic || !lessons.length) return renderMenu();

  if (currentStep < lessons.length - 1) {
    currentStep += 1;
    renderLesson();
  } else {
    renderMiniCheck(topic.id);
  }
}

/* ============================================================
   Abschlussseite
   ============================================================ */

/* ------------------------------------------------------------
   Kurze Frage nach den Lektionen (vor der Abschluss-Seite)

   Nutzt topic.miniQuestion. Diese 12 Fragen waren in topics.js sauber
   ausformuliert (Frage, Antworten, correct, explanation), wurden aber
   nirgends angezeigt – reines totes Datenfeld bis August 2026.

   Warum hier: Abrufen direkt nach dem Lernen ist der staerkste Behaltens-
   Hebel (§3, Testing-Effekt). Eine einzelne leichte Frage gibt ausserdem
   ein Erfolgserlebnis, bevor die groessere Quiz-Runde angeboten wird.
   Ein Konzept pro Bildschirm (§3, CLT) – deshalb eine eigene Seite statt
   noch ein Block auf der ohnehin langen Abschluss-Seite.
   ------------------------------------------------------------ */
function renderMiniCheck(topicId) {
  const topic = getTopicById(topicId);
  if (!topic) return renderMenu();
  const mq = topic.miniQuestion;
  /* Kein Zwang: ohne Frage oder wenn schon beantwortet, direkt weiter. */
  if (!mq || !Array.isArray(mq.answers) || !mq.answers.length || miniCheckDone[topic.id]) {
    return renderCompletionPage(topic.id);
  }

  stopReading();
  currentTopicId = topic.id;
  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);
  setHeader(topic.title, "Kurze Frage", "Kurze Frage", "Fast fertig", 95);
  setOrientation(`Du bist fast fertig mit dem Thema: ${topic.title}. Jetzt kommt eine kurze Frage.`);

  const optionen = mq.answers.map((a, i) =>
    `<button type="button" class="answer-option mini-answer" data-index="${i}">${answerNumBadge(i)}<span class="answer-text">${escapeHtml(answerText(a))}</span></button>`
  ).join("");

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card sa-card" data-readable="true" style="${getTopicColorStyle(topic.id)}">
      <div class="symbol-heading">
        <span class="access-box-symbol" aria-hidden="true">${getIconHtml(topic.icon || "start")}</span>
        <h2>Eine kurze Frage</h2>
      </div>
      ${questionPikto(mq)}<p class="sa-question">${escapeHtml(mq.question)}</p>
      <div class="sa-options" role="group" aria-label="Antwort wählen">${optionen}</div>
      <p class="sa-hint">Das ist kein Test. Du darfst raten.</p>
      <div id="miniFeedback" class="mini-feedback is-hidden" role="status" aria-live="polite"></div>
    </article>
  `;

  content.querySelectorAll(".mini-answer").forEach(btn => {
    btn.addEventListener("click", () => {
      if (miniCheckDone[topic.id]) return;
      const gewaehlt = Number(btn.dataset.index);
      const richtig = gewaehlt === mq.correct;
      miniCheckDone[topic.id] = true;
      content.querySelectorAll(".mini-answer").forEach(b => {
        b.disabled = true;
        const i = Number(b.dataset.index);
        if (i === mq.correct) b.classList.add("answer-correct");
        else if (i === gewaehlt) b.classList.add("answer-wrong");
      });
      /* Nur bei richtig ein Ton – kein negatives Signal (§3, Došen). */
      if (richtig) playSound("correct");
      const box = document.getElementById("miniFeedback");
      if (box) {
        box.classList.remove("is-hidden");
        box.innerHTML = `
          <p class="mini-feedback-text"><strong>${richtig ? "Richtig." : "Schau mal:"}</strong> ${escapeHtml(mq.explanation || "")}</p>
          <button type="button" class="primary-action" onclick="renderCompletionPage('${escapeHtml(topic.id)}')">Weiter</button>`;
      }
    });
  });

  focusContent();
  renderLegalFooter();
}

/* Abschluss-Selbstcheck: dieselbe Skala wie die Einstiegsfrage.
   Vorher gab es 12 Fragen am Anfang und keine einzige am Ende – die
   lernende Person hat ihren eigenen Zuwachs nie gesehen. Der Vergleich
   bleibt in der Sitzung, es wird nichts gespeichert (§14).
   PRUEFGRUPPE: Wortlaut "Das war das Thema. Wie ist es jetzt?" testen (§13). */
/* Lernziele am Ende einlösen (Prüfbericht B13).
   Schritt 1 kündigt unter „Was du hier lernst:" drei Ziele an. Danach kamen
   sie nie wieder vor: die Abschluss-Seite zeigte nur die Merkregeln, in
   anderer Grammatik. Bei TikTok, Betrug, Hilfe und KI war am Ende kein
   einziges der angekündigten Ziele wiederzufinden.
   Hier steht dieselbe Liste noch einmal – Wort für Wort, mit Haken. Der Kreis
   „Das lernst du → Das hast du gelernt" schließt sich damit sichtbar. */
function buildGoalsDone(topic) {
  const ziele = Array.isArray(topic && topic.learningGoals) ? topic.learningGoals : [];
  if (!ziele.length) return "";
  return `
    <div class="learning-goals-box learning-goals-box--done">
      <h3>Das hast du gelernt:</h3>
      <ul class="learning-goals-list goals-done-list">
        ${ziele.map(z => `<li><span class="goal-check" aria-hidden="true">✓</span>${escapeHtml(z)}</li>`).join("")}
      </ul>
    </div>`;
}

function buildClosingSelfCheck(topic) {
  const sa = resolveSelfAssessment(topic, languageLevel);
  if (!sa || !Array.isArray(sa.options) || !sa.options.length) return "";
  const optionen = sa.options.map((opt, i) =>
    `<button type="button" class="sa-option-btn closing-sa" data-index="${i}">${answerNumBadge(i)}<span class="answer-text">${escapeHtml(answerText(opt))}</span></button>`
  ).join("");
  return `
    <div class="access-box closing-sa-box">
      <h3>Das war das Thema. Wie ist es jetzt?</h3>
      <div class="sa-options" role="group" aria-label="Einschätzung wählen">${optionen}</div>
      <p id="closingSaResult" class="closing-sa-result is-hidden" role="status" aria-live="polite"></p>
    </div>`;
}

function bindClosingSelfCheck(topic) {
  const sa = resolveSelfAssessment(topic, languageLevel);
  const knoepfe = content.querySelectorAll(".closing-sa");
  if (!knoepfe.length || !sa) return;
  knoepfe.forEach(btn => {
    btn.addEventListener("click", () => {
      const jetzt = Number(btn.dataset.index);
      knoepfe.forEach(b => { b.disabled = true; b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      const vorher = selfAssessmentStart[topic.id];
      const feld = document.getElementById("closingSaResult");
      if (!feld) return;
      let text;
      if (typeof vorher !== "number") {
        text = "Danke. Du kannst das Thema jederzeit wiederholen.";
      } else if (jetzt > vorher) {
        text = `Am Anfang: ${answerText(sa.options[vorher])}. Jetzt: ${answerText(sa.options[jetzt])}. Du hast dazugelernt.`;
      } else if (jetzt === vorher) {
        text = `Am Anfang und jetzt: ${answerText(sa.options[jetzt])}. Das ist in Ordnung. Du kannst das Thema noch einmal machen.`;
      } else {
        /* Kein Tadel. Ehrlichkeit anerkennen und einen Weg anbieten (§3, §4). */
        text = "Danke, dass du ehrlich bist. Beim Lernen merkt man oft erst, wie viel es gibt. Du kannst das Thema noch einmal machen.";
      }
      feld.textContent = text;
      feld.classList.remove("is-hidden");
      playSound("success");
    });
  });
}

/* Station 5 (P6): „Hilfe nochmal lesen" auf der Abschlussseite der drei
   sensiblen Themen (hilfe, betrug, ki). Öffnet die erste Lektion des
   Hilfe-Moduls („Hilfe" bei betrug/ki, „Unterstützung" bei hilfe) — der
   Index wird aus den Daten gesucht, nicht fest eingetragen. Mechanik wie
   die Themen-Seite (startTopicMode/resumeLastLesson): Ziel setzen, dann
   renderLesson(). Die Einstiegsfrage wird übersprungen — das Thema ist
   geschafft, die Person will nur nachlesen. */
function openTopicHelpLesson(topicId) {
  const topic = getTopicById(topicId);
  if (!topic || !Array.isArray(topic.lessons)) return renderMenu();
  const idx = topic.lessons.findIndex(l => l && (l.module === "Hilfe" || l.module === "Unterstützung"));
  rememberTopicAmount(topic.id, "full");
  currentTopicId = topic.id;
  currentMode = "full";
  currentStep = idx >= 0 ? idx : 0;
  renderLesson();
}

function renderCompletionPage(topicId) {
  stopReading();
  const topic = getTopicById(topicId);
  if (!topic) return renderMenu();

  markTopicDone(topic.id);
  finishedTopicThisSession = true;
  clearLastLesson(); /* Lektion fertig – kein Rück-Anker mehr nötig */
  playSound("success");

  /* Hauptaktion der Abschluss-Seite ist der nächste Schritt, nicht das Quiz
     (Prüfbericht B7). markTopicDone() lief schon, der Vorschlag überspringt
     dieses Thema also von selbst. Sind alle Themen geschafft, tritt der
     Lernweg an die Stelle des Vorschlags. */
  const nextTopic = getNextTopicSuggestion();
  const nextActionHtml = (extraClass = "") => nextTopic
    ? `<button type="button" class="primary-action${extraClass ? " " + extraClass : ""}" onclick="weiterNachThema('${escapeHtml(nextTopic.id)}')">Nächstes Thema: ${escapeHtml(nextTopic.title)}</button>`
    : `<button type="button" class="primary-action${extraClass ? " " + extraClass : ""}" onclick="weiterNachThema('')">Alle Themen geschafft — zu Mein Lernweg</button>`;
  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);

  /* ---- Einfach-Modus: eigene, wärmere Abschlussseite ---- */
  if (currentMode === "short") {
    setHeader(topic.title, "Kurz lernen", "Abschluss", "Du bist fertig", 100);
  setOrientation(`Geschafft! Du bist fertig mit dem Thema: ${topic.title}.`);
    content.innerHTML = `
      ${buildReadingToolbar()}
      <section class="completion-page einfach-completion" data-readable="true">
        <article class="card completion-card--einfach" style="${getTopicColorStyle(topic.id)}">

          <div class="einfach-done-star" aria-hidden="true">
            <img src="${pictoSrc('pikto-done')}" alt="" width="120" height="120">
          </div>

          <h2 class="einfach-done-title">Super gemacht!</h2>
          ${roleFigure("erfolg")}

          <p class="einfach-done-text">Du hast gelernt:</p>
          <p class="einfach-done-topic"><strong>${escapeHtml(topic.title)}</strong></p>

          <p class="einfach-done-praise">Das war toll.<br>Du hast gut aufgepasst.</p>

          ${buildGoalsDone(topic)}

          ${topic.transfer ? `
          ${stationBadge("handeln")}
          <div class="access-box remember remember-box">
            <h3>DEINE eine Sache für heute</h3>
            <p class="remember-text">${escapeHtml(topic.transfer)}</p>
          </div>` : ""}

          ${buildClosingSelfCheck(topic)}

          ${buildProgress(countDoneTopics(), topics.length, { complete: true })}

          <div class="einfach-done-actions">
            ${/* Hauptaktion des KURZEN Wegs ist der lange Weg zum selben Thema
                  (Prüfbericht B8). Der kurze Weg ist ein Einstieg, kein Ersatz –
                  und wer ihn gerade geschafft hat, ist genau jetzt bereit für
                  mehr. Das nächste Thema steht direkt darunter. */""}
            <button type="button" class="primary-action einfach-done-btn" onclick="startTopicMode('${escapeHtml(topic.id)}', 'full')">
              Mehr lernen: ${escapeHtml(topic.title)}
            </button>
            ${nextActionHtml("einfach-done-btn").replace("primary-action", "secondary-action")}
            ${getQuizQuestions(topic).length
              ? `<button type="button" class="action-chip" onclick="startEinfachQuiz('${escapeHtml(topic.id)}')">
                   Quiz machen
                 </button>`
              : ""}
            <div class="completion-links">
              <button type="button" class="link-action" onclick="startTopicMode('${escapeHtml(topic.id)}', 'short')">
                Nochmal von vorne
              </button>
              <button type="button" class="link-action" onclick="renderMyPath()">
                Mein Lernweg ansehen
              </button>
              <button type="button" class="link-action" onclick="renderMenu()">
                Zur Themenübersicht
              </button>
            </div>
          </div>

        </article>
      </section>
    `;
    bindClosingSelfCheck(topic);
    focusContent();
    renderLegalFooter();
    return;
  }

  /* ---- Normaler Modus ---- */
  setHeader(topic.title, "Fertig", "Abschluss", "Du bist fertig", 100);
  setOrientation(`Geschafft! Du bist fertig mit dem Thema: ${topic.title}.`);

  const rules = Array.isArray(topic.memoryRules) ? topic.memoryRules.slice(0, 5) : [];
  const rulesHtml = rules.map(rule => `<li>${escapeHtml(rule)}</li>`).join("");

  content.innerHTML = `
    ${buildReadingToolbar()}
    <section class="completion-page" data-readable="true">
      <article class="card completion-card" style="${getTopicColorStyle(topic.id)}">
        <div class="symbol-heading">
          <span class="access-box-symbol" aria-hidden="true">${getIconHtml("check")}</span>
          <h2>Du bist fertig.</h2>
        </div>

        <p>Du hast das Thema <strong>${escapeHtml(topic.title)}</strong> geschafft.</p>
        ${roleFigure("erfolg")}

        ${buildGoalsDone(topic)}

        <h3>Das hast du geübt:</h3>
        <ul>
          ${rulesHtml || "<li>Du hast wichtige Regeln wiederholt.</li>"}
        </ul>

        ${topic.transfer ? `
        ${stationBadge("handeln")}
        <div class="access-box remember remember-box">
          <h3>DEINE eine Sache für heute</h3>
          <p class="remember-text">${escapeHtml(topic.transfer)}</p>
        </div>` : ""}

        ${buildClosingSelfCheck(topic)}

        ${buildProgress(countDoneTopics(), topics.length, { complete: true })}

        <div class="completion-actions">
          ${nextActionHtml()}
          <p class="completion-more-title">Zu diesem Thema gibt es außerdem:</p>
          <div class="action-chip-row">
            <button type="button" class="action-chip" onclick="startQuiz('${escapeHtml(topic.id)}')">Quiz machen</button>
            <button type="button" class="action-chip" onclick="renderMemoryCard('${escapeHtml(topic.id)}')">Merk-Karte ansehen</button>
            ${["hilfe", "betrug", "ki"].includes(topic.id) ? `<button type="button" class="action-chip" onclick="openTopicHelpLesson('${escapeHtml(topic.id)}')">Hilfe nochmal lesen</button>` : ""}
          </div>
          <div class="completion-links">
            <button type="button" class="link-action" onclick="renderCertificate('${escapeHtml(topic.id)}')">Urkunde ansehen</button>
            <button type="button" class="link-action" onclick="renderMyPath()">Mein Lernweg ansehen</button>
            <button type="button" class="link-action" onclick="renderMenu()">Zur Themenübersicht</button>
          </div>
        </div>
      </article>
    </section>
  `;
  bindClosingSelfCheck(topic);
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Quiz
   ============================================================ */

function startQuiz(topicId) {
  const topic = getTopicById(topicId);
  if (!topic) return renderMenu();
  currentTopicId = topic.id;
  currentQuizIndex = 0;
  quizScore = 0;
  quizAnsweredCorrect = new Set();
  renderQuizQuestion();
}

/* ============================================================
   Einfach-Quiz (2 Antwortoptionen, max. 3 Fragen)
   ============================================================ */

function startEinfachQuiz(topicId) {
  const topic = getTopicById(topicId);
  if (!topic) return renderMenu();
  currentTopicId = topic.id;
  currentQuizIndex = 0;
  quizScore = 0;
  quizAnsweredCorrect = new Set();
  renderEinfachQuizQuestion();
}

function getEinfachQuizQuestions(topic) {
  return getQuizQuestions(topic).slice(0, 3);
}

function renderEinfachQuizQuestion() {
  stopReading();
  const topic = getCurrentTopic();
  const questions = getEinfachQuizQuestions(topic);
  if (!topic || !questions.length) return renderCompletionPage(currentTopicId);
  if (currentQuizIndex >= questions.length) return renderEinfachQuizResult();

  const q = questions[currentQuizIndex];
  const answers = Array.isArray(q.answers) ? q.answers : [];
  const correctIndex = Number(q.correctIndex ?? 0);
  const correctText = answerText(answers[correctIndex]);

  /* Eine falsche Antwort zufällig wählen */
  const wrongPool = answers.filter((_, i) => i !== correctIndex);
  const wrongText = wrongPool[Math.floor(Math.random() * wrongPool.length)] || "Weiß ich nicht";

  /* Reihenfolge zufällig variieren */
  const correctFirst = Math.random() < 0.5;
  const opts = correctFirst
    ? [{ text: correctText, correct: true }, { text: wrongText, correct: false }]
    : [{ text: wrongText, correct: false }, { text: correctText, correct: true }];

  const percent = Math.round((currentQuizIndex / questions.length) * 100);
  setProgressVisible(true);
  setBottomNavVisible(false);
  setHeader(topic.title, "Einfach-Quiz", `Frage ${currentQuizIndex + 1} von ${questions.length}`, "Quiz", percent);
  setOrientation(`Du machst das Quiz: ${topic.title}. Frage ${currentQuizIndex + 1} von ${questions.length}.`);
  showNav(false, false);

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card einfach-quiz-card" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      <p class="einfach-quiz-number">Frage ${currentQuizIndex + 1} von ${questions.length}</p>
      ${questionPikto(q)}<p class="einfach-quiz-question">${escapeHtml(q.question || "")}</p>
      <div class="einfach-quiz-options">
        ${opts.map((opt, i) => `
          <button type="button" class="einfach-quiz-btn" onclick="renderEinfachQuizFeedback(${i}, ${opt.correct ? "true" : "false"})">
            ${escapeHtml(opt.text)}
          </button>
        `).join("")}
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function renderEinfachQuizFeedback(optionIndex, isCorrect) {
  stopReading();
  const topic = getCurrentTopic();
  const questions = getEinfachQuizQuestions(topic);
  const q = questions[currentQuizIndex];
  if (!topic || !q) return renderMenu();

  if (isCorrect) {
    quizScore++;
    quizAnsweredCorrect.add(currentQuizIndex);
  }
  playSound(isCorrect ? "correct" : "wrong");

  const feedbackText = isCorrect
    ? (q.feedbackCorrect || "Genau richtig!")
    : (falschFeedback(q, optionIndex) || "Das war leider falsch. Beim nächsten Mal klappt es besser.");

  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader(topic.title, "Einfach-Quiz", "Antwort", isCorrect ? "Richtig!" : "Nochmal", 100);
  setOrientation(`Du machst das Quiz: ${topic.title}.`);

  content.innerHTML = `
    <article class="card feedback-page ${isCorrect ? "feedback-correct" : "feedback-wrong"}" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      <h2 class="einfach-quiz-result-title">${isCorrect ? "✓ Richtig!" : "✗ Nicht ganz"}</h2>
      <p class="einfach-quiz-feedback-text">${escapeHtml(feedbackText)}</p>
      <div class="einfach-quiz-next-actions">
        <button type="button" class="primary-action" onclick="einfachQuizNext()">
          ${currentQuizIndex < questions.length - 1 ? "Weiter" : "Ergebnis ansehen"}
        </button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function einfachQuizNext() {
  currentQuizIndex++;
  renderEinfachQuizQuestion();
}

function renderEinfachQuizResult() {
  stopReading();
  const topic = getCurrentTopic();
  if (!topic) return renderMenu();
  const total = getEinfachQuizQuestions(topic).length;

  playSound("success");
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader(topic.title, "Einfach-Quiz", "Ergebnis", "Quiz beendet", 100);
  setOrientation(`Du bist fertig mit dem Quiz: ${topic.title}.`);
  showNav(false, false);

  const allCorrect = quizScore === total;
  const emoji = allCorrect ? "🌟" : quizScore >= Math.ceil(total / 2) ? "👍" : "💪";
  const praise = allCorrect
    ? "Alle Fragen richtig. Das war super!"
    : quizScore >= Math.ceil(total / 2)
      ? "Das war schon sehr gut!"
      : "Du lernst. Das ist toll!";

  content.innerHTML = `
    <article class="card completion-card--einfach" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      <div class="einfach-quiz-result-emoji" aria-hidden="true">${emoji}</div>
      <h2 class="einfach-done-title">${quizScore} von ${total} richtig</h2>
      <p class="einfach-done-praise">${escapeHtml(praise)}</p>
      <div class="einfach-done-actions">
        <button type="button" class="primary-action einfach-done-btn" onclick="startEinfachQuiz('${escapeHtml(topic.id)}')">
          Quiz nochmal
        </button>
        <div class="completion-links">
          <button type="button" class="link-action" onclick="startTopicMode('${escapeHtml(topic.id)}', 'short')">
            Lektionen nochmal
          </button>
          <button type="button" class="link-action" onclick="renderMenu()">
            Zur Themenübersicht
          </button>
        </div>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function getQuizQuestions(topic) {
  if (!topic) return [];
  if (Array.isArray(topic.quizQuestions) && topic.quizQuestions.length) return topic.quizQuestions;
  if (Array.isArray(topic.quiz) && topic.quiz.length) return topic.quiz;
  return [];
}

function renderQuizQuestion() {
  stopReading();
  const topic = getCurrentTopic();
  const questions = getQuizQuestions(topic);
  if (!topic || !questions.length) return renderTopicChoice(currentTopicId);
  if (currentQuizIndex >= questions.length) return renderQuizResult();

  const q = questions[currentQuizIndex];
  const answers = Array.isArray(q.answers) ? q.answers : [];
  const progress = Math.round((currentQuizIndex / questions.length) * 100);

  setProgressVisible(true);
  setBottomNavVisible(false);
  setHeader(topic.title, "Quiz", `Frage ${currentQuizIndex + 1} von ${questions.length}`, "Quiz", progress);
  setOrientation(`Du machst das Quiz: ${topic.title}. Frage ${currentQuizIndex + 1} von ${questions.length}.`);
  showNav(false, false);

  const answerHtml = answers.map((answer, index) => `
    <button type="button" class="answer-option" onclick="renderQuizFeedbackPage(${index})">
      ${answerNumBadge(index)}${answerPikto(answer)}<span class="answer-text">${escapeHtml(answerText(answer))}</span>
    </button>
  `).join("");

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card quiz-card" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      <!-- V-2: "Quiz" stand dreimal auf dem Schirm (Kopfzeile, Orientierungs-
           Satz, hier). Die Ueberschrift bleibt fuer Screenreader und die
           Gliederung erhalten, kostet aber keinen Platz mehr. -->
      <h2 class="sr-only">Quiz</h2>
      ${stationBadge("pruefen")}
      ${questionPikto(q)}<p class="quiz-question">${escapeHtml(q.question || "")}</p>
      ${buildTaskHelpBox(taskHint(q, "quiz"), true)}
      <div class="answers">${answerHtml}</div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function renderQuizFeedbackPage(index) {
  stopReading();
  const topic = getCurrentTopic();
  const questions = getQuizQuestions(topic);
  const q = questions[currentQuizIndex];
  if (!topic || !q) return renderTopicChoice(currentTopicId);

  const answers = Array.isArray(q.answers) ? q.answers : [];
  const correctIndex = Number(q.correctIndex ?? q.correct ?? 0);
  const selectedText = answerText(answers[index]);
  const isCorrect = index === correctIndex;
  playSound(isCorrect ? "correct" : "wrong");

  if (isCorrect && !quizAnsweredCorrect.has(currentQuizIndex)) {
    quizScore += 1;
    quizAnsweredCorrect.add(currentQuizIndex);
  }

  const explanation = isCorrect
    ? (q.feedbackCorrect || "Das ist sicher. Du hast gut entschieden.")
    : (falschFeedback(q, index) || "Das ist nicht sicher. Du kannst die Frage noch einmal versuchen.");
  /* Deine Karte: angewendete Regel eintragen (nur bei richtiger Antwort). */
  /* Deine Karte: Quizfragen haben KEIN remember-Feld (122 Fragen, keine
     einzige). Deshalb wird die Regel aus der Erklaerung der richtigen
     Antwort gelesen – dort steht die Lehre ("Druck ist ein Warnzeichen"),
     waehrend die Frage nur die Situation beschreibt. Ueber die Frage zu
     gehen war messbar schlechter: "Am Automaten klebt ein QR-Code" landete
     bei den Codes statt bei den Links. Bekommt eine Frage spaeter ein
     remember, gewinnt das. */
  const regelHinweis = isCorrect ? regelHinweisHtmlId(regelAusQuizfrage(q), topic.id) : "";

  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader(topic.title, "Quiz", "Rückmeldung", isCorrect ? "Richtig" : "Nochmal üben", 100);
  setOrientation(`Du machst das Quiz: ${topic.title}.`);

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card feedback-page ${isCorrect ? "feedback-correct" : "feedback-wrong"}" data-readable="true">
      <h2>${isCorrect ? "Genau richtig!" : "Fast!"}</h2>

      <div class="feedback-selected">
        <h3>Deine Antwort:</h3>
        <p>${escapeHtml(selectedText)}</p>
      </div>

      <div class="feedback-explanation">
        <h3>Erklärung:</h3>
        <p>${escapeHtml(explanation)}</p>
      </div>
      ${!isCorrect ? roleFigure("ruhig") : ""}

      ${regelHinweis}

      <div class="feedback-actions">
        ${isCorrect
          ? `<button type="button" class="feedback-button primary" onclick="continueAfterQuizAnswer()">Weiter</button>`
          : `<button type="button" class="feedback-button secondary" onclick="renderQuizQuestion()">Nochmal versuchen</button>
             <button type="button" class="feedback-button ghost" onclick="startTopicMode('${escapeHtml(topic.id)}', 'full')">📖 Lektionen nachlesen</button>`
        }
      </div>

      ${!isCorrect ? buildTaskHelpBox(taskHint(q, "quiz")) : ""}
    </article>
  `;
  announce(isCorrect ? "Genau richtig!" : "Fast! Das war noch nicht ganz richtig.");
  focusContent();
  renderLegalFooter();
}

function continueAfterQuizAnswer() {
  currentQuizIndex += 1;
  renderQuizQuestion();
}

function renderQuizResult() {
  stopReading();
  const topic = getCurrentTopic();
  const questions = getQuizQuestions(topic);
  const total = questions.length || 1;
  const percent = Math.round((quizScore / total) * 100);
  if (topic) markTopicDone(topic.id);
  playSound("success");

  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader(topic ? topic.title : "Quiz", "Quiz", "Ergebnis", "Fertig", 100);
  setOrientation(topic ? `Du bist fertig mit dem Quiz: ${topic.title}.` : "Du bist fertig mit dem Quiz.");
  showNav(false, false);

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card quiz-result-card" data-readable="true">
      <h2>Quiz fertig</h2>
      ${stationBadge("pruefen")}
      <p>Du hast ${quizScore} von ${total} Fragen richtig beantwortet.</p>
      <p>Das sind ${percent} Prozent.</p>
      <p>Wichtig ist: Du hast geübt.</p>
      ${(topic && Array.isArray(topic.helpQuestions) && topic.helpQuestions.length) ? `
      <div class="selfcheck-box">
        <h3>Prüfe dich selbst:</h3>
        <ul class="selfcheck-list">
          ${topic.helpQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join("")}
        </ul>
      </div>` : ""}
      <div class="certificate-actions">
        <button type="button" class="quiz-link quiz-button" onclick="renderCertificate('${escapeHtml(currentTopicId)}', ${quizScore}, ${total})">Urkunde ansehen</button>
        <button type="button" class="nav-button secondary" onclick="startQuiz('${escapeHtml(currentTopicId)}')">Quiz wiederholen</button>
        <button type="button" class="nav-button secondary" onclick="renderTopicChoice('${escapeHtml(currentTopicId)}')">Zurück zum Thema</button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Das große Quiz – Fragen aus allen 12 Themen gemischt
   Route: index.html#grosses-quiz
   ============================================================ */

const BIG_QUIZ_COUNT = 20;      /* So viele Fragen werden gezogen */
const REPEAT_QUIZ_COUNT = 5;    /* Kurze Wiederholung: wenige Fragen */
let bigQuizQuestions = [];   /* Array mit {question, answers, correct, topicId, topicTitle} */
let bigQuizIndex    = 0;
let bigQuizScore    = 0;
let bigQuizTitle    = "Das große Quiz";   /* Überschrift: großes Quiz oder Wiederholen */

function buildBigQuizPool(fromTopics, count) {
  const pool = [];
  (fromTopics || topics).forEach((topic) => {
    const qs = getQuizQuestions(topic);
    qs.forEach((q) => {
      pool.push({
        question:   q.question || "",
        pictogram:  q.pictogram || "",
        answers:    Array.isArray(q.answers) ? q.answers : [],
        correct:    Number(q.correctIndex ?? q.correct ?? 0),
        topicId:    topic.id,
        topicTitle: topic.title,
      });
    });
  });
  /* Fisher-Yates-Shuffle */
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count || BIG_QUIZ_COUNT);
}

/* Ab so vielen geschafften Themen ist das große Quiz sinnvoll. */
const BIG_QUIZ_MIN_TOPICS = 3;

function startBigQuiz() {
  /* Schutzabfrage wie beim Nachbar-Knopf „Wiederholen" (Prüfbericht B20).
     Vorher startete das große Quiz auch aus dem Nullzustand mit 20 Fragen aus
     Themen, die noch niemand gelernt hatte – zwei optisch gleiche Karten
     verhielten sich unterschiedlich. */
  const geschafft = countDoneTopics();
  if (geschafft < BIG_QUIZ_MIN_TOPICS) {
    stopReading();
    currentTopicId = null;
    setProgressVisible(false);
    setBottomNavVisible(false);
    setHeader("Das große Quiz", "Üben", "Das große Quiz", "Später", 0);
    setOrientation("Du bist beim großen Quiz.");
    showNav(false, false);
    const vorschlag = getNextTopicSuggestion();
    const fehlen = BIG_QUIZ_MIN_TOPICS - geschafft;
    content.innerHTML = `
      ${buildToolRow()}
      <article class="card quiz-result-card" data-readable="true">
        <h2>Das große Quiz</h2>
        <p>Hier kommen Fragen aus allen 12 Themen.</p>
        <p>Du hast bis jetzt ${geschafft === 0 ? "noch kein Thema" : (geschafft === 1 ? "1 Thema" : geschafft + " Themen")} geschafft.</p>
        <p>Mach zuerst ${fehlen === 1 ? "noch 1 Thema" : "noch " + fehlen + " Themen"} fertig. Dann kannst du hier üben.</p>
        <div class="certificate-actions">
          ${vorschlag
            ? `<button type="button" class="primary-action" onclick="renderTopicChoice('${escapeHtml(vorschlag.id)}')">Thema starten: ${escapeHtml(vorschlag.title)}</button>`
            : ""}
          <button type="button" class="quiz-link quiz-button" onclick="renderMenu()">Zur Themenübersicht</button>
        </div>
      </article>
    `;
    focusContent();
    renderLegalFooter();
    return;
  }

  bigQuizTitle = "Das große Quiz";
  bigQuizQuestions = buildBigQuizPool();
  bigQuizIndex  = 0;
  bigQuizScore  = 0;
  currentTopicId = null;
  rememberRoute("grosses-quiz");
  renderBigQuizQuestion();
}

/* Wiederhol-Modus: wenige Fragen aus Themen, die schon geschafft sind.
   Lernprinzip: verteiltes Lernen – Wiederholen nach Abstand festigt Wissen. */
function startRepeatQuiz() {
  const doneTopics = topics.filter((t) => isTopicDone(t.id) && getQuizQuestions(t).length);
  if (!doneTopics.length) {
    stopReading();
    setProgressVisible(false);
    setBottomNavVisible(false);
    setHeader("Wiederholen", "", "Wiederholen", "", 0);
    showNav(false, false);
    content.innerHTML = `
      ${buildToolRow()}
      <article class="card quiz-result-card" data-readable="true">
        <h2>Wiederholen</h2>
        <p>Hier kannst du Fragen aus deinen Themen wiederholen.</p>
        <p>Du hast noch kein Thema fertig gemacht.</p>
        <p>Mach zuerst ein Thema fertig. Dann kannst du hier üben.</p>
        <div class="certificate-actions">
          <button type="button" class="quiz-link quiz-button" onclick="renderMenu()">Zur Themenübersicht</button>
        </div>
      </article>
    `;
    focusContent();
    renderLegalFooter();
    return;
  }
  bigQuizTitle = "Wiederholen";
  bigQuizQuestions = buildBigQuizPool(doneTopics, REPEAT_QUIZ_COUNT);
  bigQuizIndex  = 0;
  bigQuizScore  = 0;
  currentTopicId = null;
  rememberRoute("wiederholen");
  renderBigQuizQuestion();
}

function renderBigQuizQuestion() {
  stopReading();
  if (bigQuizIndex >= bigQuizQuestions.length) return renderBigQuizResult();

  const q       = bigQuizQuestions[bigQuizIndex];
  const total   = bigQuizQuestions.length;
  const progress = Math.round((bigQuizIndex / total) * 100);

  setProgressVisible(true);
  setBottomNavVisible(false);
  /* Gleiche Aufteilung wie überall sonst: Art der Seite ins Modul-Feld, Zähler
     ins Schritt-Feld. Vorher waren beide vertauscht (Prüfbericht B25). */
  setHeader(bigQuizTitle, "Quiz", `Frage ${bigQuizIndex + 1} von ${total}`, bigQuizTitle, progress);
  setOrientation(`Du machst: ${bigQuizTitle}. Frage ${bigQuizIndex + 1} von ${total}.`);
  showNav(false, false);

  const answerHtml = q.answers.map((answer, index) => `
    <button type="button" class="answer-option" onclick="renderBigQuizFeedback(${index})">
      ${answerNumBadge(index)}${answerPikto(answer)}<span class="answer-text">${escapeHtml(answerText(answer))}</span>
    </button>
  `).join("");

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card quiz-card big-quiz-card" style="${getTopicColorStyle(q.topicId)}" data-readable="true">
      <p class="big-quiz-topic-badge">${escapeHtml(q.topicTitle)}</p>
      <!-- V-2: derselbe Titel steht schon in der Kopfzeile. -->
      <h2 class="sr-only">${escapeHtml(bigQuizTitle)}</h2>
      ${questionPikto(q)}<p class="quiz-question">${escapeHtml(q.question)}</p>
      <div class="answers">${answerHtml}</div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function renderBigQuizFeedback(selectedIndex) {
  stopReading();
  const q = bigQuizQuestions[bigQuizIndex];
  if (!q) return renderBigQuizResult();

  const isCorrect = selectedIndex === q.correct;
  if (isCorrect) {
    bigQuizScore += 1;
    playSound("correct");
  } else {
    playSound("wrong");
  }

  const feedbackClass = isCorrect ? "feedback-correct" : "feedback-wrong";
  const feedbackText  = isCorrect
    ? "✓ Genau richtig!"
    : `✗ Fast! Richtig wäre: „${escapeHtml(q.answers[q.correct] || "")}"`;

  const isLast = bigQuizIndex >= bigQuizQuestions.length - 1;

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card quiz-card big-quiz-card" style="${getTopicColorStyle(q.topicId)}" data-readable="true">
      <p class="big-quiz-topic-badge">${escapeHtml(q.topicTitle)}</p>
      <!-- V-2: derselbe Titel steht schon in der Kopfzeile. -->
      <h2 class="sr-only">${escapeHtml(bigQuizTitle)}</h2>
      ${questionPikto(q)}<p class="quiz-question">${escapeHtml(q.question)}</p>
      <div class="answers">
        ${q.answers.map((a, i) => `
          <div class="answer-option answer-shown ${i === q.correct ? "answer-correct" : (i === selectedIndex ? "answer-wrong" : "")}">
            ${i === q.correct ? "✓ " : (i === selectedIndex ? "✗ " : "")}${escapeHtml(a)}
          </div>`).join("")}
      </div>
      <p class="${feedbackClass}">${feedbackText}</p>
      <div class="certificate-actions">
        ${isLast
          ? `<button type="button" class="quiz-link quiz-button" onclick="renderBigQuizResult()">Ergebnis anzeigen</button>`
          : `<button type="button" class="quiz-link quiz-button" onclick="nextBigQuizQuestion()">Weiter</button>`
        }
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function nextBigQuizQuestion() {
  bigQuizIndex += 1;
  renderBigQuizQuestion();
}

function renderBigQuizResult() {
  stopReading();
  const total   = bigQuizQuestions.length || 1;
  const percent = Math.round((bigQuizScore / total) * 100);
  playSound("success");

  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader(bigQuizTitle, "Ergebnis", "Ergebnis", "Fertig", 100);
  setOrientation("Geschafft! Du bist fertig mit dem Quiz.");
  showNav(false, false);

  const praise = percent >= 80
    ? "Sehr gut gemacht! Du weißt schon viel über das sichere Internet."
    : percent >= 50
    ? "Gut versucht! Schau dir die Themen noch einmal an."
    : "Kein Problem. Lerne weiter – jedes Mal wird es leichter.";

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card quiz-result-card" data-readable="true">
      <h2>${escapeHtml(bigQuizTitle)} – Fertig!</h2>
      <p>Du hast ${bigQuizScore} von ${total} Fragen richtig beantwortet.</p>
      <p>Das sind ${percent} Prozent.</p>
      <p>${escapeHtml(praise)}</p>
      <div class="certificate-actions">
        <button type="button" class="quiz-link quiz-button" onclick="${bigQuizTitle === "Wiederholen" ? "startRepeatQuiz()" : "startBigQuiz()"}">Noch einmal üben</button>
        <button type="button" class="nav-button secondary" onclick="renderMenu()">Zur Themenübersicht</button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Trainings-Postfach – Trick oder echt?
   Gefahrloses Üben mit nachgebauten Nachrichten (UDL: Handlung).
   Emotionale Sicherheit: alles ist erfunden, Fehler sind erlaubt.
   Route: index.html#training
   ============================================================ */

/* Die alten Trainings-Variablen sind seit dem Umbau ohne Aufgabe.
   Sie bleiben als Platzhalter stehen, damit nichts bricht, das sie
   noch von aussen anspricht. Der Ablauf nutzt postfach* (siehe unten). */
let trainingMessages = [];
let trainingIndex = 0;
let trainingScore = 0;

/* ============================================================
   TRAININGS-POSTFACH – der gemischte Alltagstest (Sept 2026)
   ------------------------------------------------------------
   Frueher hatte das Postfach eine EIGENE Nachrichtenliste
   (TRAINING_INBOX in topics.js). Vier davon waren wortgleich mit
   Szenen des Uebungs-Handys: zwei Angebote, ein Inhalt – und nur
   eines zahlte auf "Deine Karte" ein.

   Jetzt gibt es EINE Quelle: szenarien-de.js. Die Arbeitsteilung:
     Uebungs-Handy      ein Thema, geordnet, mit Runden
     Trainings-Postfach alles gemischt, aber NUR aus Themen, die
                        die Person schon geschafft hat
   Dadurch waechst das Postfach mit dem Lernweg – das ist der
   Zusammenhang zwischen den Angeboten, kein Zusatz-Knopf.

   TRAINING_INBOX bleibt in topics.js stehen, wird aber nicht mehr
   gelesen.
   ============================================================ */

let postfachListe  = [];
let postfachIndex  = 0;
let postfachRichtig = 0;
let postfachAntwort = false;

/* Alle Fragen aus den Szenarien der geschafften Themen.
   Nur freigeschaltete Runden – sonst bekaeme jemand Runde-3-Faelle,
   ohne Runde 1 und 2 gespielt zu haben. */
function postfachPool() {
  const pool = [];
  topics.forEach(function (t) {
    if (!isTopicDone(t.id) || !hasScenario(t.id)) return;
    const scn = getScenario(t.id);
    const frei = (typeof getStufeFrei === "function") ? getStufeFrei(t.id) : 1;
    (scn.szenen || []).forEach(function (z) {
      if (!z.frage) return;
      if ((Number(z.stufe) || 1) > frei) return;
      pool.push({ thema: t.id, titel: t.title, kanal: scn.kanal || "Posteingang", szene: z });
    });
  });
  return pool;
}

const POSTFACH_MAX = 8;

function startTrainingInbox() {
  stopReading();
  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);
  setHeader("Trainings-Postfach", "", "Üben", "", 0);
  setOrientation("Du bist im Trainings-Postfach. Hier kannst du gefahrlos üben.");
  rememberRoute("training");

  const pool = postfachPool();
  const geschafft = topics.filter(function (t) { return isTopicDone(t.id); });
  const anzahl = Math.min(pool.length, POSTFACH_MAX);

  /* Leeres Postfach ist kein Fehler, sondern der Anfang: Es zeigt,
     wofuer das Lernen gut ist, statt die Person auszusperren. */
  const leer = pool.length === 0;

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card training-card" data-readable="true">
      ${stationBadge("pruefen")}
      <div class="symbol-heading">
        <span class="access-box-symbol" aria-hidden="true">${getIconHtml("message")}</span>
        <h2>Trainings-Postfach</h2>
      </div>
      ${leer ? `
        <p>Hier kommt alles durcheinander an. So wie im echten Leben.</p>
        <p>Dein Postfach ist noch leer.</p>
        <p>Mach ein Thema fertig. Dann kommen die Nachrichten aus diesem Thema hier an.</p>
        <div class="access-box remember remember-box">
          <h3>So wächst dein Postfach</h3>
          <p class="remember-text">Für jedes Thema, das du schaffst, kommen neue Nachrichten dazu. Je mehr du kannst, desto voller wird es.</p>
        </div>
        <div class="certificate-actions">
          <button type="button" class="quiz-link quiz-button" onclick="renderMenu()">Erstes Thema starten</button>
          <button type="button" class="nav-button secondary" onclick="renderScenarioChooser()">Zum Übungs-Handy</button>
        </div>
      ` : `
        <p>Hier kommt alles durcheinander an. So wie im echten Leben.</p>
        <p>Du entscheidest bei jeder Nachricht.</p>
        <div class="access-box remember remember-box">
          <h3>Dein Postfach</h3>
          <p class="remember-text">Du hast ${geschafft.length} ${geschafft.length === 1 ? "Thema" : "Themen"} geschafft. Deshalb liegen ${pool.length} Nachrichten in deinem Postfach.${pool.length > POSTFACH_MAX ? ` Du bekommst ${POSTFACH_MAX} davon – jedes Mal andere.` : ""}</p>
        </div>
        ${buildRememberBox("Wichtig", "Alle Nachrichten hier sind erfunden. Es gibt keine Zeit-Grenze. Fehler sind erlaubt. Du kannst jederzeit aufhören.")}
        <div class="certificate-actions">
          <button type="button" class="quiz-link quiz-button" onclick="beginTraining()">${anzahl} Nachrichten prüfen</button>
          <button type="button" class="nav-button secondary" onclick="renderMenu()">Zur Themenübersicht</button>
        </div>
      `}
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function beginTraining() {
  const pool = postfachPool();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const h = pool[i]; pool[i] = pool[j]; pool[j] = h;
  }
  postfachListe = pool.slice(0, POSTFACH_MAX);
  postfachIndex = 0;
  postfachRichtig = 0;
  renderTrainingMessage();
}

function postfachScreen(eintrag) {
  const inhalt = (eintrag.szene.inhalt || []).map(scenarioElementHtml).join("");
  return `
    <p class="sz-fake-band">Das ist nicht echt. Das ist nur zum Üben.</p>
    <div class="phone">
      <p class="phone-bar">${escapeHtml(eintrag.kanal)}</p>
      <div class="phone-screen">${inhalt}</div>
    </div>`;
}

function renderTrainingMessage() {
  stopReading();
  if (!postfachListe.length) return startTrainingInbox();
  if (postfachIndex >= postfachListe.length) return renderTrainingResult();

  const eintrag = postfachListe[postfachIndex];
  const frage = eintrag.szene.frage;
  const total = postfachListe.length;
  postfachAntwort = false;

  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);
  setHeader("Trainings-Postfach", `Nachricht ${postfachIndex + 1} von ${total}`, "Nachricht", "Üben",
            Math.round((postfachIndex / total) * 100));
  setOrientation(`Du übst im Trainings-Postfach. Nachricht ${postfachIndex + 1} von ${total}.`);

  const antworten = (frage.answers || []).map(function (a, i) {
    return `<button type="button" class="answer-option sz-answer" data-index="${i}">${answerNumBadge(i)}<span class="answer-text">${escapeHtml(answerText(a))}</span></button>`;
  }).join("");

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card scenario-card" style="${getTopicColorStyle(eintrag.thema)}" data-readable="true">
      <p class="sz-count">Nachricht ${postfachIndex + 1} von ${total}</p>
      ${postfachScreen(eintrag)}
      <div class="sz-frage">
        ${questionPikto(frage)}<p class="sz-frage-text">${escapeHtml(frage.question || "")}</p>
        <div class="answers">${antworten}</div>
      </div>
      <div id="szFeedback" class="sz-feedback is-hidden" role="status" aria-live="polite"></div>
      <div class="certificate-actions sz-exit">
        <button type="button" class="nav-button secondary" onclick="startTrainingInbox()">Üben beenden</button>
      </div>
    </article>
  `;

  content.querySelectorAll(".sz-answer").forEach(function (btn) {
    btn.addEventListener("click", function () { answerTraining(Number(btn.dataset.index)); });
  });

  focusContent();
  renderLegalFooter();
}

function answerTraining(index) {
  if (postfachAntwort) return;
  const eintrag = postfachListe[postfachIndex];
  if (!eintrag) return;
  const frage = eintrag.szene.frage;
  const szene = eintrag.szene;

  postfachAntwort = true;
  const richtig = index === Number(frage.correctIndex ?? 0);
  if (richtig) postfachRichtig += 1;
  playSound(richtig ? "correct" : "wrong");

  content.querySelectorAll(".sz-answer").forEach(function (b, i) {
    b.disabled = true;
    if (i === index) b.classList.add(richtig ? "is-correct" : "is-wrong");
    if (!richtig && i === Number(frage.correctIndex ?? 0)) b.classList.add("is-correct");
  });

  const text = richtig
    ? (frage.feedbackCorrect || "Das war sicher. Gut gemacht.")
    : (falschFeedback(frage, index) || "Das ist nicht sicher. Schau noch einmal.");

  /* Deine Karte: das Postfach zahlt jetzt genauso ein wie das Übungs-Handy.
     Das Herkunfts-Thema zaehlt – so entsteht der Transfer ueber Themen. */
  const regelHinweis = richtig ? regelHinweisHtml(frage.remember, eintrag.thema) : "";

  const schwerHtml = szene.schwer
    ? `<p class="sz-schwer">Die war schwer. Da fallen viele darauf herein.</p>` : "";

  const falle = szene.falle;
  const falleHtml = falle
    ? `<div class="sz-falle">
         <p class="sz-falle-band">Das ist nur ein Bild. Hier passiert nichts.</p>
         <div class="phone phone--falle">
           <p class="phone-bar">Diese Seite geht auf</p>
           <div class="phone-screen">${(falle.inhalt || []).map(scenarioElementHtml).join("")}</div>
         </div>
         <p class="sz-falle-text">${escapeHtml(richtig ? (falle.text || "") : (falle.textFalsch || falle.text || ""))}</p>
       </div>`
    : "";

  const letzte = postfachIndex >= postfachListe.length - 1;
  const feld = document.getElementById("szFeedback");
  if (!feld) return;
  feld.className = "sz-feedback " + (richtig ? "is-correct" : "is-wrong");
  feld.innerHTML = `
    <p class="sz-feedback-kopf">${richtig ? "Richtig." : "Noch nicht sicher."}</p>
    ${schwerHtml}
    ${falleHtml}
    <p class="sz-feedback-text">${escapeHtml(text)}</p>
    ${frage.remember ? `<p class="sz-feedback-merk">Merksatz: ${escapeHtml(frage.remember)}</p>` : ""}
    ${regelHinweis}
    <p class="sz-feedback-herkunft">Diese Nachricht kommt aus dem Thema: ${escapeHtml(eintrag.titel)}.</p>
    <div class="certificate-actions">
      <button type="button" class="nav-button primary" onclick="nextTrainingMessage()">${letzte ? "Zum Ergebnis" : "Weiter"}</button>
    </div>`;
  const weiter = feld.querySelector("button");
  if (weiter) weiter.focus();
}

function nextTrainingMessage() {
  postfachIndex += 1;
  renderTrainingMessage();
}

function renderTrainingResult() {
  stopReading();
  const total = postfachListe.length || 1;
  playSound("success");

  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);
  setHeader("Trainings-Postfach", "Ergebnis", "Ergebnis", "Fertig", 100);
  setOrientation("Geschafft! Du hast im Trainings-Postfach geübt.");

  const lob = postfachRichtig === total
    ? "Alle richtig erkannt. Das war stark!"
    : postfachRichtig >= Math.ceil(total / 2)
      ? "Das war schon sehr gut. Jedes Üben macht dich sicherer."
      : "Gut, dass du geübt hast. Das ist schwer. Du kannst es gleich noch einmal machen.";

  const themen = [];
  postfachListe.forEach(function (e) { if (themen.indexOf(e.titel) === -1) themen.push(e.titel); });

  const offene = topics.filter(function (t) { return !isTopicDone(t.id) && hasScenario(t.id); });
  const waechst = offene.length > 0
    ? `<div class="access-box remember remember-box">
         <h3>Dein Postfach kann noch wachsen</h3>
         <p class="remember-text">Es fehlen noch ${offene.length} ${offene.length === 1 ? "Thema" : "Themen"}. Für jedes Thema, das du schaffst, kommen neue Nachrichten dazu.</p>
       </div>`
    : `<div class="access-box remember remember-box">
         <h3>Dein Postfach ist voll</h3>
         <p class="remember-text">Du hast alle Themen geschafft. Hier kommt jetzt alles an, was es gibt.</p>
       </div>`;

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card quiz-result-card" data-readable="true">
      <h2>Trainings-Postfach – fertig!</h2>
      <p>Du hast ${postfachRichtig} von ${total} Nachrichten sicher entschieden.</p>
      <p>${escapeHtml(lob)}</p>
      ${themen.length ? `<p>Die Nachrichten kamen aus: ${escapeHtml(themen.join(", "))}.</p>` : ""}
      ${waechst}
      ${buildRememberBox("Wichtig", "Bekommst du wirklich so eine Nachricht? Zeige sie einer Person, der du vertraust. Du musst nichts allein entscheiden.")}
      <div class="certificate-actions">
        <button type="button" class="quiz-link quiz-button" onclick="beginTraining()">Noch einmal üben</button>
        <button type="button" class="nav-button secondary" onclick="renderRegelKarte()">Deine Karte ansehen</button>
        <button type="button" class="nav-button secondary" onclick="renderMenu()">Zur Themenübersicht</button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Übungs-Handy – Szenarien zu den Themen
   Ein nachgebauter Handy-Bildschirm, in dem man gefahrlos
   handelt statt nur wiederzuerkennen (§3 UDL: Handlung).
   Daten: szenarien-de.js (SCENARIOS[themaId]).

   Regeln, die hier verbindlich sind:
   - Das Band "Das ist nicht echt" steht IMMER da, nicht nur am Anfang.
   - Keine Zeitlimits, kein Countdown (§9 COGA). Der Text darf von
     Druck erzaehlen, die Oberflaeche uebt keinen aus.
   - Nur Tippen, kein Wischen: Wischgesten sind mit Tastatur nicht
     bedienbar.
   - Ein falscher Tipp verliert nichts. Er erklaert und laesst
     weitermachen (§4 ressourcenorientiert).
   - Genau EIN data-readable-Container pro Seite, sonst liest der
     Vorlese-Knopf nur den ersten.
   ============================================================ */

let scenarioTopicId = null;
let scenarioIndex   = 0;
let scenarioRight   = 0;
let scenarioAnswered = false;
/* Runden im Uebungs-Handy (Sept 2026): Runde = Stufe 1, 2 oder 3.
   scenarioStufe = die gerade laufende Runde.
   Freigeschaltet wird nur nach oben. Eine falsche Antwort nimmt nichts weg
   (Konzept: keine Bestrafung). Ohne Lernstand-Einwilligung lebt der Stand
   nur in dieser Sitzung – siehe sessionScenarioStufe oben. */
let scenarioStufe = 1;

/* Welche Stufen kommen in einem Szenario vor? Ohne stufe-Feld: nur [1].
   Dadurch laufen alle Szenarien ohne Runden unveraendert weiter. */
function scenarioStufen(scn) {
  const s = new Set((scn && scn.szenen ? scn.szenen : []).map(z => Number(z.stufe) || 1));
  return Array.from(s).sort((a, b) => a - b);
}

/* Ein Szenario-Abbild, das nur die Szenen EINER Runde enthaelt.
   So bleiben scenarioElements() und buildScenarioScreen() unveraendert. */
function scenarioRunde(scn, stufe) {
  const szenen = (scn && scn.szenen ? scn.szenen : []).filter(z => (Number(z.stufe) || 1) === stufe);
  return Object.assign({}, scn, { szenen });
}

/* Hoechste freigeschaltete Runde. Sitzung und – falls eingewilligt – Lernstand. */
function getStufeFrei(topicId) {
  let frei = sessionScenarioStufe[topicId] || 1;
  if (isProgressEnabled()) {
    const p = loadProgress();
    const gespeichert = (p && p.stufen && p.stufen[topicId]) || 1;
    if (gespeichert > frei) frei = gespeichert;
  }
  return frei;
}

function setStufeFrei(topicId, stufe) {
  const wert = Number(stufe) || 1;
  if (wert > (sessionScenarioStufe[topicId] || 1)) sessionScenarioStufe[topicId] = wert;
  if (!isProgressEnabled()) return;
  const p = loadProgress() || { enabled: true, done: {} };
  p.stufen = p.stufen || {};
  if (wert > (p.stufen[topicId] || 1)) {
    p.stufen[topicId] = wert;
    saveProgress(p);
  }
}

function stufenName(stufe) {
  if (stufe === 2) return "Runde 2";
  if (stufe === 3) return "Runde 3";
  return "Runde 1";
}

function getScenario(topicId) {
  return (typeof SCENARIOS !== "undefined" && SCENARIOS && SCENARIOS[topicId]) ? SCENARIOS[topicId] : null;
}

function hasScenario(topicId) {
  const s = getScenario(topicId);
  return !!(s && Array.isArray(s.szenen) && s.szenen.length);
}

/* ---- Bausteine des Bildschirms ---- */

function scenarioElementHtml(el) {
  if (!el || !el.typ) return "";
  switch (el.typ) {
    case "nachricht":
      return `
        <div class="sz-bubble sz-in">
          <p class="sz-von">Von: ${escapeHtml(el.von || "Unbekannt")}${el.zeit ? " · " + escapeHtml(el.zeit) : ""}</p>
          <p class="sz-text">${escapeHtml(el.text || "")}</p>
        </div>`;
    case "eigene":
      return `
        <div class="sz-bubble sz-out">
          <p class="sz-von">Deine Antwort</p>
          <p class="sz-text">${escapeHtml(el.text || "")}</p>
        </div>`;
    case "liste":
      return `
        <div class="sz-liste">
          ${(el.eintraege || []).map(e => `
            <div class="sz-listeneintrag">
              <p class="sz-von">${escapeHtml(e.von || "")}${e.zeit ? " · " + escapeHtml(e.zeit) : ""}</p>
              <p class="sz-text">${escapeHtml(e.vorschau || "")}</p>
            </div>`).join("")}
        </div>`;
    case "schalter":
      return `
        <div class="sz-schalter">
          <p class="sz-schalter-name">${escapeHtml(el.label || "")}</p>
          <p class="sz-schalter-wert">Jetzt eingestellt: ${escapeHtml(el.wert || "")}</p>
          ${el.hinweis ? `<p class="sz-schalter-hinweis">${escapeHtml(el.hinweis)}</p>` : ""}
        </div>`;
    case "anruf":
      return `
        <div class="sz-anruf">
          <span class="sz-anruf-symbol" aria-hidden="true">${getIconHtml("message")}</span>
          <p class="sz-anruf-von">Eingehender Anruf</p>
          <p class="sz-anruf-name">${escapeHtml(el.von || "Unbekannt")}</p>
          <p class="sz-anruf-nr">${escapeHtml(el.nummer || "")}</p>
        </div>`;
    case "shop":
      return `
        <div class="sz-shop">
          <p class="sz-shop-titel">${escapeHtml(el.titel || "")}</p>
          <p class="sz-shop-preis">${escapeHtml(el.preis || "")}</p>
          ${(el.zeilen && el.zeilen.length) ? `<ul class="sz-shop-liste">${el.zeilen.map(z => `<li>${escapeHtml(z)}</li>`).join("")}</ul>` : ""}
        </div>`;
    case "video":
      return `
        <div class="sz-video">
          <div class="sz-video-bild" aria-hidden="true"><span>&#9654;</span></div>
          <p class="sz-video-titel">${escapeHtml(el.titel || "")}</p>
          <p class="sz-video-meta">${escapeHtml(el.kanal || "")}${el.dauer ? " · " + escapeHtml(el.dauer) : ""}</p>
          ${el.hinweis ? `<p class="sz-video-hinweis">${escapeHtml(el.hinweis)}</p>` : ""}
        </div>`;
    case "hinweis":
      return `<p class="sz-hinweis">${escapeHtml(el.text || "")}</p>`;
    /* Nachgebaute Betrugs-Seite fuer das Fallen-Bild (Sept 2026).
       Bewusst KEINE echten Eingabefelder und kein <button>: Es ist ein
       Bild, kein Formular. Niemand soll hier etwas eintippen koennen. */
    case "webseite":
      return `
        <div class="sz-webseite">
          ${el.adresse ? `<p class="sz-web-adresse">${escapeHtml(el.adresse)}</p>` : ""}
          <div class="sz-web-inhalt">
            <p class="sz-web-titel">${escapeHtml(el.titel || "")}</p>
            ${(el.felder || []).map(f => `<p class="sz-web-feld">${escapeHtml(f)}</p>`).join("")}
            ${el.knopf ? `<p class="sz-web-knopf">${escapeHtml(el.knopf)}</p>` : ""}
          </div>
        </div>`;
    default:
      return "";
  }
}

/* Chat sammelt den Verlauf an, alle anderen Typen ersetzen den Bildschirm. */
function scenarioElements(scn, bis) {
  const out = [];
  if (scn.typ === "chat") {
    for (let i = 0; i <= bis && i < scn.szenen.length; i++) out.push(...(scn.szenen[i].inhalt || []));
  } else {
    out.push(...((scn.szenen[bis] || {}).inhalt || []));
  }
  return out;
}

function buildScenarioScreen(scn, bis) {
  const inhalt = scenarioElements(scn, bis).map(scenarioElementHtml).join("");
  return `
    <p class="sz-fake-band">Das ist nicht echt. Das ist nur zum Üben.</p>
    <div class="phone">
      <p class="phone-bar">${escapeHtml(scn.kanal || "Übung")}</p>
      <div class="phone-screen">${inhalt}</div>
    </div>`;
}

/* ---- Seiten ---- */

/* Auswahlseite: welches Uebungs-Handy? Karten statt Liste, damit der
   Vorlese-Knopf sie als Ganzes vorliest (KARTEN_SELEKTOR). */
function renderScenarioChooser() {
  stopReading();
  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);
  setHeader("Übungs-Handy", "", "Üben", "", 0);
  setOrientation("Du bist im Übungs-Handy. Wähle ein Thema zum Üben.");
  rememberRoute("uebung");

  const karten = topics
    .filter(t => hasScenario(t.id))
    .map(t => {
      const scn = getScenario(t.id);
      const text = `${t.title}. ${scn.titel}.`;
      return `
        <div class="card-read-pair card-read-pair--action">
          <button type="button" class="action-card" style="${getTopicColorStyle(t.id)}" onclick="startScenario('${escapeHtml(t.id)}')">
          <span class="action-icon" aria-hidden="true">${getIconHtml(t.icon || "start")}</span>
          <span class="action-text">
            <span class="action-title">${escapeHtml(t.title)}</span>
            <span class="action-desc">${escapeHtml(scn.titel)}</span>
          </span>
        </button>
          <button type="button" class="card-read-button card-read-button--path" data-read-card-text="${escapeHtml(text)}" aria-label="${escapeHtml(t.title)} vorlesen">${READ_CARD_SVG} Vorlesen</button>
        </div>`;
    }).join("");

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card" data-readable="true">
      <div class="symbol-heading">
        <span class="access-box-symbol" aria-hidden="true">${getIconHtml("start")}</span>
        <h2>Übungs-Handy</h2>
      </div>
      <p>Hier übst du wie auf einem Handy.</p>
      <p>Du siehst Nachrichten, Einstellungen oder einen Shop.</p>
      <p>Du entscheidest. Nichts davon ist echt.</p>
      <h3>Wähle ein Thema</h3>
      <div class="action-grid">${karten}</div>
      <div class="certificate-actions">
        <button type="button" class="nav-button secondary" onclick="renderMenu()">Zur Themenübersicht</button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function startScenario(topicId) {
  stopReading();
  const topic = getTopicById(topicId);
  const scn = getScenario(topicId);
  if (!topic || !scn) return renderMenu();

  currentTopicId = topic.id;
  scenarioTopicId = topic.id;
  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);
  setHeader(topic.title, "Übungs-Handy", "Üben", "", 0);
  setOrientation(`Du bist im Übungs-Handy zum Thema: ${topic.title}.`);
  rememberRoute(topicRoute(topic.id, "uebung"));

  /* Runden-Auswahl (Sept 2026). Gibt es nur eine Runde, bleibt alles wie
     bisher. Noch nicht freie Runden werden gezeigt, aber nicht als Verbot,
     sondern als Ziel – niemand wird ausgesperrt oder abgewertet. */
  const stufen = scenarioStufen(scn);
  const frei = getStufeFrei(topic.id);
  const rundenWahl = stufen.length < 2 ? "" : `
      <h3>Wähle deine Runde</h3>
      <div class="sz-runden">
        ${stufen.map(st => {
          const zahl = (scn.szenen || []).filter(z => (Number(z.stufe) || 1) === st).length;
          const offen = st <= frei;
          const untertitel = st === 1 ? "Zum Anfangen"
                           : st === 2 ? "Die Tricks sind besser gemacht"
                           : "Jetzt zählt, was du tust";
          return offen
            ? `<button type="button" class="sz-runde" onclick="beginScenario(${st})">
                 <span class="sz-runde-titel">${escapeHtml(stufenName(st))}</span>
                 <span class="sz-runde-sub">${escapeHtml(untertitel)} · ${zahl} Nachrichten</span>
               </button>`
            : `<p class="sz-runde sz-runde-zu">
                 <span class="sz-runde-titel">${escapeHtml(stufenName(st))}</span>
                 <span class="sz-runde-sub">Schaffe zuerst ${escapeHtml(stufenName(st - 1))}. Dann geht es hier weiter.</span>
               </p>`;
        }).join("")}
      </div>`;

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card scenario-card" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      ${stationBadge("pruefen")}
      <div class="symbol-heading">
        <span class="access-box-symbol" aria-hidden="true">${getIconHtml(topic.icon || "start")}</span>
        <h2>Übungs-Handy: ${escapeHtml(scn.titel || topic.title)}</h2>
      </div>
      ${(scn.einstieg || []).map(s => `<p>${escapeHtml(s)}</p>`).join("")}
      ${buildRememberBox("Wichtig", "Alles hier ist erfunden. Es gibt keine Zeit-Grenze. Fehler sind erlaubt. Du kannst jederzeit aufhören.")}
      ${rundenWahl}
      <div class="certificate-actions">
        ${rundenWahl ? "" : `<button type="button" class="quiz-link quiz-button" onclick="beginScenario()">Üben starten</button>`}
        <button type="button" class="nav-button secondary" onclick="renderTopicChoice('${escapeHtml(topic.id)}')">Zurück zum Thema</button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

function beginScenario(stufe) {
  const scn = getScenario(scenarioTopicId);
  const stufen = scn ? scenarioStufen(scn) : [1];
  let gewuenscht = Number(stufe) || scenarioStufe || 1;
  /* Nie in eine gesperrte Runde springen, und nie in eine, die es nicht gibt. */
  if (stufen.indexOf(gewuenscht) === -1) gewuenscht = stufen[0] || 1;
  const frei = getStufeFrei(scenarioTopicId);
  if (gewuenscht > frei) gewuenscht = frei;
  scenarioStufe = gewuenscht;
  scenarioIndex = 0;
  scenarioRight = 0;
  renderScenarioScene();
}

function renderScenarioScene() {
  stopReading();
  const topic = getTopicById(scenarioTopicId);
  const scn = getScenario(scenarioTopicId);
  if (!topic || !scn) return renderMenu();
  /* Nur die Szenen der laufenden Runde (Sept 2026). Szenarien ohne
     stufe-Feld haben genau eine Runde – fuer sie aendert sich nichts. */
  const runde = scenarioRunde(scn, scenarioStufe);
  if (scenarioIndex >= runde.szenen.length) return renderScenarioResult();

  const szene = runde.szenen[scenarioIndex];
  const total = runde.szenen.length;
  const frage = szene.frage || null;
  scenarioAnswered = false;
  const mehrereRunden = scenarioStufen(scn).length > 1;
  const rundeText = mehrereRunden ? stufenName(scenarioStufe) + ", " : "";

  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);
  setHeader(topic.title, "Übungs-Handy", `${rundeText}Schritt ${scenarioIndex + 1} von ${total}`, "Üben",
            Math.round((scenarioIndex / total) * 100));
  setOrientation(`Übungs-Handy: ${topic.title}. ${rundeText}Schritt ${scenarioIndex + 1} von ${total}.`);

  const antworten = frage
    ? (frage.answers || []).map((a, i) => `
        <button type="button" class="answer-option sz-answer" data-index="${i}">
          ${answerNumBadge(i)}${answerPikto(a)}<span class="answer-text">${escapeHtml(answerText(a))}</span>
        </button>`).join("")
    : "";

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card scenario-card" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      <p class="sz-count">${escapeHtml(rundeText)}Schritt ${scenarioIndex + 1} von ${total}</p>
      ${buildScenarioScreen(runde, scenarioIndex)}
      ${frage ? `
        <div class="sz-frage">
          ${questionPikto(frage)}<p class="sz-frage-text">${escapeHtml(frage.question || "")}</p>
          <div class="answers">${antworten}</div>
        </div>
        <div id="szFeedback" class="sz-feedback is-hidden" role="status" aria-live="polite"></div>
      ` : `
        <div class="certificate-actions">
          <button type="button" class="nav-button primary" onclick="nextScenarioScene()">Weiter</button>
        </div>`}
      <div class="certificate-actions sz-exit">
        <button type="button" class="nav-button secondary" onclick="renderTopicChoice('${escapeHtml(topic.id)}')">Üben beenden</button>
      </div>
    </article>
  `;

  content.querySelectorAll(".sz-answer").forEach(btn => {
    btn.addEventListener("click", () => answerScenario(Number(btn.dataset.index)));
  });

  focusContent();
  renderLegalFooter();
}

function answerScenario(index) {
  if (scenarioAnswered) return;
  const scn = getScenario(scenarioTopicId);
  if (!scn) return;
  const runde = scenarioRunde(scn, scenarioStufe);
  const szene = runde.szenen[scenarioIndex] || {};
  const frage = szene.frage;
  if (!frage) return;

  scenarioAnswered = true;
  const richtig = index === Number(frage.correctIndex ?? 0);
  if (richtig) scenarioRight += 1;
  playSound(richtig ? "correct" : "wrong");

  content.querySelectorAll(".sz-answer").forEach((b, i) => {
    b.disabled = true;
    if (i === index) b.classList.add(richtig ? "is-correct" : "is-wrong");
    if (!richtig && i === Number(frage.correctIndex ?? 0)) b.classList.add("is-correct");
  });

  const text = richtig
    ? (frage.feedbackCorrect || "Das war sicher. Gut gemacht.")
    : (falschFeedback(frage, index) || "Das ist nicht sicher. Schau noch einmal.");
  /* Deine Karte: angewendete Regel eintragen (nur bei richtiger Antwort). */
  const regelHinweis = richtig ? regelHinweisHtml(frage.remember, scenarioTopicId) : "";
  const letzte = scenarioIndex >= runde.szenen.length - 1;

  /* "Die war schwer" – Einordnung statt Lob. Nimmt Erwachsene ernst und
     macht den Erfolg groesser, ohne dass eine Zahl steigt. */
  const schwerHtml = szene.schwer
    ? `<p class="sz-schwer">Die war schwer. Da fallen viele darauf herein.</p>`
    : "";

  /* Fallen-Bild: zeigt, was die Nachricht wollte. Wird IMMER gezeigt,
     bei richtiger wie bei falscher Antwort – es ist kein Strafbild,
     sondern der Inhalt. Ruhiger Ton, kein Erschrecken (§3, Došen). */
  const falle = szene.falle;
  const falleHtml = falle
    ? `<div class="sz-falle">
         <p class="sz-falle-band">Das ist nur ein Bild. Hier passiert nichts.</p>
         <div class="phone phone--falle">
           <p class="phone-bar">Diese Seite geht auf</p>
           <div class="phone-screen">${(falle.inhalt || []).map(scenarioElementHtml).join("")}</div>
         </div>
         <p class="sz-falle-text">${escapeHtml(richtig ? (falle.text || "") : (falle.textFalsch || falle.text || ""))}</p>
       </div>`
    : "";

  const feld = document.getElementById("szFeedback");
  if (!feld) return;
  feld.className = "sz-feedback " + (richtig ? "is-correct" : "is-wrong");
  feld.innerHTML = `
    <p class="sz-feedback-kopf">${richtig ? "Richtig." : "Noch nicht sicher."}</p>
    ${schwerHtml}
    ${falleHtml}
    <p class="sz-feedback-text">${escapeHtml(text)}</p>
    ${frage.remember ? `<p class="sz-feedback-merk">Merksatz: ${escapeHtml(frage.remember)}</p>` : ""}
    ${regelHinweis}
    <div class="certificate-actions">
      <button type="button" class="nav-button primary" onclick="nextScenarioScene()">${letzte ? "Zum Ergebnis" : "Weiter"}</button>
    </div>`;
  const weiter = feld.querySelector("button");
  if (weiter) weiter.focus();
}

function nextScenarioScene() {
  scenarioIndex += 1;
  renderScenarioScene();
}

function renderScenarioResult() {
  stopReading();
  const topic = getTopicById(scenarioTopicId);
  const scn = getScenario(scenarioTopicId);
  if (!topic || !scn) return renderMenu();
  const runde = scenarioRunde(scn, scenarioStufe);
  const total = runde.szenen.filter(s => s.frage).length || 1;
  playSound("success");

  /* Naechste Runde freischalten (Sept 2026). Schwelle: drei Viertel richtig –
     ueber dem Zufall, aber erreichbar. Wer sie nicht schafft, verliert nichts
     und darf die Runde einfach noch einmal machen (keine Bestrafung). */
  const stufen = scenarioStufen(scn);
  const bestanden = scenarioRight >= Math.ceil(total * 0.75);
  const naechste = stufen.filter(st => st > scenarioStufe)[0] || null;
  if (bestanden && naechste) setStufeFrei(scenarioTopicId, naechste);
  const mehrereRunden = stufen.length > 1;

  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);
  setHeader(topic.title, "Übungs-Handy", mehrereRunden ? stufenName(scenarioStufe) + " – Ergebnis" : "Ergebnis", "Fertig", 100);
  setOrientation(`Geschafft! Du hast im Übungs-Handy geübt: ${topic.title}.`);

  const lob = scenarioRight === total
    ? "Alle Entscheidungen sicher getroffen. Das war stark!"
    : scenarioRight >= Math.ceil(total / 2)
      ? "Das war schon sehr gut. Jedes Üben macht dich sicherer."
      : "Gut, dass du geübt hast. Das ist schwer. Du kannst es gleich noch einmal machen.";

  /* Hinweis auf die naechste Runde – als Angebot, nie als Druck. */
  const naechsteText = !mehrereRunden ? ""
    : naechste && bestanden
      ? `<div class="access-box remember remember-box">
           <h3>${escapeHtml(stufenName(naechste))} ist jetzt offen</h3>
           <p class="remember-text">${naechste === 3
             ? "In Runde 3 kannst du die Tricks nicht mehr sehen. Auch geübte Menschen nicht. Dort zählt, was du tust."
             : "In Runde 2 sind die Tricks besser gemacht. Kein Fehler im Text. Du musst genau hinschauen."}</p>
         </div>`
      : naechste
        ? `<div class="access-box remember remember-box">
             <h3>Noch eine Runde?</h3>
             <p class="remember-text">Mach ${escapeHtml(stufenName(scenarioStufe))} noch einmal. Dann geht ${escapeHtml(stufenName(naechste))} auf. Du verlierst nichts dabei.</p>
           </div>`
        : `<div class="access-box remember remember-box">
             <h3>Du hast alle Runden gemacht</h3>
             <p class="remember-text">Das war die schwerste. Du kannst jede Runde jederzeit wiederholen.</p>
           </div>`;

  const merksaetze = runde.szenen
    .filter(s => s.frage && s.frage.remember)
    .map(s => `<li>${escapeHtml(s.frage.remember)}</li>`).join("");

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card quiz-result-card scenario-card" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      <h2>Übungs-Handy – fertig!</h2>
      <p>Du hast ${scenarioRight} von ${total} Entscheidungen sicher getroffen.</p>
      <p>${escapeHtml(lob)}</p>
      ${scn.abschluss ? `<p>${escapeHtml(scn.abschluss)}</p>` : ""}
      ${naechsteText}
      ${merksaetze ? `
      <div class="access-box remember remember-box">
        <h3>Das nimmst du mit</h3>
        <ul class="sz-merkliste">${merksaetze}</ul>
      </div>` : ""}
      ${buildRememberBox("Wichtig", "Passiert dir so etwas wirklich? Zeige es einer Person, der du vertraust. Du musst nichts allein entscheiden.")}
      <div class="certificate-actions">
        ${(naechste && bestanden)
          ? `<button type="button" class="quiz-link quiz-button" onclick="beginScenario(${naechste})">${escapeHtml(stufenName(naechste))} starten</button>`
          : ""}
        <button type="button" class="${(naechste && bestanden) ? "nav-button secondary" : "quiz-link quiz-button"}" onclick="beginScenario(${scenarioStufe})">${mehrereRunden ? escapeHtml(stufenName(scenarioStufe)) + " noch einmal" : "Noch einmal üben"}</button>
        ${mehrereRunden ? `<button type="button" class="nav-button secondary" onclick="startScenario('${escapeHtml(topic.id)}')">Andere Runde wählen</button>` : ""}
        <button type="button" class="nav-button secondary" onclick="renderTopicChoice('${escapeHtml(topic.id)}')">Zurück zum Thema</button>
        <button type="button" class="nav-button secondary" onclick="renderMenu()">Zur Themenübersicht</button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Urkunde – zum Ausdrucken, Name wird von Hand geschrieben
   ============================================================ */

function renderCertificate(topicId, score, total) {
  stopReading();
  const topic = getTopicById(topicId);
  if (!topic) return renderMenu();

  currentTopicId = topic.id;
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  const hasResult = typeof score === "number" && typeof total === "number" && total > 0;

  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader(topic.title, "Urkunde", "Urkunde", "Geschafft", 100);
  setOrientation(`Das ist deine Urkunde für das Thema: ${topic.title}.`);
  showNav(false, false);

  content.innerHTML = `
    <article class="card certificate-card" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      <div class="certificate-frame">
        <div class="certificate-medal" aria-hidden="true">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
            <circle cx="32" cy="32" r="28" fill="var(--topic-color)" opacity="0.12"/>
            <circle cx="32" cy="32" r="22" fill="var(--topic-color)" opacity="0.2"/>
            <polygon points="32,12 36,24 49,24 39,32 43,44 32,37 21,44 25,32 15,24 28,24"
              fill="var(--topic-color)" opacity="0.9"/>
          </svg>
        </div>

        ${roleFigure("erfolg")}
        <p class="certificate-kicker">Urkunde</p>
        <h2>Sicher und selbstbestimmt im Internet</h2>

        <p class="certificate-text">Diese Urkunde gehört:</p>
        <p class="certificate-name-line" aria-hidden="true">&nbsp;</p>
        <p class="certificate-name-hint">Hier kannst du deinen Namen schreiben.</p>

        <p class="certificate-text">Du hast das Thema</p>
        <p class="certificate-topic">${escapeHtml(topic.title)}</p>
        <p class="certificate-text">gelernt und geübt.</p>
        <p class="certificate-warm">Du hast durchgehalten. Das ist wirklich toll!</p>

        ${hasResult ? `<p class="certificate-result">Quiz-Ergebnis: ${score} von ${total} Fragen richtig.</p>` : ""}

        <p class="certificate-date">Datum: ${escapeHtml(today)}</p>
        <p class="certificate-issuer">Sicher und selbstbestimmt im Internet · Alexianer Stift Tilbeck GmbH</p>
      </div>

      <div class="certificate-actions">
        <button type="button" class="quiz-link quiz-button" onclick="window.print()">Urkunde drucken</button>
        ${(() => { const next = getNextTopicSuggestion(); return next && next.id !== topic.id ? `<button type="button" class="nav-button secondary" onclick="renderTopicChoice('${escapeHtml(next.id)}')">Nächstes Thema: ${escapeHtml(next.title)}</button>` : ""; })()}
        <button type="button" class="nav-button secondary" onclick="renderTopicChoice('${escapeHtml(topic.id)}')">Zurück zum Thema</button>
        <button type="button" class="nav-button secondary" onclick="renderMenu()">Zur Themenübersicht</button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Merk-Karte
   ============================================================ */

function renderMemoryCard(topicId) {
  stopReading();
  const topic = getTopicById(topicId);
  if (!topic) return renderMenu();

  currentTopicId = topic.id;
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Merk-Karte", topic.title, "Merk-Karte", "Merken", 100);
  setOrientation(`Das ist die Merk-Karte für das Thema: ${topic.title}.`);
  showNav(false, false);

  const rules = Array.isArray(topic.memoryRules)
    ? topic.memoryRules.map(rule => `<li>${escapeHtml(rule)}</li>`).join("")
    : "";

  const questions = Array.isArray(topic.helpQuestions)
    ? topic.helpQuestions.map(question => `<li>${escapeHtml(question)}</li>`).join("")
    : "";

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card memory-card" style="${getTopicColorStyle(topic.id)}" data-readable="true">
      <div class="symbol-heading">
        <span class="access-box-symbol" aria-hidden="true">${getIconHtml("remember")}</span>
        <h2>${escapeHtml(topic.title)}</h2>
      </div>

      <div class="memory-section">
        <h3>Das merke ich mir:</h3>
        <ol>${rules}</ol>
      </div>

      <div class="memory-section">
        <h3>Das kann ich fragen:</h3>
        <ul>${questions}</ul>
      </div>

      <p class="memory-help">Ich muss Probleme nicht allein lösen.</p>
      <p>Ich kann eine Person fragen, der ich vertraue.</p>

      <div class="certificate-actions">
        <button type="button" class="quiz-link quiz-button" onclick="window.print()">Merk-Karte drucken</button>
        <button type="button" class="nav-button secondary" onclick="renderTopicChoice('${escapeHtml(topic.id)}')">Zurück zum Thema</button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

/* ============================================================
   Navigation
   ============================================================ */

function goBack() {
  if (!currentTopicId) return renderMenu();

  const topic = getCurrentTopic();
  const lessons = getLessonsForMode(topic, currentMode);

  if (lessons.length && currentStep > 0) {
    currentStep -= 1;
    pageDirection = "back";
    renderLesson();
    return;
  }

  /* Bei Schritt 0: zurück zur Einstiegsfrage (wenn vorhanden), sonst Themenauswahl */
  if (topic && topic.selfAssessment) {
    renderSelfAssessment();
  } else {
    renderTopicChoice(currentTopicId);
  }
}

function goNext() {
  const topic = getCurrentTopic();
  if (!topic) return renderMenu();

  const lessons = getLessonsForMode(topic, currentMode);
  if (lessons.length) {
    if (currentStep < lessons.length - 1) {
      currentStep += 1;
      pageDirection = "forward";
      renderLesson();
    } else {
      renderMiniCheck(topic.id);
    }
    return;
  }
  renderTopicChoice(topic.id);
}

/* ============================================================
   Alle Merk-Karten – druckbare Übersicht aller 12 Themen
   Route: index.html#merk-alle
   ============================================================ */

function renderAllMemoryCards() {
  stopReading();
  currentTopicId = null;
  setProgressVisible(false);
  setBottomNavVisible(false);
  setHeader("Alle Merk-Karten", "Übersicht", "Alle Themen", "Drucken", 100);
  setActiveTab("lernweg");
  setOrientation("Du bist auf der Seite: Alle Merk-Karten.");
  rememberRoute("merk-alle");
  showNav(false, false);

  const allCards = topics.map(topic => {
    const rules = Array.isArray(topic.memoryRules)
      ? topic.memoryRules.map(r => `<li>${escapeHtml(r)}</li>`).join("")
      : "";
    const questions = Array.isArray(topic.helpQuestions)
      ? topic.helpQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join("")
      : "";
    return `
      <div class="print-memory-card" style="${getTopicColorStyle(topic.id)}">
        <div class="print-memory-header">
          <span class="print-memory-icon" aria-hidden="true">${getIconHtml(topic.icon || "remember")}</span>
          <h2>${escapeHtml(topic.title)}</h2>
        </div>
        ${rules ? `<div class="print-memory-rules"><h3>Das merke ich mir:</h3><ol>${rules}</ol></div>` : ""}
        ${questions ? `<div class="print-memory-questions"><h3>Das kann ich fragen:</h3><ul>${questions}</ul></div>` : ""}
      </div>`;
  }).join("");

  content.innerHTML = `
    <section class="all-memory-page">
      <div class="all-memory-toolbar no-print">
        <button type="button" class="plain-back-button" onclick="renderMenu()">← Zur Themenübersicht</button>
        <button type="button" class="quiz-link quiz-button" onclick="window.print()">Alle drucken</button>
      </div>
      <h2 class="all-memory-heading no-print">Alle Merk-Karten</h2>
      <p class="all-memory-intro no-print">Alle 12 Themen auf einen Blick. Du kannst diese Seite ausdrucken.</p>
      <div class="print-memory-grid">${allCards}</div>
    </section>
  `;
  focusContent();
}

/* Direkter Einstieg über Link, zum Beispiel:
   index.html#thema-datenschutz
   index.html#thema-datenschutz:kurz
   index.html#thema-datenschutz:quiz
   index.html#thema-datenschutz:merk
   Die alte Form ohne „thema-" wird weiter angenommen. */
const TOPIC_ROUTE_PREFIX = "thema-";
function topicRoute(topicId, action) {
  return TOPIC_ROUTE_PREFIX + topicId + (action ? ":" + action : "");
}

function openTopicRoute(topicId, action) {
  if (action === "kurz" || action === "short") return startTopicMode(topicId, "short");
  if (action === "quiz") return startQuiz(topicId);
  if (action === "merk" || action === "memory") return renderMemoryCard(topicId);
  if (action === "uebung") return startScenario(topicId);
  return renderTopicChoice(topicId);
}

function handleHash() {
  handlingRoute = true;
  try {
    const hash = decodeURIComponent(window.location.hash.replace("#", "").trim());
    if (!hash) {
      /* Beim Öffnen immer die kurze Intro-Startseite. „Los geht's" führt
         ins Onboarding (erster Besuch) oder zu den Themen. */
      return renderIntro();
    }

    /* Hauptmenü-Seiten */
    if (hash === "start") return renderIntro();
    if (hash === "themen") return renderMenu();
    if (hash === "lernweg") return renderMyPath();
    if (hash === "hilfe") return renderHelpPage();
    if (hash === "einstellungen") return renderSettingsPage();

    /* Themen-Routen tragen seit Prüfbericht B11 das Präfix „thema-".
       Vorher hießen Thema und Menüpunkt beide „hilfe": Wer das Thema
       „Hilfe bei Problemen" öffnete, bekam beim Neuladen, über ein
       Lesezeichen oder über die gedruckte QR-Karte die Hilfe-SEITE.
       Die alte Form ohne Präfix wird weiter angenommen (unten), damit
       schon gedruckte Karten der übrigen Themen gültig bleiben. */
    if (hash.startsWith(TOPIC_ROUTE_PREFIX)) {
      const rest = hash.slice(TOPIC_ROUTE_PREFIX.length);
      const [tid, act] = rest.split(":");
      if (getTopicById(tid)) return openTopicRoute(tid, act);
      return renderMenu();
    }

    /* Sonderrouten */
    if (hash === "grosses-quiz") return startBigQuiz();
    if (hash === "wiederholen") return startRepeatQuiz();
    if (hash === "meine-karte") return renderRegelKarte();
    if (hash === "training") return startTrainingInbox();
    if (hash === "merk-alle") return renderAllMemoryCards();
    if (hash === "uebung") return renderScenarioChooser();

    /* Alte Form ohne Präfix – bleibt für schon gedruckte QR-Karten gültig. */
    const [topicId, action] = hash.split(":");
    if (!getTopicById(topicId)) return renderMenu();
    return openTopicRoute(topicId, action);
  } finally {
    handlingRoute = false;
  }
}

/* ============================================================
   Ereignisse
   ============================================================ */

backButton.addEventListener("click", goBack);
nextButton.addEventListener("click", goNext);

/* Hauptmenü (Tab-Leiste) */
document.querySelectorAll(".main-tabbar .tab-item").forEach((item) => {
  item.addEventListener("click", () => navigateTab(item.dataset.tab));
});

/* Browser-Zurück/-Vor: gleiche Route-Logik wie beim direkten Einstieg.
   Gebündelt, weil hashchange und popstate zusammen feuern können. */
let hashHandleQueued = false;
function scheduleHandleHash() {
  if (hashHandleQueued) return;
  hashHandleQueued = true;
  setTimeout(() => { hashHandleQueued = false; handleHash(); }, 0);
}
window.addEventListener("popstate", scheduleHandleHash);

if (soundToggleButton) {
  soundToggleButton.addEventListener("click", toggleSound);
  updateSoundButton();
}

if (motionToggleButton) {
  motionToggleButton.addEventListener("click", toggleMotion);
}

document.addEventListener("mouseover", playHoverSound, true);
document.addEventListener("focusin", playHoverSound, true);

/* Vorlese-Knöpfe in Karten: Karte darf sich dabei nicht öffnen. */
function handleReadCardEvent(event) {
  const button = event.target.closest("[data-read-card-text], [data-read-card-title]");
  if (!button) return;

  if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const text = button.getAttribute("data-read-card-text") || button.getAttribute("data-read-card-title");
  /* Die Karte ist jetzt GESCHWISTER des Vorlese-Knopfes (nicht mehr Elternteil):
     closest() findet sie nicht mehr, deshalb der Griff ueber das Paar-Element.
     Damit bleibt die Hervorhebung beim Mitlesen auf der Karte. */
  let block = button.closest(".ls-text-block, .ls-bullet-block, .access-box, .action-card, .topic-card, .sample-option, .language-card");
  if (!block) {
    const pair = button.closest(".card-read-pair");
    if (pair) block = pair.querySelector(".topic-card, .action-card, .sample-option");
  }
  readShortText(text, block);
}

document.addEventListener("click", handleReadCardEvent, true);
document.addEventListener("keydown", handleReadCardEvent, true);

/* Sanfter Übergang bei JEDEM Seitenwechsel (nicht nur beim Blättern in
   Lektionen): Sobald der Inhalt ausgetauscht wird, blendet die neue Seite
   weich ein. So ist auch der Wechsel von „Los geht's" zu den Themen, von
   Thema zu Lektion usw. gut nachvollziehbar (§3 Vorhersehbarkeit, Orientierung).
   Bei „weniger Bewegung" ist es über die globale CSS-Regel automatisch aus. */
if (content && "MutationObserver" in window) {
  const viewObserver = new MutationObserver(() => {
    /* Lektionen blättern schon selbst seitlich – dort nur sanft überblenden,
       sonst (Startseite, Themen, Quiz …) Einblenden mit kleiner Aufwärts-Bewegung. */
    const isLesson = !!content.querySelector(".page-flip");
    const cls = isLesson ? "view-enter-fade" : "view-enter";
    content.classList.remove("view-enter", "view-enter-fade");
    /* Reflow erzwingen, damit die Animation neu startet. */
    void content.offsetWidth;
    content.classList.add(cls);
  });
  viewObserver.observe(content, { childList: true });
}

/* Escape schließt Overlays. */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeCalmOverlay();
    hideGlossar();
  }
});

/* ============================================================
   Nachgelieferte Übungen einhängen (uebungen-de.js)
   Ergaenzt lesson.practice dort, wo noch keine Uebung steht.
   Eine vorhandene Uebung wird NIE ueberschrieben – topics.js
   bleibt die Quelle der Wahrheit, das hier ist nur ein Nachtrag.
   Laeuft einmal beim Start, vor dem ersten Rendern.
   ============================================================ */
function applyExtraPractice() {
  if (typeof EXTRA_PRACTICE === "undefined" || !EXTRA_PRACTICE) return 0;
  if (typeof topics === "undefined" || !Array.isArray(topics)) return 0;
  let gesetzt = 0;
  topics.forEach(topic => {
    const gruppe = EXTRA_PRACTICE[topic.id];
    if (!gruppe) return;
    const einhaengen = (liste, quelle) => {
      if (!Array.isArray(liste) || !quelle) return;
      liste.forEach(lesson => {
        if (!lesson || lesson.practice) return;
        const p = quelle[lesson.title];
        if (p) { lesson.practice = p; gesetzt++; }
      });
    };
    einhaengen(topic.lessons, gruppe.lessons);
    einhaengen(topic.einfachLessons, gruppe.kurz);
  });
  return gesetzt;
}

/* Glossar initialisieren */
applyExtraPractice();

initGlossar();
initGlossarEvents();

/* Profile laden (oder beim ersten Mal anlegen und vorhandene Einstellungen
   übernehmen), dann die Einstellungen des aktiven Profils anwenden. */
ensureProfiles();
loadDeviceShared();
loadActiveProfileSettings();
/* Zuletzt offene Lektion und Mengen-Wahl zurückholen (B5, B9) – erst hier,
   weil dafür sowohl die Themen als auch das aktive Profil stehen müssen. */
loadLastLesson();
loadTopicAmounts();

/* Wenn Nutzer das System-Theme wechselt: Seite neu rendern,
   damit die themenspezifischen Inline-Farben (getTopicColorStyle)
   auf die Dark-Mode-Palette umschalten. */
if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    /* Aktuelle Ansicht neu laden – ohne Seitenwechsel */
    if (currentTopicId) {
      /* Inline-Styles auf sichtbaren Karten per querySelectorAll neu setzen */
      const style = getTopicColorStyle(currentTopicId);
      document.querySelectorAll("[style*='--topic-color']").forEach(el => {
        el.setAttribute("style", style);
      });
    }
    /* Topic-Karten auf der Startseite (falls gerade sichtbar) */
    document.querySelectorAll(".topic-card[style]").forEach(el => {
      const id = [...el.classList].find(c => c.startsWith("topic-") && c !== "topic-card" && !c.endsWith("--done"));
      if (id) el.setAttribute("style", getTopicColorStyle(id.replace("topic-", "")));
    });
  });
}

/* ============================================================
   Offline-Banner
   ============================================================ */

function showOfflineBanner() {
  if (document.getElementById("offline-banner")) return;
  const banner = document.createElement("div");
  banner.id = "offline-banner";
  banner.setAttribute("role", "alert");
  banner.setAttribute("aria-live", "assertive");
  banner.innerHTML = `
    <span class="offline-icon" aria-hidden="true">📵</span>
    <span>Du bist gerade offline. Gespeicherte Seiten funktionieren noch.</span>
    <button type="button" class="offline-close" onclick="hideOfflineBanner()" aria-label="Hinweis schließen">✕</button>
  `;
  document.body.prepend(banner);
}

function hideOfflineBanner() {
  const banner = document.getElementById("offline-banner");
  if (banner) banner.remove();
}

window.addEventListener("offline", showOfflineBanner);
window.addEventListener("online",  hideOfflineBanner);

/* Beim Start prüfen, ob bereits offline */
if (!navigator.onLine) showOfflineBanner();

document.addEventListener("DOMContentLoaded", handleHash);
/* hashchange und popstate können beim Browser-Zurück gleichzeitig feuern.
   scheduleHandleHash bündelt beide zu genau einem Neuaufbau. */
window.addEventListener("hashchange", scheduleHandleHash);

/* =============================================================
   DEINE KARTE – die 13 Regeln sammeln
   -------------------------------------------------------------
   Stand 04.09.2026. Abgetrennter Block, in einem Stueck entfernbar.
   Daten: regeln-de.js (REGELN, regelZuSatz, regelById).

   Zwei Stufen je Regel:
     GEFUNDEN  in 1 Thema richtig angewendet
     SITZT     in einem ZWEITEN Thema wiedergefunden -> Transfer

   Gezaehlt wird nur, was die Person TUT (richtige Antwort in
   Uebung, Quiz oder Uebungs-Handy), nicht was sie liest.
   Speicherung wie sessionDoneTopics: Arbeitsspeicher, und nur
   mit Einwilligung zusaetzlich im Lernstand (KDG, §14).
   ============================================================= */

/* { regelId: { themaId: true } } – nur Arbeitsspeicher. */
let sessionRegeln = {};

function ladeRegelStand() {
  const stand = {};
  Object.keys(sessionRegeln).forEach(function (rid) {
    stand[rid] = Object.assign({}, sessionRegeln[rid]);
  });
  if (isProgressEnabled()) {
    const p = loadProgress();
    const gespeichert = (p && p.regeln) || {};
    Object.keys(gespeichert).forEach(function (rid) {
      stand[rid] = stand[rid] || {};
      (gespeichert[rid] || []).forEach(function (t) { stand[rid][t] = true; });
    });
  }
  return stand;
}

function regelThemen(regelId) {
  const stand = ladeRegelStand();
  return Object.keys(stand[regelId] || {});
}

/* 0 = noch nicht gefunden, 1 = gefunden, 2 = sitzt */
function regelStufe(regelId) {
  const n = regelThemen(regelId).length;
  return n === 0 ? 0 : (n === 1 ? 1 : 2);
}

function regelZaehlung() {
  let gefunden = 0, sitzt = 0;
  REGELN.forEach(function (r) {
    const s = regelStufe(r.id);
    if (s >= 1) gefunden++;
    if (s === 2) sitzt++;
  });
  return { gefunden: gefunden, sitzt: sitzt, gesamt: REGELN.length };
}

/* Traegt eine angewendete Regel ein. Gibt zurueck, was sich geaendert hat:
   null | { regel, neu: true } | { regel, jetztSicher: true } */
function regelAnwenden(satz, themaId) {
  if (typeof regelZuSatz !== "function") return null;
  return regelAnwendenId(regelZuSatz(satz), themaId);
}

/* Gleiche Wirkung, aber mit fertiger Regel-Kennung – fuer das Quiz,
   das seine Regel ueber regelAusQuizfrage() streng ermittelt. */
function regelAnwendenId(rid, themaId) {
  if (!rid || !themaId) return null;
  const vorher = regelStufe(rid);

  sessionRegeln[rid] = sessionRegeln[rid] || {};
  sessionRegeln[rid][themaId] = true;

  if (isProgressEnabled()) {
    const p = loadProgress() || { enabled: true, done: {} };
    p.regeln = p.regeln || {};
    const liste = p.regeln[rid] || [];
    if (liste.indexOf(themaId) === -1) {
      liste.push(themaId);
      p.regeln[rid] = liste;
      saveProgress(p);
    }
  }

  const nachher = regelStufe(rid);
  if (nachher === vorher) return null;
  const regel = regelById(rid);
  if (!regel) return null;
  return nachher === 1 ? { regel: regel, neu: true } : { regel: regel, jetztSicher: true };
}

/* Rueckmeldung im Feedback – der Belohnungsmoment. Traegt gleichzeitig ein.
   Nur bei richtiger Antwort aufrufen. */
function regelHinweisHtml(satz, themaId) {
  return regelHinweisHtmlId((typeof regelZuSatz === "function") ? regelZuSatz(satz) : null, themaId);
}

function regelHinweisHtmlId(rid, themaId) {
  const erg = regelAnwendenId(rid, themaId);
  if (!erg) return "";
  const bild = getPictogramHtml ? getPictogramHtml(erg.regel.pikto) : "";
  const z = regelZaehlung();
  if (erg.neu) {
    return `
      <div class="regel-treffer" role="status">
        <p class="regel-treffer-kopf">Neue Regel für deine Karte</p>
        <div class="regel-treffer-zeile">
          ${bild}
          <p class="regel-treffer-satz">${escapeHtml(erg.regel.kurz)}</p>
        </div>
        <p class="regel-treffer-stand">Du hast ${z.gefunden} von ${z.gesamt} Regeln.</p>
      </div>`;
  }
  return `
    <div class="regel-treffer regel-treffer--sicher" role="status">
      <p class="regel-treffer-kopf">Diese Regel sitzt jetzt</p>
      <div class="regel-treffer-zeile">
        ${bild}
        <p class="regel-treffer-satz">${escapeHtml(erg.regel.kurz)}</p>
      </div>
      <p class="regel-treffer-stand">Du hast sie in zwei Themen wiedererkannt. ${z.sitzt === 1 ? "1 von " + z.gesamt + " Regeln sitzt." : z.sitzt + " von " + z.gesamt + " Regeln sitzen."}</p>
    </div>`;
}

/* Piktogramm einer Regel als Bild. Nutzt den vorhandenen Resolver. */
function getPictogramHtml(key) {
  if (!key || typeof pictoSrc !== "function") return "";
  return `<img class="regel-pikto" src="${pictoSrc(key)}" alt="" aria-hidden="true" />`;
}

/* ---- Die Sammlung ansehen ---- */

function renderRegelKarte() {
  stopReading();
  currentTopicId = null;
  setProgressVisible(false);
  setBottomNavVisible(false);
  showNav(false, false);
  const z = regelZaehlung();
  setHeader("Deine Karte", "Deine Regeln", "Deine Karte", `${z.sitzt} von ${z.gesamt} sitzen`, Math.round((z.sitzt / z.gesamt) * 100));
  setOrientation(`Du bist auf der Seite: Deine Karte. Du hast ${z.gefunden} von ${z.gesamt} Regeln gefunden.`);
  rememberRoute("meine-karte");

  /* Gesammelte zuerst, offene als kompakter Block darunter: Die Person
     sieht ihre Sammlung am Stueck und die Luecke als eine Aussage –
     nicht sechs Mal denselben Platzhalter-Satz. */
  const gefundeneRegeln = REGELN.filter(function (r) { return regelStufe(r.id) >= 1; });
  const offeneRegeln    = REGELN.filter(function (r) { return regelStufe(r.id) === 0; });

  const plaetze = gefundeneRegeln.map(function (r) {
    const stufe = regelStufe(r.id);
    const themen = regelThemen(r.id)
      .map(function (t) { const x = getTopicById(t); return x ? x.title : null; })
      .filter(Boolean);
    return `
      <li class="regel-platz ${stufe === 2 ? "regel-platz--sitzt" : "regel-platz--gefunden"}">
        ${getPictogramHtml(r.pikto)}
        <span class="regel-platz-text">
          <span class="regel-platz-satz">${escapeHtml(r.kurz)}</span>
          <span class="regel-platz-sub">${escapeHtml(r.was)}</span>
          <span class="regel-platz-stand">${stufe === 2
            ? "Sitzt. Wiedererkannt in: " + escapeHtml(themen.join(", "))
            : "Gefunden in: " + escapeHtml(themen.join(", ")) + ". Finde sie in einem zweiten Thema wieder, dann sitzt sie."}</span>
        </span>
      </li>`;
  }).join("");

  const offeneHtml = offeneRegeln.length === 0 ? "" : `
    <section class="regel-offen" aria-label="Noch offen">
      <h3>Noch offen: ${offeneRegeln.length} ${offeneRegeln.length === 1 ? "Regel" : "Regeln"}</h3>
      <p class="regel-offen-text">Diese Plätze füllst du beim Üben. Du bekommst die Regeln nicht gesagt – du findest sie.</p>
      <ul class="regel-offen-reihe">
        ${offeneRegeln.map(function () {
          return `<li class="regel-offen-platz" aria-hidden="true">?</li>`;
        }).join("")}
      </ul>
    </section>`;

  const offen = z.gesamt - z.gefunden;
  const einleitung = z.gefunden === 0
    ? "Hier sammelst du deine Regeln. Du bekommst sie nicht geschenkt. Du findest sie beim Üben."
    : (offen > 0
        ? `Dir fehlen noch ${offen} ${offen === 1 ? "Regel" : "Regeln"}.`
        : (z.sitzt < z.gesamt
            ? "Du hast alle Regeln gefunden. Jetzt erkenne sie in einem zweiten Thema wieder."
            : "Alle Regeln sitzen. Das ist deine Karte."));

  content.innerHTML = `
    ${buildToolRow()}
    <article class="card" data-readable="true">
      <div class="symbol-heading">
        <span class="access-box-symbol" aria-hidden="true">${getIconHtml("remember")}</span>
        <h2>Deine Karte</h2>
      </div>
      <p>${escapeHtml(einleitung)}</p>

      <div class="regel-stand" role="region" aria-label="Dein Stand">
        <div class="regel-stand-zahlen">
          <span class="regel-stand-zahl" aria-live="polite">${z.gefunden}</span>
          <span class="regel-stand-von">von ${z.gesamt} Regeln gefunden</span>
        </div>
        <div class="regel-stand-balken" role="progressbar" aria-valuenow="${z.gefunden}" aria-valuemin="0" aria-valuemax="${z.gesamt}" aria-label="${z.gefunden} von ${z.gesamt} Regeln gefunden">
          <div class="regel-stand-fuell" style="width:${Math.round((z.gefunden / z.gesamt) * 100)}%"></div>
        </div>
        <p class="regel-stand-sitzt">${z.sitzt === 1 ? "Davon sitzt 1." : "Davon sitzen " + z.sitzt + "."} Eine Regel sitzt, wenn du sie in zwei Themen wiedererkannt hast.</p>
      </div>

      ${plaetze ? `<h3 class="regel-abschnitt">Das hast du gesammelt</h3>
      <ol class="regel-liste">${plaetze}</ol>` : ""}
      ${offeneHtml}

      <div class="certificate-actions">
        ${z.gefunden > 0 ? `<button type="button" class="quiz-link quiz-button" onclick="druckeRegelKarte()">🖨 Deine Karte drucken</button>` : ""}
        <button type="button" class="nav-button secondary" onclick="renderScenarioChooser()">Üben und Regeln finden</button>
        <button type="button" class="nav-button secondary" onclick="renderMyPath()">Zurück zu Mein Lernweg</button>
      </div>
    </article>
  `;
  focusContent();
  renderLegalFooter();
}

/* ---- Die Karte drucken: klein genug fuer die Brieftasche ---- */

function druckeRegelKarte() {
  const z = regelZaehlung();
  const gefundene = REGELN.filter(function (r) { return regelStufe(r.id) >= 1; });
  if (!gefundene.length) return;

  const zeilen = gefundene.map(function (r) {
    return `<li class="${regelStufe(r.id) === 2 ? "sitzt" : ""}"><strong>${escapeHtml(r.kurz)}</strong><br /><span>${escapeHtml(r.was)}</span></li>`;
  }).join("");

  const heute = new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
  const fenster = window.open("", "_blank");
  if (!fenster) return;
  fenster.document.write(
    `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8" />` +
    `<title>Deine Karte – meine Regeln im Internet</title>` +
    `<style>
       @page { size: A5; margin: 12mm; }
       body { font-family: "Atkinson Hyperlegible", "Segoe UI", Arial, sans-serif; color: #16222e; line-height: 1.5; }
       h1 { font-size: 20pt; margin: 0 0 2mm; }
       .unter { font-size: 11pt; color: #3d506a; margin: 0 0 6mm; }
       ol { padding-left: 6mm; margin: 0; }
       li { margin-bottom: 4mm; font-size: 11pt; break-inside: avoid; }
       li strong { font-size: 12pt; }
       li span { color: #3d506a; }
       li.sitzt strong::after { content: " ✓"; }
       .fuss { margin-top: 8mm; border-top: 1pt solid #d7e0ea; padding-top: 3mm; font-size: 9pt; color: #3d506a; }
       .name { margin: 6mm 0; font-size: 11pt; }
       .name span { display: inline-block; border-bottom: 1pt solid #16222e; width: 60mm; }
     </style></head><body>` +
    `<h1>Meine Regeln im Internet</h1>` +
    `<p class="unter">${z.gefunden} von ${z.gesamt} Regeln gefunden. ${z.sitzt === 1 ? "Davon sitzt 1." : "Davon sitzen " + z.sitzt + "."} Ein Haken bedeutet: in zwei Themen wiedererkannt.</p>` +
    `<p class="name">Diese Karte gehört: <span></span></p>` +
    `<ol>${zeilen}</ol>` +
    `<p class="fuss">Stand: ${escapeHtml(heute)} · Alex und Tilda – Sicher und selbstbestimmt im Internet<br />` +
    `Du bist unsicher? Zeig diese Karte einer Person, der du vertraust.</p>` +
    `</body></html>`
  );
  fenster.document.close();
  fenster.focus();
  setTimeout(function () { fenster.print(); }, 300);
}
