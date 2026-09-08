# Gesamtlernprinzip — Zielbild mit 6 Stationen

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

## 1. Die 6 Stationen und ihre Quellen im Bestand

| Station | Faden | Woher der Inhalt kommt | Code |
|---|---|---|---|
| **1 · Start** | — | Orientierungssatz + Einstiegsfrage `topic.selfAssessment` (je Stufe `topic.saVersions`) | `setOrientation()` `app.js:1068`, `renderSelfAssessment()` `:3997` |
| **2 · Thema** | — | `topic.title`, `topic.desc`, `topic.learningGoals` (3 je Thema) + Start-Lektion (`module === "Start"`) | `renderTopicChoice()` `:3671`, `renderLesson()` `:4111` |
| **3 · Lernen** | 🧠 Merken | `lesson.remember` **und** `practice.remember` (je Stufe überschreibbar in `content-de.js`) | `buildRememberBox()` `:4103`, `buildPractice()` `:4306`, `renderPracticeFeedbackPage()` `:4327` |
| **4 · Quiz** | ✅ Prüfen | **`topic.quizQuestions` in `topics.js`** — die Original-Fragen | `getQuizQuestions()` `:4912`, `renderQuizQuestion()` `:4919` |
| **5 · Transfer** | ➜ Handeln | `topic.transfer` = „Deine eine Sache für heute" · Hilfe-Anker aus `buildSupportBox()` | `renderCompletionPage()` `:4608`, `buildSupportBox()` `:3796` |
| **6 · Abschluss** | — | `topic.memoryRules` („Das hast du geübt") + `buildGoalsDone()` + `buildClosingSelfCheck()` | `renderCompletionPage()` `:4608`, `:4552`, `:4564` |

### Drei Befunde, die die Zuordnung bestimmen

**a) Die Quizfragen haben genau eine Quelle.** `topic.quiz` sieht im Browser aus wie ein
zweites Feld, ist aber ein **Laufzeit-Alias**: `normalizeQuizzes()` (`content-de.js:1752`)
setzt `t.quiz = t.quizQuestions`, wenn `quiz` fehlt. In `topics.js` existiert nur
`quizQuestions`. **Für Station 4 gilt deshalb ausschließlich `topic.quizQuestions`** —
121 Fragen über alle 12 Themen. Es gibt keinen zweiten, konkurrierenden Fragen-Bestand.

**b) Station 3 speist sich aus zwei Töpfen, nicht aus einem.** `lesson.remember` ist dünn
gesät (31 Sätze über alle Themen, Instagram hat **null**). Der größere Topf sind die
**Übungs-Merksätze** `practice.remember` — 70 Stück, einer je Übung. Wer Station 3 nur auf
`lesson.remember` stützt, bekommt bei Instagram eine leere Station. Die Tabellen unten
nennen deshalb immer **beide** Zahlen.

**c) Hilfe-Anker ≠ `helpQuestions`.** `topic.helpQuestions` sind **Selbst-Prüffragen**
(„Kenne ich diese Nummer?", „Ist der Preis verdächtig billig?") — sie gehören didaktisch zu
✅ Prüfen, nicht zu ➜ Handeln. Der eigentliche Hilfe-Anker — eine **Person**, an die man sich
wendet — steht in `buildSupportBox()` (`app.js:3796`) und ist bereits auf jeder Themen-Seite
vorhanden:

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

### 4 · Instagram (`instagram`, 10 Lekt.) — **Sonderfall**

| Station | Inhalt aus dem Bestand |
|---|---|
| 1 Start | „Wie sicher fühlst du dich auf Instagram?" |
| 2 Thema | `title`/`desc`/3 `learningGoals` · Start-Lektion |
| 3 Lernen 🧠 | **0 `lesson.remember`** ⚠️ + **7** `practice.remember` · 2 `warning` · 0 `examples` · Module: Fotos › Stories › Standort › Nachrichten › Kommentare › Medien prüfen |
| 4 Quiz ✅ | `topic.quizQuestions` — **10 Fragen** |
| 5 Transfer ➜ | „Schau heute in deine Einstellungen. Ist dein Konto privat?" |
| 5 Hilfe ➜ | `buildSupportBox()` · 4 `helpQuestions` |
| 6 Abschluss | 4 `memoryRules` · „Das merke ich mir" |

> ⚠️ **Einziges Thema ohne einen einzigen `lesson.remember`.** Station 3 trägt sich hier
> allein über die 7 Übungs-Merksätze und die 4 `memoryRules`. **Kein Inhalt erfinden** —
> siehe Prüf-Tabelle, Frage **P1**.

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

### Offene Fragen — hier entscheidest du, nicht ich

| # | Frage | Warum ich sie nicht selbst beantworte |
|---|---|---|
| **P1** | **Instagram, Station 3:** Reichen die 7 Übungs-Merksätze, oder soll dort ein `lesson.remember` ergänzt werden? | Ergänzen hieße **neuen Inhalt schreiben** — außerhalb der Grenze dieses Auftrags und laut §2 nur mit allen drei Sprachstufen synchron. |
| **P2** | **Gehören `helpQuestions` zu ✅ Prüfen oder zu ➜ Handeln?** Ich ordne sie oben ✅ zu (es sind Selbst-Prüffragen), zeige sie aber beim Hilfe-Anker mit. | Didaktische Entscheidung. Heute stehen sie auf der **Merk-Karte** unter „Das kann ich fragen" — eine Verschiebung würde diese Karte verändern. |
| **P3** | **Station 6 vs. Station 3:** `memoryRules` sind heute die Abschluss-Liste „Das hast du geübt", inhaltlich aber Merksätze. Bleiben sie in 6, oder wandern sie nach 3? | Betrifft das Verhältnis von Wiederholung (§3) zu Zusammenfassung. Meine Empfehlung: **in 6 lassen** — sie sind die Bündelung am Ende, nicht der Merksatz im Moment des Lernens. |
| **P4** | **Übungs-Handy und Trainings-Postfach:** eigene Station, oder Teil von ✅ Prüfen? | Sie sind Handeln *und* Prüfen zugleich. Nicht im 6-Stationen-Raster vorgesehen — bitte einordnen. |
| **P5** | **„Deine eine Sache für heute" als Etikett:** Der Kasten heißt heute „Eine Sache für heute". Soll das Etikett auf „Deine eine Sache für heute" geändert werden? | Das wäre eine **Text**-Änderung an einem sichtbaren Etikett. Erlaubt laut Auftrag (Gestaltungs-Label), aber ich ändere sichtbare Wörter nicht ungefragt — und die Prüfgruppe (§18.8) hat solche Formulierungen ohnehin auf der Liste. |
| **P6** | **Die drei sensiblen Themen** (`betrug`, `hilfe`, `ki`) haben eigene Module „Hilfe"/„Unterstützung" **vor** dem Schluss. Soll Station 5 diese Module aufgreifen — oder daneben stehen? | Doppelung wäre Ballast (§3 Kohärenz), Wegfall ein Eingriff in geschützten Bestand (§1). |

---

## 5. Was beim Bauen gilt (wenn du freigibst)

1. **Kein Sachtext wird angefasst.** Die Stationen sind Behälter; die Sätze bleiben, wo sie sind.
2. **Reihenfolge in sensiblen Themen erhalten:** `hilfe` endet auf *Unterstützung*, `betrug`
   auf *Schutz › Hilfe*. Kein Thema schließt mit der Gefahr (§3, Došen).
3. **Station 5 nutzt die vorhandenen entlastenden Formeln** („Das ist nicht deine Schuld.",
   „Du musst das nicht allein schaffen.") — wortgleich, nicht neu erfunden.
4. **Drei Sprachstufen bleiben unberührt:** Station 3 zeigt `remember` über
   `resolveLessonContent()`, also automatisch in der gewählten Stufe. Kein Eingriff in §2.
5. **`CACHE_VERSION` hochzählen**, sobald `app.js` oder `styles.css` dafür angefasst wird
   (§16.6) — sonst sieht niemand die Änderung.

**Ohne deine Freigabe und ohne Klärung von P1–P6 wird nichts gebaut.**
