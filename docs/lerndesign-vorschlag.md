# Lerndesign-Vorschlag: ein Seiten-Rahmen für die Lernplattform

**Stand:** 08.09.2026
**Status:** Vorschlag zur Freigabe — **es wurde noch nichts geändert**
**Zweck:** Beschreibt, wie die drei heute mehrfach gebauten Orientierungs-Bausteine
(Ort-Satz, Fortschritt, Merksatz) zu je einem Baustein zusammengeführt werden —
beginnend mit **einem** Pilot-Screen, ohne eine einzige Inhaltsdatei anzufassen.

> **Nichts an Inhalten.** Dieser Vorschlag betrifft ausschließlich `app.js` und
> `styles.css`. Die Inhaltsdateien und die Sprachstufen bleiben Byte für Byte
> gleich — siehe Abschnitt 5 mit Prüfsummen zum Nachrechnen.

---

## 0. Woraus dieser Vorschlag abgeleitet ist

Jede Entscheidung unten hängt an einer Fundstelle, nicht an Geschmack.

| Grundlage | Was daraus folgt |
|---|---|
| `CLAUDE.md` §1 (Bestandsschutz) | Kein Baustein wird entfernt. Der Umbau ist **additiv**: neue Bausteine entstehen neben den alten, die alten fallen erst weg, wenn kein Aufrufer mehr da ist (Stufe 5). |
| `CLAUDE.md` §3 (CLT, Signaling, UDL) | Ein Konzept pro Bildschirm. Heute konkurrieren auf dem Lernschritt **drei** Fortschritts-Mechaniken um dieselbe Frage „wo bin ich?". Das ist Extraneous Load. |
| `CLAUDE.md` §3 (Vorhersehbarkeit, Došen) | Gleiche Dinge müssen auf jedem Screen gleich aussehen und an derselben Stelle stehen. Sieben handkopierte Merksatz-Kästen können auseinanderlaufen — und sind es teilweise schon. |
| `CLAUDE.md` §9 (WCAG 2.2 AA, COGA) | Fokus, Tastatur, `Escape`, Kontrast, Ziel≥58 px bleiben unverändert. Der Rahmen macht sie an **einer** Stelle prüfbar statt an 49. |
| `CLAUDE.md` §12 (Modul-Aufbau) | Die Reihenfolge Lernziel → ein Konzept → Merksatz → Warnsignale → Quiz → Transfer bleibt exakt wie sie ist. Der Rahmen schreibt sie nur fest, statt sie 49-mal von Hand zu wiederholen. |
| `CLAUDE.md` §13/§14 (Partizipation, KDG) | Kein neues Speichern, kein Tracker, kein externer Aufruf. Vor dem Ausrollen steht die Prüfgruppe (Stufe 3), nicht der nächste Umbau. |
| `CLAUDE.md` §17 (Checkliste vor Push) | Wird pro Stufe abgearbeitet; die zwei veralteten Zeilen darin sind separat zu fixen (Abschnitt 7). |
| `docs/EXPERTENGUTACHTEN.md` R-K1, R-D2, R-U1, R-U2 | Verlangen genau **eine** verbale plus visuelle Schritt-Anzeige („Schritt 3 von 7 · [====50%====]") und einen „Du bist hier"-Hinweis. Beides existiert heute — aber verteilt auf drei Stellen. |
| `docs/EXPERTENGUTACHTEN.md` R-K3 | „Merk-Karten auch innerhalb der Lektion zeigen, als hervorgehobene Box." Umgesetzt — aber siebenfach kopiert. |
| `docs/MERKSATZ_DIDAKTIK_FIX_PRUEFBERICHT.md` | Hat schon einmal repariert, dass „Merksatz optisch doppelt angezeigt" wurde und die Anzeige uneinheitlich war. Die Ursache — kein gemeinsamer Baustein — besteht fort. Ein Baustein verhindert den Rückfall. |
| `docs/KONZEPT_3_SPRACHSTUFEN.md` §2 (Fallback) | Die Fallback-Kette `standard → einfach → leicht` bleibt unangetastet. Der Rahmen ruft `resolveLessonContent()` unverändert auf. |
| `docs/GAMIFICATION_ARBEITSSTAND_GEPRUEFT_2026-09-04.md` §6 | „Nicht bauen. Zuerst hinsehen." Deshalb: **ein** Pilot-Screen, dann Beobachtung, dann erst der Rest. Nicht zwölf Screens auf einmal. |

---

## 1. Der Befund in drei Sätzen

1. **Es gibt keinen Seiten-Rahmen.** Alle 49 Screens wiederholen von Hand dieselbe
   Sequenz: `stopReading()` → `setProgressVisible()` (46×) → `setBottomNavVisible()`
   → `setHeader()` (51×) → `setActiveTab()` → `setOrientation()` (38×) →
   `rememberRoute()` → `showNav()` (42×) → `content.innerHTML = …` (49×) →
   `focusContent()` (51×) → `renderLegalFooter()` (49×). Wer einen Schritt
   vergisst, merkt es nur durch Hinsehen.
2. **Fortschritt wird dreifach beantwortet.** Die globale `.progress-area` aus
   `index.html` (gefüttert von `setHeader()`) ist auf dem Lernschritt per
   `setProgressVisible(false)` **abgeschaltet**; stattdessen läuft
   `buildStepPath()` (`app.js:4048`); auf der Abschluss-Seite noch einmal
   `buildCompletionProgress()` (`app.js:4395`).
3. **Der Merksatz ist siebenmal von Hand gebaut.** Immer
   `<div class="access-box remember remember-box">` — in `renderLesson` (:4166),
   `renderPracticeFeedbackPage` (:4320), `renderCompletionPage` (:4606, :4675),
   `renderTrainingMessage` (:5344, :5355, :5359), `renderTrainingResult`
   (:5528, :5532). Keine Hilfsfunktion, wechselnde Überschriften.

Der Ort-Satz ist der Gegenbeweis und das Vorbild: `setOrientation()`
(`app.js:1068`) ist **eine** Funktion, die Farbe, Symbol, Satz und Hör-Knopf
zusammen ausgibt — und funktioniert deshalb auf allen 38 Aufrufstellen gleich.
Was für den Ort-Satz gilt, soll auch für Fortschritt und Merksatz gelten.

---

## 2. Pilot-Screen: der Lernschritt

Pilot ist **`renderLesson()`** (`app.js:4066`) — der meistbesuchte Screen und der
einzige, auf dem alle drei Bausteine zugleich vorkommen.

### 2.1 Heute (Ist-Zustand, maßstäblich skizziert)

```
┌──────────────────────────────────────────────────┐
│ Sicher und selbstbestimmt im Internet    [h1]    │  ← index.html, setHeader()
│ Kurz lernen                              [p]     │
├──────────────────────────────────────────────────┤
│ ▌[◆] Du lernst: Datenschutz. Das ist    [🔊]     │  ← #orientLine, setOrientation()
│ ▌ Schritt 3 von 5.                               │     Farbfaden + Symbol + Hör-Knopf
├──────────────────────────────────────────────────┤
│ .progress-area  →  A U S G E B L E N D E T       │  ← setProgressVisible(false)
│ (Themenübersicht · Wähle ein Thema · [====])     │     existiert, wird nie gezeigt
├──────────────────────────────────────────────────┤
│ [A] [A+] [A++]   [🔊 Vorlesen]  [⏹ Stopp]        │  ← buildToolRow()
│                                                  │
│ [=========55%=========------]                    │  ← buildStepPath()   ZWEITE Antwort
│ 2 geschafft · noch 2 Schritte                    │     auf dieselbe Frage
│                                                  │
│ ┌ Jetzt geht es um: Passwort ─────────────────┐  │  ← moduleBadge
│ └──────────────────────────────────────────────┘ │
│ ┌ .card.lesson-card ──────────────────────────┐  │
│ │ [◆] Was ist ein sicheres Passwort?          │  │
│ │ [Illustration]                              │  │
│ │ [pikto] Ein Passwort ist wie ein Schlüssel.  │  │
│ │ [pikto] Es gehört nur dir.            [🔊]   │  │
│ │ • Punkt 1  • Punkt 2                  [🔊]   │  │
│ │ ┌ Beispiele aus dem Alltag ──────────[🔊]─┐ │  │
│ │ ┌ Achtung ───────────────────────────[🔊]─┐ │  │
│ │ ┌ Wichtig ───────────────────────────[🔊]─┐ │  │  ← Merksatz, HANDKOPIE 1 von 7
│ │ │ Mein Passwort sage ich niemandem.       │ │  │
│ │ └─────────────────────────────────────────┘ │  │
│ │ ┌ Übung ──────────────────────────────────┐ │  │
│ └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│ [ Zurück ]                        [ Weiter ]     │  ← .nav
├──────────────────────────────────────────────────┤
│ [Logo Tilbeck/Alexianer]  [Logo Sozialstiftung]  │  ← Footer
├──────────────────────────────────────────────────┤
│ Start │ Themen │ Mein Lernweg │ Hilfe │ Einstell.│  ← main-tabbar (fest)
└──────────────────────────────────────────────────┘
```

**Was daran stört:** Ort („Schritt 3 von 5") und Weg (der Balken) stehen 100 px
und eine Werkzeugleiste auseinander, weil der eine außerhalb, der andere
innerhalb von `#content` lebt. Eine Person mit Lern-Schwierigkeiten muss zwei
Stellen verbinden, um eine Frage zu beantworten. Dazwischen liegt eine tote,
ausgeblendete `.progress-area`, die dieselbe Auskunft ein drittes Mal geben
wollte.

### 2.2 Vorschlag (Soll-Zustand)

```
┌──────────────────────────────────────────────────┐
│ Sicher und selbstbestimmt im Internet    [h1]    │  unverändert
│ Kurz lernen                              [p]     │
├──────────────────────────────────────────────────┤
│ ╔══ WEGWEISER ═══════════════════════════════╗   │  EIN Block: Ort + Weg
│ ▌[◆] Du lernst: Datenschutz.          [🔊]   ║   │  ← setOrientation() unverändert,
│ ▌    Das ist Schritt 3 von 5.                ║   │     nur räumlich zusammengezogen
│ ▌ [=========55%=========------]              ║   │  ← buildProgress()  EINE Antwort
│ ▌ 2 geschafft · noch 2 Schritte              ║   │
│ ╚══════════════════════════════════════════════╝ │
├──────────────────────────────────────────────────┤
│ [A] [A+] [A++]   [🔊 Vorlesen]  [⏹ Stopp]        │  buildToolRow() unverändert
│                                                  │
│ ┌ Jetzt geht es um: Passwort ─────────────────┐  │  moduleBadge unverändert
│ └──────────────────────────────────────────────┘ │
│ ┌ .card.lesson-card ──────────────────────────┐  │
│ │ … Inhalt Zeichen für Zeichen unverändert …  │  │
│ │ ┌ Wichtig ───────────────────────────[🔊]─┐ │  │  ← buildMerksatz()
│ │ │ Mein Passwort sage ich niemandem.       │ │  │     EIN Baustein, 7 Aufrufer
│ │ └─────────────────────────────────────────┘ │  │
│ └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│ [ Zurück ]                        [ Weiter ]     │  unverändert
│ [Logos] · [5-Punkte-Tab-Leiste]                  │  unverändert
└──────────────────────────────────────────────────┘
```

**Drei Änderungen, mehr nicht:**

1. **Ort und Weg rücken zusammen** zu einem Wegweiser-Block. Der Ort-Satz behält
   Wortlaut, Farbfaden, Symbol, Hör-Knopf und `aria-live="polite"`. Der Balken
   behält Text, `role="progressbar"` und `aria-valuetext`. Es verschwindet nichts —
   sie stehen nur nebeneinander statt getrennt.
2. **Eine Fortschritts-Funktion** statt drei. `buildProgress()` deckt Lernschritt,
   Abschluss und die bisher tote `.progress-area` ab.
3. **Ein Merksatz-Baustein.** `buildMerksatz(titel, text)` gibt exakt das aus,
   was heute in `renderLesson` steht — die anderen sechs Kopien rufen ihn ab
   Stufe 4 auf und gleichen sich dadurch an.

**Nicht Teil dieses Vorschlags:** neue Farben, neue Wörter, neue Screens, neue
Reihenfolge, Wegzeichen-Figuren (§18.7 — die brauchen zuerst die Prüfgruppe),
Kurz-Modus-Umfang, Karten je Prinzip (Gamification §5.2 — bewusst zurückgestellt).

---

## 3. Migrationsreihenfolge

Sechs Stufen. **Jede Stufe ist ein eigener Commit und ein eigener Freigabe-Punkt.**
Nach jeder Stufe läuft die Prüfung aus Abschnitt 6.

| Stufe | Inhalt | Sichtbar? | Risiko |
|---|---|---|---|
| **0** | ~~**Doku-Fix** (Abschnitt 7). Nur `CLAUDE.md`.~~ **Erledigt 08.09.2026**, eigener Commit. | nein | keins |
| **1** | ~~Bausteine anlegen: `buildMerksatz()`, `buildProgress()`, `buildWegweiser()`.~~ **Erledigt 08.09.2026, kleiner geschnitten:** nur `buildRememberBox()` (Merksatz), Commit `8e83e32`. Fortschritt/Wegweiser bleiben zurückgestellt. Rein additiv, `node --check app.js` sauber. | nein | sehr klein |
| **2** | ~~**Pilot.** Nur `renderLesson()` nutzt die Bausteine.~~ **Erledigt 08.09.2026:** `renderLesson()` nutzt `buildRememberBox()` für den "Wichtig"-Kasten, Commit `b183533`. Vorlesen + Mitmarkierung mit Playwright vorher/nachher verglichen, byte-identisch. Die lokale `blockRead`-Closure bleibt — 5 weitere Aufrufer (text/bullets/examples/warning/success) nutzen sie noch. | ja, 1 Kasten auf 1 Screen | klein, isoliert |
| **3** | **Erledigt 08.09.2026** (Vorbereitung): Prüf-Notiz liegt in `docs/pruefgruppe-merksatz-pilot.md`, Commit `9df7023`. Der Prüfgruppen-**Termin** ist ein menschlicher Schritt und läuft getrennt — er blockiert Stufe 4 **nicht**, weil bis dahin nur zeichengleich refaktoriert wird. Die Prüfgruppe wird angesetzt, sobald es eine echte gestalterische Änderung gibt (Wegweiser/Ort-Satz/Fortschritt). | — | — |
| **3a** | **Erledigt 08.09.2026:** verschärfte Vorlese-Prüfung als Vorbedingung für Stufe 4 — 2 Themen × 3 Sprachstufen (`leicht`/`einfach`/`standard`), Erwartungswerte aus den echten Daten berechnet. Alle 6 Fälle: gelesen **und** mitmarkiert, 0 Fehler. | — | — |
| **3b** | **Erledigt 08.09.2026:** `buildRememberBox()` um `opts.vorlesen` erweitert (Commit `df20404`), damit die Umstellung nicht nebenbei 5 neue Vorlese-Knöpfe einführt. Verhaltensneutral, kein Aufrufer geändert. | nein | keins |
| **4** | **Neu geschnitten (siehe Abschnitt 3a unten).** Nur die 5 echten Merksatz-Kästen (Titel „Wichtig", einfacher `p`-Text), alle mit `{vorlesen: false}`. Alles andere bleibt bewusst stehen. | ja, 5 Kästen | klein |
| **4b** | **Zurückgestellt:** Vorlese-Knopf an *jedem* Merksatz-Kasten anbieten. Pädagogisch begründbar (§3 Vorlesen als Angebot), aber eine **Funktionserweiterung** — eigener Schritt, eigene Freigabe, nicht als Nebeneffekt von Stufe 4. | ja | mittel |
| **5** | Aufräumen: `buildStepPath()` und `buildCompletionProgress()` entfernen — **erst wenn `rg` null Aufrufer zeigt**. Ggf. die tote `.progress-area` klären. | nein | klein |

Stufe 3 ist kein Papier-Schritt. Solange aber nur zeichengleich umgebaut wird,
hängt Stufe 4 nicht am Sitzungstermin — es gibt für die Prüfgruppe schlicht
nichts Neues zu sehen.

### 3a. Stufe-4-Scope — was umgestellt wird und was nicht

Die ursprüngliche Reihenfolge oben war falsch: sie nannte `renderTrainingMessage`
und `renderTopicChoice` (dort gibt es **keinen** Merksatz-Kasten) und übersah
`startTrainingInbox`, `startScenario` und `renderScenarioResult`. Tatsächlicher
Bestand, ausgezählt mit `rg 'class="access-box remember remember-box"'`:
**14 Vorkommen in 6 Funktionen**, nicht 6 in 4.

**Wird umgestellt** — echte Merksätze, Titel „Wichtig", einfacher `p`-Text,
alle mit `{vorlesen: false}` (heute hat keine dieser Stellen einen Block-Knopf):

| Funktion | Text |
|---|---|
| `renderPracticeFeedbackPage` | `practice.remember` |
| `startScenario` | „Alles hier ist erfunden. …" |
| `startTrainingInbox` | „Alle Nachrichten hier sind erfunden. …" |
| `renderTrainingResult` | „Bekommst du wirklich so eine Nachricht? …" |
| `renderScenarioResult` | „Passiert dir so etwas wirklich? …" |

**Bleibt bewusst stehen** — gleiche CSS-Klassen, aber etwas anderes:

| Stelle | Warum |
|---|---|
| `renderCompletionPage` ×2 „Eine Sache für heute" (`topic.transfer`) | **Transfer/Handeln**, kein Merksatz. Eigenes didaktisches Element (§12: „eine Sache, die du heute tun kannst"). Zusammenlegen würde die Unterscheidung verlieren. |
| `renderScenarioResult` „Das nimmst du mit" | **Liste** (`<ul class="sz-merkliste">`) statt Fließtext — passt nicht in `buildRememberBox(titel, text)`. |
| `startTrainingInbox` „So wächst dein Postfach" / „Dein Postfach" | **Rückmeldung zum Spielstand**, Text aus dem Zustand berechnet. |
| `renderTrainingResult` „Dein Postfach kann noch wachsen" / „…ist voll" | dito, Titel wechselt je nach Zustand. |
| `renderScenarioResult` „… ist jetzt offen" / „Noch eine Runde?" / „Du hast alle Runden gemacht" | dito, Titel dreifach verzweigt. |

Nach Stufe 4 nutzen also 6 von 15 Kästen den Baustein; die übrigen 9 bleiben
absichtlich eigenständig. Das ist kein unfertiger Zustand, sondern die
Feststellung, dass „sieht gleich aus" nicht „ist dasselbe" bedeutet.

---

## 4. Betroffene Funktionen

### 4.1 Neu (Stufe 1, additiv)

| Funktion | Aufgabe | Ersetzt später |
|---|---|---|
| `buildMerksatz(titel, text)` | gibt den `access-box remember remember-box`-Block aus, inkl. `blockRead()`-Hörknopf | 7 Handkopien |
| `buildProgress({index, total, variante})` | ein Balken + verbale Schritt-Angabe, `role="progressbar"`, `aria-valuetext` | `buildStepPath`, `buildCompletionProgress` |
| `buildWegweiser(text, {index, total})` | klammert Ort-Satz und Balken zu einem Block; ruft `setOrientation()` **unverändert** auf | — (neu) |

### 4.2 Geändert in Stufe 2 (genau eine Funktion)

| Funktion | Zeile | Was passiert |
|---|---|---|
| `renderLesson()` | `app.js:4066` | ruft die drei Bausteine statt Inline-Markup; Reihenfolge und Inhalt der Karte bleiben identisch |

### 4.3 Geändert in Stufe 4

`renderCompletionPage` (:4561) · `renderPracticeFeedbackPage` (:4281) ·
`renderQuizQuestion` (:4872) · `renderQuizFeedbackPage` (:4911) ·
`renderQuizResult` (:4985) · `renderTrainingMessage` (:5396) ·
`renderTrainingResult` (:5506) · `renderTopicChoice` (:3671)

### 4.4 Ausdrücklich **nicht** angefasst

`setOrientation()` (:1068) · `setPageTopicColor()` (:1055) · `setHeader()` (:1012) ·
`setActiveTab()` (:1041) · `navigateTab()` (:1112) · `handleHash()` (:6310) ·
`rememberRoute()` (:1099) · `focusContent()` (:1130) ·
`resolveLessonContent()` · `getLessonsForMode()` (:3952) ·
`pGet/pSet/pRemove` (:335–337), `STORAGE_KEY="lernstand"` ·
`TOPIC_COLORS` (:841) / `TOPIC_COLORS_DARK` (:866) / `getTopicColorStyle()` (:905) —
die Kontrast- und ΔE-Arbeit in den Kommentaren dort bleibt vollständig erhalten ·
gesamter Vorlese-Block (:1288–1660) · `sw.js` außer `CACHE_VERSION`.

### 4.5 `styles.css`

Neu: `.wegweiser` (Rahmen), `.wegweiser .orient-line`, `.wegweiser .step-bar`.
**Nur bestehende Tokens** — `--topic-color`, `--surface`, `--line`, `--radius-m`,
`--track-bg`, `--track-line`. **Keine neue Hex-Farbe** (§10), sonst bricht der
Dark Mode. Die vorhandenen Regeln für `.orient-line` und `.step-bar-wrap` bleiben
stehen, damit nicht umgestellte Screens unverändert aussehen.

---

## 5. Unveränderte Inhaltsdateien

Diese Dateien werden in **keiner** Stufe angefasst. Prüfsummen vom 08.09.2026,
zum Nachrechnen nach jedem Commit:

```
be3754114881f4994016fd8361779f478c6fffd2d9ecab7b321ae605f4a15daf  topics.js
333ea9eba15003a4fd28eb19959560aae6f09cb07d8c14b6e0423c644acde961  content-de.js
63101d488e6ce5c678db03457e04a83c27bd506688e1a9b9e89f209ce8e787bf  begleitung-de.js
b01b60f4759b33fbe71890720020e12b11f2de31e21f459b6a0a749a08728eac  szenarien-de.js
8859f4e7c1812c6e7f3a20deb6390d4d8ac4aacf7e970e95b5cca18465a0501f  regeln-de.js
dc906d27664b1c11b803b15efe0b5c936fe58d72ae714eb143720490b634bc29  uebungen-de.js
```

Ebenfalls unberührt: `assets/pictograms/` (36 SVG), `assets/lessons/` (17 SVG),
`assets/qr/` (13 SVG), `praxis/` (7 HTML, ARASAAC-Quellenangabe bleibt stehen, §11).

Prüfbefehl nach jedem Commit:

```bash
sha256sum -c docs/inhalte.sha256          # falls angelegt
git diff --name-only HEAD~1 | rg 'topics|content-de|begleitung-de|szenarien-de|regeln-de|uebungen-de|assets/|praxis/'
# erwartete Ausgabe: leer
```

Weil die Inhalte unberührt bleiben, gilt automatisch: alle 129 Lektionen behalten
`versions.einfach` **und** `versions.standard` (heute 129/129, 0 verwaiste Titel),
und die Fallback-Kette aus `docs/KONZEPT_3_SPRACHSTUFEN.md` §2 bleibt intakt.
Die Pflicht aus §2/§17, alle drei Ebenen synchron zu pflegen, wird nicht berührt —
es ändert sich kein einziger Satz.

---

## 6. Risiken

### 6.1 Vorlesen — das größte Risiko

Das Vorlesen hängt an **zwei stillen Verträgen**. Bricht einer, gibt es keine
Fehlermeldung: es wird einfach nichts mehr vorgelesen.

**Vertrag 1 — die Element-Typen.** `readCurrentPage()` sammelt den Seitentext mit

```js
section.querySelectorAll("h3, h4, p, li")     // app.js:1595
```

aus dem Wurzelelement `[data-readable='true']` (:1379, :1412; 43 Vorkommen).
**`h2` und `div` sind nicht dabei.** Wer beim Umbau ein `<p>` zu einem `<div>`
macht oder eine Überschrift von `h3` auf `h2` hebt, entfernt diesen Text lautlos
aus dem Vorlesen — betroffen wären ausgerechnet Merksatz-Überschrift und
Wegweiser-Text.
→ **Regel für alle Stufen:** `buildMerksatz()` behält `<h3>` + `<p>`.
Der Wegweiser bekommt **kein** `data-readable="true"` und schiebt sich nicht
zwischen `[data-readable]` und dessen Inhalt.

**Vertrag 2 — die Selektor-Liste.** Die zentrale Klick-Weiche für die
Karten-Hörknöpfe sucht die zu markierende Karte über eine **fest verdrahtete
Klassenliste**:

```js
button.closest(".ls-text-block, .ls-bullet-block, .access-box, .action-card,
                .topic-card, .sample-option, .language-card")   // app.js:6406
```

Jede neue Wrapper-Klasse verliert die Mitlese-Hervorhebung — das Vorlesen läuft,
aber die Markierung springt weg. Genau das ist für die Zielgruppe die bewusste
Ausnahme zum Redundanz-Prinzip (§3: gleichzeitig hören **und** mitlesen).
→ `.access-box` bleibt am Merksatz erhalten, damit der Fall gar nicht eintritt.
Kommt später eine neue Klasse dazu, wird sie in :6406 **im selben Commit**
nachgetragen.

**Weitere Vorlese-Punkte, die zu prüfen sind:** Auto-Vorlesen im Hör-Modus läuft
zentral über `focusContent()` (:1130, 450 ms verzögert) — unverändert lassen.
`sectionReadChip()` (:1604) ist ein nativer `<button>` ohne
`data-read-card-text` und darf keinen bekommen, sonst löst der zentrale Listener
doppelt aus (der Kommentar dort erklärt es).

### 6.2 Offline

`sw.js` cached `app.js` und `styles.css` per Precache (`PRECACHE_URLS`).
Wird eine der beiden geändert und `CACHE_VERSION` (heute `"v2026-12m"`, `sw.js:7`)
**nicht** erhöht, bekommen alle Personen mit installierter PWA weiterhin die alte
Datei — der Umbau ist unsichtbar, und schlimmer: es kann ein neues `styles.css`
auf ein altes `app.js` treffen, wenn nur eines neu geladen wird.

→ **Pro veröffentlichter Stufe genau eine Erhöhung**, z. B.
`v2026-12m` → `v2026-12n`. Es kommt keine Datei zur Precache-Liste dazu, weil
keine neue Datei entsteht. Nach dem Deployen einmal mit installierter PWA
gegenprüfen, dass das Update-Banner (`index.html`, `showUpdateBanner()`) erscheint
und der Neuladen-Knopf funktioniert.

### 6.3 Weitere

| Risiko | Gegenmittel |
|---|---|
| Dark Mode bricht | keine Hex-Farbe in neuen Regeln (§10); nach jeder Stufe in hell **und** dunkel ansehen |
| Kontrast verschlechtert | Balken behält `--track-bg`/`--track-line` (dokumentiert 5,06:1 gegen `--surface`); nichts daran drehen |
| `aria-live` feuert doppelt | `#orientLine` bleibt die **einzige** Live-Region für den Ort; Wegweiser bekommt keine zweite |
| Fokus/Skip-Link | `#content` bleibt Fokusziel, `tabindex="-1"` unverändert; Wegweiser liegt außerhalb der Tab-Reihenfolge |
| Themenfarbe verschwindet | `setPageTopicColor()` schreibt `--topic-color` auf `.app` — der Wegweiser erbt sie, keine eigene Farblogik |
| Hash-Routing/Zurück | `rememberRoute()` wird nicht angefasst; nach Stufe 2 Browser-Zurück auf dem Lernschritt testen |

---

## 7. Doku-Fix — separat, nicht im UI-Commit

Zwei Stellen in `CLAUDE.md` beschreiben einen Stand, den es nicht mehr gibt.
Beide sind **geprüft**, aber **nicht geändert**. Sie gehören in einen eigenen
Commit („Doku: zwei überholte Stellen in CLAUDE.md nachziehen") **vor oder nach**
dem UI-Umbau, nie vermischt.

### Fix 1 — §18.6: `shortLessonIndexes`

§18.6 trägt auf, „`shortLessonIndexes` in `topics.js` entsprechend setzen", und
nennt den Kurz-Modus mit „94 von 129 Lektionen (73 %)".

Befund (`rg`, ausgezählt):

- `shortLessonIndexes` kommt in `topics.js` **null**-mal vor; alle 12 Themen
  haben stattdessen `einfachLessons`.
- In `app.js` ist es nur noch **Rückfallzweig** (`getLessonsForMode()`, :3976),
  hinter `topic.einfachLessons` (:3955). Der Kommentar :3972–3975 erklärt es.
  Da 0 Themen ohne `einfachLessons` existieren, läuft der Zweig **nie**.
- Der Kurz-Modus liefert heute **60 von 129** Lektionen (47 %), gleichmäßig
  **5 Schritte je Thema** (Start + 3 Kern + „Das merke ich mir"). Die
  Themenseite beziffert das seit Prüfbericht B8 sichtbar („Kurz — 5 Schritte").

→ Das in §18.6 beschriebene Problem ist gelöst, die Anweisung ist überholt.
§18.6 auf „erledigt" setzen und den Mechanismus als `einfachLessons` benennen.
**Der Fallback-Zweig in `app.js` bleibt stehen** — er ist die Absicherung für ein
künftiges Thema ohne eigene Kurzfassung.

### Fix 2 — §17: externe Quellen und `ARASAAC_PICTO`

§17 verlangt noch „nur Google Fonts + ARASAAC extern" und „Neue Piktogramm-Begriffe
in `ARASAAC_PICTO` gemappt". §11 hat beides im August 2026 abgelöst.

Befund:

- `ARASAAC_PICTO` existiert in `app.js` **nicht mehr**. Einziger Verweis außerhalb
  von `CLAUDE.md`: `download_pictos.js` — ein Hilfsskript, das ins Leere greift
  („ARASAAC_PICTO in app.js nicht gefunden", Zeile 14).
- Kein Aufruf zu `fonts.googleapis.com`, `fonts.gstatic.com` oder
  `static.arasaac.org` in `index.html`, `app.js`, `styles.css`, `sw.js`.
  Treffer gibt es nur in **Download-Hilfsskripten** (`download-fonts.sh`,
  `download_pictos.js`, `assets/fonts/DOWNLOAD.md`) — die laufen einmalig auf dem
  Rechner, nicht im Browser der Lernenden.
- Die Schrift lädt lokal: `@font-face { src: url('assets/fonts/atkinson-*.woff2') }`
  (`styles.css:13, 27, 41, 55`).
- `pictoSrc()` (:917) liefert schlicht `assets/pictograms/<key>.svg`.
- `praxis/` enthält weiterhin ARASAAC — aber **eingebettet als `data:image`**,
  ohne externen Aufruf. Die Quellenangabe dort ist Pflicht und **bleibt** (§11).

→ In §17 die Zeile „nur Google Fonts + ARASAAC extern" ersetzen durch
„keine externen Quellen; Schrift und Piktogramme lokal" und die
`ARASAAC_PICTO`-Zeile auf `assets/pictograms/` + `sw.js`-Precache umschreiben.
**Erledigt (08.09.2026):** `download_pictos.js` ist auf Anweisung gelöscht. Es war
funktionslos — es suchte `ARASAAC_PICTO` in `app.js` und brach mit einer
Fehlermeldung ab. Über die Git-Historie jederzeit wiederherstellbar.
`download-fonts.sh` und `assets/fonts/DOWNLOAD.md` **bleiben**: sie funktionieren
und dokumentieren, woher die lokale Schrift stammt.

---

## 8. Rückbauplan

Der Umbau ist so geschnitten, dass jede Stufe für sich rückgängig zu machen ist.

**Sofort-Rückbau einer Stufe (Normalfall):**

```bash
git revert <commit>            # eine Stufe = ein Commit
# CACHE_VERSION in sw.js auf den Wert davor zurücksetzen
node --check app.js && node --check sw.js
python3 -m http.server 8000    # in hell und dunkel prüfen
```

**Warum das reicht:**

- Bis Stufe 4 bleiben `buildStepPath()` und `buildCompletionProgress()`
  **vollständig im Code**. Ein Revert von Stufe 2 stellt den alten Lernschritt
  wieder her, ohne dass irgendwo etwas fehlt.
- Die alten CSS-Regeln (`.orient-line`, `.step-bar-wrap`) werden nicht gelöscht,
  sondern nur ergänzt. Nach einem Revert greifen sie unverändert.
- Es gibt keine Datenmigration: kein `localStorage`-Schlüssel kommt hinzu, keiner
  ändert sein Format, `STORAGE_KEY="lernstand"` bleibt wie er ist. Ein Rückbau
  kann deshalb keinen gespeicherten Zustand beschädigen — auch nicht bei jemandem,
  der die neue Fassung schon benutzt hat.
- Die Inhaltsdateien sind nie Teil eines dieser Commits (Abschnitt 5). Ein Revert
  kann keinen Text verlieren.

**Wenn jemand die PWA installiert hat und nach dem Revert die alte Fassung sieht:**
`CACHE_VERSION` erneut erhöhen (nicht auf den alten Wert zurück, sondern **weiter**,
z. B. `v2026-12n` → `v2026-12o`). Ein zurückgesetzter Wert würde als „schon
gesehen" gelten und den Cache nicht erneuern.

**Punkt ohne einfachen Rückweg:** erst Stufe 5 (Löschen der alten Funktionen).
Deshalb steht sie am Ende, hinter der Prüfgruppe, und braucht eine eigene Freigabe.

---

## 9. Prüfung nach jeder Stufe (§17)

```bash
node --check app.js && node --check topics.js && node --check content-de.js \
  && node --check begleitung-de.js && node --check sw.js
python3 -m http.server 8000
```

Von Hand am Pilot-Screen:

- [ ] Ort-Satz steht, nennt Thema und Schritt, Farbfaden in Themenfarbe
- [ ] Hör-Knopf am Ort-Satz liest vor
- [ ] „Vorlesen" liest die **ganze** Seite inkl. Merksatz (Vertrag 1!)
- [ ] Block-Hörknöpfe markieren die Karte beim Mitlesen (Vertrag 2!)
- [ ] Schriftgröße A / A+ / A++ verschiebt nichts
- [ ] Tastatur: Tab-Reihenfolge, sichtbarer Fokus, `Escape` schließt Overlays
- [ ] Dark Mode: Wegweiser und Balken lesbar, Kontrast nicht schlechter
- [ ] „Zurück"/„Weiter" und Browser-Zurück verhalten sich wie vorher
- [ ] 5-Punkte-Tab-Leiste sichtbar, aktiver Punkt markiert
- [ ] Offline: Flugmodus, Seite lädt, `CACHE_VERSION` erhöht
- [ ] Inhaltsdateien unverändert (`git diff --name-only`)

---

## 10. Was ich von dir brauche

1. ~~**Freigabe für Stufe 0**~~ — erteilt, erledigt 08.09.2026.
2. ~~Entscheidung zu `download_pictos.js`~~ — gelöscht, 08.09.2026.
3. **Freigabe für Stufe 1+2** (Bausteine + Pilot auf dem Lernschritt) — **offen.**
   Das ist die erste Stufe, die `app.js` und `styles.css` anfasst und sichtbar wird.
4. Danach: Stufe 3 ist **deine** Entscheidung, nicht meine — die Prüfgruppe sagt,
   ob Stufe 4 kommt.

Ohne Freigabe für Stufe 1+2 ändere ich keinen Code.
