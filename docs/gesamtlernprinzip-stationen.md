# Gesamtlernprinzip — Zielbild: Startseite + 6 Stationen

**Stand:** 08.09.2026 · **Status:** Struktur-Entwurf zur Freigabe — **es wurde nichts gebaut**
**Art:** Schiene B (reine Planung). Nur `docs/`. `app.js`, `styles.css`, `sw.js`, `index.html`
und alle Inhalts-Dateien sind byte-identisch zum Vor-Commit.

> **Verbindliche Grenze dieses Dokuments.** Hier wird **einsortiert, nicht umgeschrieben.**
> Jeder Satz, der unten genannt wird, bleibt **wortgleich** an seiner Quelle stehen. Neu sind
> ausschließlich **Struktur-Etiketten** (Stationsnamen, „Merken/Prüfen/Handeln",
> „Deine eine Sache für heute", „Hilfe-Anker"). Es wurde kein Sachtext erfunden, keine
> Inhalts-Datei angefasst (`topics.js`, `content-de.js`, `begleitung-de.js`,
> `szenarien-de.js`, `regeln-de.js`, `uebungen-de.js`).
>
> Alle Angaben unten sind **aus den Dateien ausgezählt**, nicht aus dem Gedächtnis.

---

## 0. Station 0 — die Einstiegsseite (über den Themen)

Nicht eine der 6 Stationen, sondern die **Plattform-Einstiegsseite darüber**: der Ort, an dem
eine Person ankommt und **ein Thema wählt**. Von dort führt jeder Klick in den
6-Stationen-Ablauf eines Themas.

### 0.1 Zielbild — ruhig, ein Fokus

```
┌──────────────────────────────────────────────┐
│  [Alex und Tilda]  Willkommen!               │  ← vorhanden, WORTGLEICH
│  Alex und Tilda begleiten dich. Du lernst,   │     (app.js:2667–2668)
│  sicher und selbstbestimmt im Internet zu    │
│  sein.                                       │
├──────────────────────────────────────────────┤
│  So lernst du.                               │  ← NEU (Gestaltungs-Label)
│     🧠 Merken  →  ✅ Prüfen  →  ➜ Handeln     │     3 Icons, 1 Satz. Sonst nichts.
├──────────────────────────────────────────────┤
│  Wähle ein Thema.                            │  ← vorhanden, WORTGLEICH
│  Tippe auf ein Thema. Dann geht es los.      │     (app.js:2895–2896)
│                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐            │  ← DER FOKUS:
│  │ Thema  │ │ Thema  │ │ Thema  │            │     die 12 vorhandenen
│  └────────┘ └────────┘ └────────┘            │     Kacheln, wortgleich,
│  … 12 Kacheln in 3 Gruppen …                 │     in TOPIC_GROUPS
├──────────────────────────────────────────────┤
│  Du brauchst Unterstützung? · Was bedeutet…? │  ← beide NUR auf Anforderung
└──────────────────────────────────────────────┘
   Wegweiser/Fortschritt: hier NICHT. Erst im Thema.
```

### 0.2 Was hier steht — und woher es kommt

| Element | Herkunft | Status |
|---|---|---|
| Begrüßung „Willkommen!" + „Alex und Tilda begleiten dich…" | `renderIntro()` `app.js:2667–2668` | **wortgleich übernehmen** |
| Leitsatz „So lernst du." + 🧠→✅→➜ | — | **NEU**, reines Gestaltungs-Label (3 Wörter + 3 Icons) |
| „Wähle ein Thema" / „Tippe auf ein Thema. Dann geht es los." | `renderMenu()` `app.js:2895–2896` | **wortgleich übernehmen** |
| Die 12 Themen-Kacheln (Titel + `desc` + Symbol + Vorlese-Knopf) | `renderMenu()` `cardFor()` `app.js:2807`, `TOPIC_GROUPS` `:2781` | **wortgleich übernehmen**, inkl. der 3 Gruppen |
| Hilfe-Anker „Du brauchst Unterstützung?" | `buildSupportBox()` `app.js:3796` | vorhanden, **eingeklappt** |
| Glossar „Was bedeutet:" | `app.js:708`, `.glossar-term` `:795` | vorhanden, **nur auf Antippen** |
| Wegweiser / Fortschritt | `buildStepPath()` `app.js:4048` | **hier bewusst NICHT** — erst im Thema |

### 0.3 Warum ruhig und mit einem Fokus (§3)

- **Advance Organiser / Pre-training (Mayer):** Eine **kurze** Orientierung vor dem Stoff
  senkt die Last. Sie soll **ein Konzept** transportieren, nicht ein Inhaltsverzeichnis sein.
  Deshalb: drei Icons und ein Satz — nicht mehr.
- **Kohärenz-Prinzip / Weeding:** „People learn more deeply when extraneous material is
  excluded." Auf der Einstiegsseite heißt das: Überflüssiges weglassen, nicht ergänzen.
- **Cognitive Load:** Sachfremde Last (extraneous load) trifft die Zielgruppe (§4) besonders
  hart. Eine zweite konkurrierende Bildschirm-Hälfte kostet hier mehr als anderswo.
- **Wegweiser = Selbstregulation (UDL):** Ein Fortschritts-Anzeiger hilft, **wenn man
  losgelegt hat**. Vorher zeigt er einen Weg, den man noch nicht geht — er beantwortet eine
  Frage, die noch niemand gestellt hat. Deshalb erst ab Station 1, und dort **dünn**.
- **Emotionale Sicherheit (Došen):** Vorhersehbarkeit entsteht durch **immer denselben**
  Einstieg. Ein Bildschirm, eine Frage: „Wähle ein Thema."

### 0.4 Zwei Dinge, die beim Bauen zu entscheiden sind

> **S1 — Der Einstieg liegt heute auf ZWEI Seiten.** `#start` (`renderIntro()`, Begrüßung +
> „Los geht's") und `#themen` (`renderMenu()`, die 12 Kacheln) sind **zwei getrennte Punkte
> der festen 5-Punkte-Tab-Leiste** (§1, geschützter Bestand). Das Zielbild oben legt beide
> **auf eine Seite** zusammen. Das ist **kein Layout-Detail**, sondern ein Eingriff in die
> geschützte Navigation. Drei Wege: (a) Leitsatz auf `#start` ergänzen, Kacheln bleiben auf
> `#themen` — Tab-Leiste unberührt; (b) Kacheln zusätzlich auf `#start` zeigen — Doppelung,
> widerspricht Kohärenz; (c) beide Tabs zusammenlegen — Bestandseingriff, braucht eigene
> Freigabe. **Ohne Entscheidung wird hier nichts gebaut.**
>
> **S2 — Was weicht dem Leitsatz?** Auf `#start` stehen heute zusätzlich die Angebots-Liste
> („Das kannst du hier machen:" mit 3 Punkten, `app.js:2687–2693`) und die Meta-Zeile
> („12 Themen · 3 Sprachstufen · kostenlos · kein Name nötig", `:2694`). Beide sagen
> Verwandtes zum neuen Leitsatz. Nach dem Kohärenz-Prinzip müsste **eines von beiden weichen**
> — aber das wäre Entfernen von Bestand (§1) und damit nicht von diesem Auftrag gedeckt.
> Vorschlag zur Entscheidung: Angebots-Liste behalten (sie erscheint ohnehin nur beim
> **ersten** Besuch), Leitsatz darunter. Dann konkurriert nichts.

> **Neue Wörter auf dieser Seite: genau drei.** „So lernst du." Dazu die drei Etiketten
> Merken / Prüfen / Handeln. Alles andere ist vorhandener Text. Diese vier Beschriftungen
> gehören auf die Prüfgruppen-Liste (§18.8) — Piktogramme und kurze Etiketten sind für die
> Zielgruppe nicht automatisch selbsterklärend (§11).

---

## 1. Die 6 Stationen und ihre Quellen im Bestand

| Station | Faden | Woher der Inhalt kommt | Code |
|---|---|---|---|
| **1 · Start** | — | Orientierungssatz + Einstiegsfrage `topic.selfAssessment` (je Stufe `topic.saVersions`) | `setOrientation()` `app.js:1068`, `renderSelfAssessment()` `:3997` |
| **2 · Thema** | — | `topic.title`, `topic.desc`, `topic.learningGoals` (3 je Thema) + Start-Lektion (`module === "Start"`) | `renderTopicChoice()` `:3671`, `renderLesson()` `:4111` |
| **3 · Lernen** | 🧠 Merken | **beide Töpfe** (P1): `lesson.remember` **und** `practice.remember` (je Stufe überschreibbar in `content-de.js`) | `buildRememberBox()` `:4103`, `buildPractice()` `:4306`, `renderPracticeFeedbackPage()` `:4327` |
| **4 · Quiz** | ✅ Prüfen | **`topic.quizQuestions` in `topics.js`** — die Original-Fragen · dazu (P2) `topic.helpQuestions` als Selbst-Prüffragen · dazu (P4) **Übungs-Handy** und **Trainings-Postfach** | `getQuizQuestions()` `:4912`, `renderQuizQuestion()` `:4919`, `startScenario()`, `startTrainingInbox()` |
| **5 · Transfer** | ➜ Handeln | `topic.transfer` = **„DEINE eine Sache für heute"** (P5) · Hilfe-Anker aus `buildSupportBox()` · bei den 3 sensiblen Themen das vorhandene **„Hilfe"-Modul aufgreifen** (P6) | `renderCompletionPage()` `:4608`, `buildSupportBox()` `:3796` |
| **6 · Abschluss** | — | `topic.memoryRules` („Das hast du geübt", bleibt hier — P3) + `buildGoalsDone()` + `buildClosingSelfCheck()` | `renderCompletionPage()` `:4608`, `:4552`, `:4564` |

### Drei Befunde, die die Zuordnung bestimmen

**a) Die Quizfragen haben genau eine Quelle.** `topic.quiz` sieht im Browser aus wie ein
zweites Feld, ist aber ein **Laufzeit-Alias**: `normalizeQuizzes()` (`content-de.js:1752`)
setzt `t.quiz = t.quizQuestions`, wenn `quiz` fehlt. In `topics.js` existiert nur
`quizQuestions`. **Für Station 4 gilt deshalb ausschließlich `topic.quizQuestions`** —
121 Fragen über alle 12 Themen. Es gibt keinen zweiten, konkurrierenden Fragen-Bestand.

**b) Station 3 speist sich aus zwei Töpfen, nicht aus einem.** `lesson.remember` ist dünn
gesät (31 Sätze über alle Themen, Instagram hat **null**). Der größere Topf sind die
**Übungs-Merksätze** `practice.remember` — 70 Stück, einer je Übung. **Entschieden (P1):
Station 3 nutzt beide Töpfe.** Damit ist auch Instagram nicht leer, und es entsteht **kein
neuer Inhalt**. Die Tabellen unten nennen deshalb immer beide Zahlen.

**c) Hilfe-Anker ≠ `helpQuestions`.** `topic.helpQuestions` sind **Selbst-Prüffragen**
(„Kenne ich diese Nummer?", „Ist der Preis verdächtig billig?") — **entschieden (P2): sie
gehören zu ✅ Prüfen**, nicht zu ➜ Handeln. Der eigentliche Hilfe-Anker — eine **Person**, an
die man sich wendet — steht in `buildSupportBox()` (`app.js:3796`) und ist bereits auf jeder
Themen-Seite vorhanden:

> „Du brauchst Unterstützung?" → „Du kannst Hilfe holen." →
> *Eine Person, der du vertraust. · Eine Person, die dich unterstützt. · Eine
> Digital-Begleiterin oder einen Digital-Begleiter. · Jemanden im Wohnbereich oder Dienst.*
> Und: **„Das ist nicht deine Schuld." · „Du musst das nicht allein schaffen."**

Diese Formeln existieren **wortgleich im Bestand** (`app.js:3280–3295`). Für Station 5 werden
sie nur an einen festen Ort gestellt — nicht neu formuliert.

---

## 2. Zuordnung je Thema

Lesehilfe: **🧠** = Station 3 · **✅** = Station 4 · **➜** = Station 5.
„Lekt." = Lektionen. Alle Transfer-Sätze sind **wörtliche Zitate** aus `topic.transfer`.

### 1 · WhatsApp (`whatsapp`, 12 Lekt.)

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | Orientierungssatz „Du lernst: WhatsApp…" · Einstiegsfrage: „Wie sicher fühlst du dich bei WhatsApp?" |
| 2 Thema | `title` „WhatsApp" · `desc` · 3 `learningGoals` · Start-Lektion „Start" |
| 3 Lernen 🧠 | **2** `lesson.remember` + **7** `practice.remember` · 2 `warning`-Boxen · 2 `examples`-Boxen · Module: Nachrichten › Links › Code › Gruppen › Fotos › Stress › KI |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Schau heute in deine WhatsApp-Chats. Kennst du alle Personen wirklich?" |
| 5 Hilfe ➜ | `buildSupportBox()` · 4 `helpQuestions` als Prüffragen (→ eher ✅) |
| 6 Abschluss | 6 `memoryRules` · Schluss-Lektion „Das merke ich mir" · `buildGoalsDone()` |

### 2 · Datenschutz (`datenschutz`, 13 Lekt.)

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | Einstiegsfrage: „Was weißt du schon über den Schutz deiner Daten?" |
| 2 Thema | `title` „Datenschutz" · `desc` · 3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **3** `lesson.remember` + **9** `practice.remember` (der größte Bestand) · 2 `warning` · **5** `examples` · Module: Grundwissen › Passwort › Private Daten › Fotos › Nachrichten |
| 4 Quiz ✅ | `topic.quizQuestions` — **11 Fragen** |
| 5 Transfer ➜ | „Prüfe heute ein Passwort von dir. Ist es lang? Ist es geheim?" |
| 5 Hilfe ➜ | `buildSupportBox()` · 5 `helpQuestions` |
| 6 Abschluss | **8** `memoryRules` · „Das merke ich mir" |

### 3 · Facebook (`facebook`, 10 Lekt.)

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Wie sicher fühlst du dich auf Facebook?" |
| 2 Thema | `title`/`desc`/3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **1** `lesson.remember` + **6** `practice.remember` · 2 `warning` · **1 `success`** · 1 `examples` · Module: Profil › Beiträge › Einstellungen › Kontakte › Kommentare › Probleme › Fotos |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Prüfe heute bei einem Beitrag: Wer kann ihn sehen?" |
| 5 Hilfe ➜ | `buildSupportBox()` · 4 `helpQuestions` |
| 6 Abschluss | 4 `memoryRules` · „Das merke ich mir" |

### 4 · Instagram (`instagram`, 10 Lekt.) — **Sonderfall, gelöst**

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Wie sicher fühlst du dich auf Instagram?" |
| 2 Thema | `title`/`desc`/3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **0 `lesson.remember`** ⚠️ + **7** `practice.remember` · 2 `warning` · 0 `examples` · Module: Fotos › Stories › Standort › Nachrichten › Kommentare › Medien prüfen |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Schau heute in deine Einstellungen. Ist dein Konto privat?" |
| 5 Hilfe ➜ | `buildSupportBox()` · 4 `helpQuestions` |
| 6 Abschluss | 4 `memoryRules` · „Das merke ich mir" |

> **Einziges Thema ohne einen einzigen `lesson.remember`.** Mit der Entscheidung **P1**
> (beide Töpfe) ist Station 3 hier trotzdem gefüllt: **7 Übungs-Merksätze** aus
> `practice.remember`, dazu die 4 `memoryRules` in Station 6. **Es wird kein Inhalt
> erfunden** — dieses Thema zeigt in Station 3 einfach ausschließlich Übungs-Merksätze.

### 5 · YouTube (`youtube`, 10 Lekt.)

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Wie sicher fühlst du dich beim Schauen auf YouTube?" |
| 2 Thema | `title`/`desc`/3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **2** `lesson.remember` + **5** `practice.remember` · 2 `warning` · Module: Videos › Werbung › Pausen › Gefahr › Gefühle › Kommentare › KI |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Achte heute bei einem Video darauf: Ist das Werbung?" |
| 5 Hilfe ➜ | `buildSupportBox()` · 4 `helpQuestions` |
| 6 Abschluss | 4 `memoryRules` · „Das merke ich mir" |

### 6 · Snapchat (`snapchat`, 9 Lekt.)

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Was weißt du schon über Snapchat?" |
| 2 Thema | `title`/`desc`/3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **1** `lesson.remember` + **5** `practice.remember` · 2 `warning` · Module: Bilder › Private Bilder › Standort › Kontakte › Druck |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Prüfe heute in Snapchat: Wer kann deinen Standort sehen?" |
| 5 Hilfe ➜ | `buildSupportBox()` · 4 `helpQuestions` |
| 6 Abschluss | 4 `memoryRules` · „Das merke ich mir" |

### 7 · TikTok (`tiktok`, 11 Lekt.)

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Wie sicher fühlst du dich bei TikTok?" |
| 2 Thema | `title`/`desc`/3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **3** `lesson.remember` + **5** `practice.remember` · 2 `warning` · Module: Trends › Algorithmus › Nachrichten › Videos › Kommentare › Gefühle › KI |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Achte heute auf die Zeit. Wie lange schaust du Videos? Mach dann eine Pause." |
| 5 Hilfe ➜ | `buildSupportBox()` · 4 `helpQuestions` |
| 6 Abschluss | 5 `memoryRules` · „Das merke ich mir" |

### 8 · Hilfe bei Problemen (`hilfe`, 10 Lekt.) — *Stopp. Zeigen. Unterstützung* · **sensibel**

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Etwas passiert im Internet. Hast du einen Plan?" |
| 2 Thema | `title` „Hilfe bei Problemen" · `desc` · 3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **2** `lesson.remember` + **5** `practice.remember` · 2 `warning` · **1 `success`**: „Hilfe holen ist gut. Es ist nicht deine Schuld." (`topics.js:1811`) · Module: **Stopp › Beweise › Druck › Gefühle › Unterstützung** |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Überlege dir heute eine vertraute Person. Etwas passiert? Dann fragst du diese Person." |
| 5 Hilfe ➜ | `buildSupportBox()` · `helpQuestions` enthält hier ausdrücklich: **„Darf ich Hilfe holen? — Ja, immer."** · Merk-Karte: „Ich muss Probleme nicht allein lösen." (`app.js:6222`) |
| 6 Abschluss | 6 `memoryRules` · „Das merke ich mir" |

> **§3 Emotionale Sicherheit:** Dieses Thema trägt die entlastenden Formeln bereits selbst.
> Die Modul-Reihenfolge **Stopp › Beweise › Druck › Gefühle › Unterstützung** ist die
> Handlungskette und **bleibt in dieser Reihenfolge** — sie endet bewusst bei Unterstützung,
> nicht bei der Gefahr.

### 9 · KI und Chatbots (`ki`, 10 Lekt.) — *ein Programm, kein Mensch* · **sensibel**

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Was weißt du schon über Künstliche Intelligenz?" |
| 2 Thema | `title` „KI und Chatbots" · `desc` · 3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **3** `lesson.remember` + **4** `practice.remember` · 2 `warning` · 2 `examples` · Module: Grundwissen › Sicher nutzen › **Achtung › Hilfe** › Merken |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Nutzt du heute eine KI? Prüfe eine Antwort nach." |
| 5 Hilfe ➜ | `buildSupportBox()` · `helpQuestions` u. a. „Spreche ich mit einem Menschen oder mit einer KI?", „Geht es um Gesundheit oder Geld?", „Brauche ich Unterstützung?" |
| 6 Abschluss | 6 `memoryRules` · „Das merke ich mir" |

> Das Thema hat ein **eigenes Modul „Hilfe"** vor „Merken". Station 5 muss dieses Modul
> aufgreifen, nicht ersetzen. Der Einsamkeits-Satz aus dem Prüfgruppen-Katalog
> (`CLAUDE.md` §18.8) liegt in diesem Thema — beim Bauen **nicht anfassen**.

### 10 · Fake News und KI-Fakes (`fakes`, 11 Lekt.)

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Weißt du, wie du eine Fake-Nachricht erkennst?" |
| 2 Thema | `title`/`desc`/3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **3** `lesson.remember` + **6** `practice.remember` · 2 `warning` · 1 `examples` · Module: Grundwissen › KI-Fakes › **Prüfen › Hilfe** › Merken |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Siehst du heute eine überraschende Nachricht? Erst prüfen. Dann teilen." |
| 5 Hilfe ➜ | `buildSupportBox()` · 5 `helpQuestions` (u. a. „Macht die Nachricht starke Gefühle?") |
| 6 Abschluss | 7 `memoryRules` · „Das merke ich mir" |

### 11 · Online-Betrug und Abzocke (`betrug`, 12 Lekt.) — **sensibel**

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Weißt du, wie Betrüger im Internet vorgehen?" |
| 2 Thema | `title`/`desc`/3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **6** `lesson.remember` (meiste aller Themen) + **7** `practice.remember` · 2 `warning` · 1 `examples` · Module: Grundwissen › Tricks › **Schutz › Hilfe** › Merken |
| 4 Quiz ✅ | `topic.quizQuestions` — **11 Fragen** |
| 5 Transfer ➜ | „Erzähle heute einer Person von einem Trick aus diesem Thema. So schützt ihr euch beide." |
| 5 Hilfe ➜ | `buildSupportBox()` · 5 `helpQuestions` · zusätzlich **Trainings-Postfach** und **Übungs-Handy** für dieses Thema |
| 6 Abschluss | **8** `memoryRules` · „Das merke ich mir" |

> **§3 Emotionale Sicherheit — hier besonders geprüft:** Der Transfer-Satz weist **niemandem
> Schuld zu** und macht keine Angst; er ist als *gemeinsames* Schützen formuliert („So schützt
> ihr euch beide") und damit entlastend. Er bleibt **wortgleich**. Die Modulkette endet auf
> **Schutz › Hilfe**, nicht auf „Tricks" — diese Reihenfolge ist beim Bauen zu erhalten,
> damit das Thema nicht mit der Bedrohung schließt.

### 12 · Online-Einkaufen und Bezahlen (`einkaufen`, 11 Lekt.)

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Wie sicher fühlst du dich beim Online-Einkaufen?" |
| 2 Thema | `title`/`desc`/3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **5** `lesson.remember` + **4** `practice.remember` · 2 `warning` · 1 `examples` · Module: Einkaufen › Bezahlen › **Achtung › Hilfe** › Merken |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Willst du heute etwas kaufen? Prüfe zuerst den Shop." |
| 5 Hilfe ➜ | `buildSupportBox()` · 5 `helpQuestions` |
| 6 Abschluss | 7 `memoryRules` · „Das merke ich mir" |

---

## 3. Gesamtbild

| Station | Bestand über alle 12 Themen |
|---|---|
| 1 Start | 12 Einstiegsfragen (+ je 3 Sprachstufen über `saVersions`) |
| 2 Thema | 12 Titel/Beschreibungen · **36** Lernziele · 12 Start-Lektionen |
| 3 Lernen 🧠 | **31** `lesson.remember` + **70** `practice.remember` · 24 `warning` · 2 `success` · 13 `examples` |
| 4 Quiz ✅ | **121** Original-Fragen in `topic.quizQuestions` |
| 5 Transfer ➜ | **12** Transfer-Sätze · 1 gemeinsamer Hilfe-Anker (`buildSupportBox`) · 54 `helpQuestions` |
| 6 Abschluss | **69** `memoryRules` · 12 Schluss-Lektionen „Das merke ich mir" |

**Kein Thema hat eine leere Station** — mit der Einschränkung aus **P1** (Instagram).

---

## 4. Prüf-Tabelle: Kann die nutzende Person das nachprüfen?

| # | Aussage | Nachprüfbar wie | Sicherheit |
|---|---|---|---|
| N1 | Quizfragen kommen aus `topic.quizQuestions`; `topic.quiz` ist nur ein Alias | `content-de.js:1752` lesen; `t.quiz === t.quizQuestions` ist nach dem Laden `true` | **gesichert** |
| N2 | Alle Zahlen (Lektionen, Boxen, Regeln, Fragen) | mit `node` aus `topics.js` ausgezählt, Skript im Scratchpad | **gesichert** |
| N3 | Instagram hat 0 `lesson.remember` | `topics.js`, Thema `instagram` | **gesichert** |
| N4 | Entlastende Formeln existieren wortgleich | `app.js:3280–3295`, `topics.js:1811`, `:2293` | **gesichert** |
| N5 | Transfer-Sätze wörtlich zitiert | `topic.transfer` je Thema | **gesichert** |

### P1–P6 — entschieden am 08.09.2026

| # | Entscheidung | Folge für den Bau |
|---|---|---|
| **P1** | **Kein neuer Inhalt.** Station 3 nutzt **beide Töpfe**: `lesson.remember` (31) **und** `practice.remember` (70). | Instagram ist nicht leer. Es wird kein Satz geschrieben. |
| **P2** | `helpQuestions` gehören zu **✅ Prüfen** — Selbst-Prüffragen, kein Hilfe-Anker. | Station 4 bekommt sie; die Merk-Karte behält sie unverändert. |
| **P3** | `memoryRules` bleiben in **Station 6** als zusammengefasste Kernregeln zum Nachlesen. | Station 3 bleibt der Merksatz *im Moment des Lernens*, Station 6 die Bündelung. |
| **P4** | Übungs-Handy und Trainings-Postfach sind **Teil von ✅ Prüfen** — keine eigene Station. | Das 6er-Raster bleibt ein 6er-Raster. |
| **P5** | Etikett **„DEINE eine Sache für heute"** statt „Eine Sache für heute". | Ein Wort mehr an einem Etikett. Der Transfer-**Satz** darunter bleibt wortgleich. |
| **P6** | Die vorhandenen **„Hilfe"-Module** der 3 sensiblen Themen werden in **Station 5 aufgegriffen**, nicht danebengestellt. | Keine Doppelung. Entlastende Sätze bleiben wortgleich. |

### Was noch offen ist

| # | Frage | Warum sie eine Entscheidung braucht |
|---|---|---|
| **S1** | **Einstieg auf einer oder zwei Seiten?** Heute sind `#start` und `#themen` zwei Punkte der festen 5-Punkte-Tab-Leiste. Das Zielbild in §0.1 legt beide zusammen. | Eingriff in **geschützten Bestand** (§1: feste 5-Punkte-Navigation). Drei Wege in §0.4 beschrieben. |
| **S2** | **Was weicht dem neuen Leitsatz?** Angebots-Liste und Meta-Zeile auf `#start` sagen Verwandtes. | Etwas wegzunehmen ist **Entfernen von Bestand** (§1) — nicht von diesem Auftrag gedeckt. Vorschlag in §0.4. |
| **S3** | **Wo endet Station 3 und beginnt Station 4?** Die Übungen (`practice`) liefern die Merksätze für 🧠 **und** sind Abfrage — sie sitzen heute *innerhalb* der Lektion. | Mit P4 sind Übungs-Handy/Postfach bei ✅. Für die **Lektions-Übung** ist das noch nicht entschieden. |
| **S4** | **Etiketten für die Prüfgruppe:** „So lernst du.", „Merken", „Prüfen", „Handeln", „DEINE eine Sache für heute". | §11/§13: Kurz-Etiketten und Piktogramme sind für die Zielgruppe **nicht automatisch** verständlich. Gehören auf die Liste in §18.8. |

---

## 5. Was beim Bauen gilt (wenn du freigibst)

1. **Kein Sachtext wird angefasst.** Die Stationen sind Behälter; die Sätze bleiben, wo sie
   sind. Neu sind ausschließlich Etiketten: „So lernst du.", Merken/Prüfen/Handeln,
   „DEINE eine Sache für heute", Stationsnamen.
2. **Reihenfolge in sensiblen Themen erhalten:** `hilfe` endet auf *Unterstützung*, `betrug`
   auf *Schutz › Hilfe*, `ki` auf *Achtung › Hilfe › Merken*. **Kein Thema schließt mit der
   Gefahr** (§3, Došen). Nicht umdrehen.
3. **Station 5 nutzt die vorhandenen entlastenden Formeln** („Das ist nicht deine Schuld.",
   „Du musst das nicht allein schaffen.") — wortgleich, nicht neu erfunden. Bei den drei
   sensiblen Themen greift sie zusätzlich das vorhandene „Hilfe"-Modul auf (P6).
4. **Drei Sprachstufen bleiben unberührt:** Station 3 zeigt `remember` über
   `resolveLessonContent()`, also automatisch in der gewählten Stufe. Kein Eingriff in §2.
5. **Station 0 baut keinen Wegweiser.** Fortschritt erscheint erst ab Station 1, und dort
   dünn (§3, Selbstregulation).
6. **`CACHE_VERSION` hochzählen**, sobald `app.js` oder `styles.css` dafür angefasst wird
   (§16.6) — sonst sieht niemand die Änderung.
7. **Erst S1 und S2 entscheiden**, bevor an der Einstiegsseite gebaut wird — beides berührt
   geschützten Bestand (§1).

**P1–P6 sind entschieden. Gebaut wird trotzdem erst nach deiner Freigabe dieses Entwurfs —
und für die Einstiegsseite zusätzlich erst nach S1/S2.**
