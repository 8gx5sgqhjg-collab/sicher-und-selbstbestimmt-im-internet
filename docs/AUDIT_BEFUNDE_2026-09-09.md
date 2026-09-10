# Audit-Befunde — konsolidiert und gegengeprüft

**Stand:** 09.09.2026 · **Status:** Begleit-Doku zur Planung — **an der App wurde nichts gebaut**
**Quellen:** zwei neutrale Ist-Stand-Audits (08.09.2026 und 09.09.2026, beide nur lesend;
die Berichte selbst liegen außerhalb des Repos).
**Methode:** Jeder Fund wurde am Code gegengeprüft (Basis: Commit `5f78b56`; die App-Dateien
sind seitdem unverändert, alle Zeilenangaben gelten weiterhin). Alle Zahlen wurden aus den
Dateien nachgezählt, nicht aus den Berichten übernommen.

**Status-Werte:** **erledigt** · **eingeplant** (Bau-Stapel, Regeln 6–9 im Stations-Dokument §5) ·
**zurückgestellt** (Aufräumen, Lerndesign-Vorschlag Stufe 5) · **dokumentiert** (bewusst so
entschieden) · **kein Handeln** (geklärt oder bewusste Architektur) · **offen** (noch kein Beschluss)

**Pflege:** Bei neuen Beslüssen den Status hier nachtragen.

---

## Die Befunde

| # | Fund | Fundort | Gegencheck | Status |
|---|---|---|---|---|
| 1 | Sprach-Finder verspricht „**3 kurze Fragen**“, hat aber **2 Runden** | `app.js:2303`, `:2309` vs. `SAMPLE_ROUNDS :58–69` | ✓ bestätigt. Kopfzeile „Beispiel 1 von 2“ (dynamisch über `SAMPLE_ROUNDS.length`) und §18.2 sind korrekt — die **UI-Zahl ist der Fehler**, nicht die Runden | **eingeplant** — Bau-Stapel, Regel 8 |
| 2 | Offline-Seite verlinkt „Nochmal versuchen“ auf `href="/"` — führt auf GitHub Pages **aus der App hinaus** | `sw.js:204` | ✓ bestätigt. Fix: `href="./"` (1 Zeile) | **eingeplant** — Bau-Stapel, Regel 9 |
| 3 | Kommentar sagt, „**einige Themen** (KI, Fake News, Betrug, Einkaufen) haben ihre Fragen unter `quizQuestions`“ — real haben **alle 12 Themen** `quizQuestions` (kein Thema mehr `quiz`) | `content-de.js:1748–1750` | ✓ bestätigt | **eingeplant** — Bau-Stapel, Regel 9 |
| 4 | Veröffentlichungs-Daten veraltet: JSON-LD `dateModified` und 15 × `sitemap.xml`-`lastmod` stehen auf 2026-06-14 | `index.html:40`, `sitemap.xml` | ✓ bestätigt | **eingeplant** — beim Bau auf Releasedatum setzen (Regel 9) |
| 5 | humans.txt verspricht „**kein localStorage**“ — falsch, die App nutzt 15+ Keys | `humans.txt:12` | ✓ bestätigt | **erledigt** 09.09.2026 (Hygiene-Commit) |
| 6 | README: „Keine Speicherung: … kein Lernstand“ — Lernstand wird mit Einwilligung lokal gespeichert; „Drei Lernwege“-Zeile veraltet; Hash-Beispiele in Legacy-Form | `README.md:24`, `:28`, `:29` (vor dem Fix) | ✓ bestätigt. „Kurz lernen“/„Mehr lernen“ existieren als Modi weiter (`app.js:4123`), das Rahmenkonzept „Drei Lernwege“ aber nicht mehr | **erledigt** 09.09.2026 (Hygiene-Commit) |
| 7 | `_pikto-temp.tgz` (3,4 KB) ohne jede Referenz im Repo | Root | ✓ bestätigt (einzige grep-Treffer sind Variablennamen `isStartLesson_pikto`) | **erledigt** 09.09.2026 (gelöscht, Hygiene-Commit) |
| 8 | `praxis/*` (3,0 MB) und `material/*` (3,9 MB) sind aus der App verlinkt, aber **nicht im Precache** — offline führen diese Links zur Offline-Seite | `sw.js` (0 Treffer), `app.js:3579–3592` | ✓ bestätigt. Die praxis-Seiten sind in sich geschlossen (Screenshots eingebettet) | **dokumentiert** — Beschluss 09.09.2026: bewusst online; die Offline-Seite wird durch Fund 2 repariert |
| 9 | Profil-Löschung und Auto-Migration erfassen nur **6 von 15** Profil-Keys — 9 Keys (u. a. `motion`, `vorlesen-*`, `letzte-lektion`, `mengen-wahl`, `menue-gesehen`, `einrichtung-rest`) bleiben als `base::profilId`-Reste liegen | `PROFILE_BASE_KEYS` `app.js:328`; Löschung `:2231`/`:2277`; Migration `:374–392` | ✓ bestätigt. Relevant gerade auf geteilten Geräten (`geraet-geteilt`) | **dokumentiert** — Beschluss 09.09.2026: noch nicht terminiert; bei Angehen ein eigener Commit mit eigener Prüfung |
| 10 | `blockRead` doppelt (global + lokale Kopie in `renderLesson`) | `app.js:4075`, `:4163` | ✓ bekannt; der Code-Kommentar nennt die Zusammenführung selbst als „späteren Schritt“ | **erledigt** 09.09.2026 (Paket V4: lokale Kopie entfernt, renderLesson nutzt die globale Funktion) |
| 11 | Toter Code: `getIllustrationHtml()` (0 Aufrufer), `collectReadableText()` (ungenutzt laut Kommentar) | `app.js:963`, `:1378` | ✓ bestätigt | **erledigt** 09.09.2026 (Paket V4: entfernt; buildStepPath/buildCompletionProgress gleich mit, ersetzt durch buildProgress) |
| 12 | Vorlese-Knopf-Technik inkonsistent: `span role="button"` in `blockRead` vs. nativer `<button>` in `sectionReadChip` | `app.js:4075`/`:4163` vs. `:1605` | ✓ bestätigt (Begründung dort: Tastatur, H-01) | **zurückgestellt** — Aufräumen (Stufe 5) |
| 13 | Tote `.progress-area` | `index.html:86` | ✓ (der Lerndesign-Vorschlag `:153` nennt sie selbst „bisher tot“) | **zurückgestellt** — Aufräumen (Stufe 5) |
| 14 | Root-Logo-Duplikate zu `assets/brand/` | `logo-sozialstiftung-nrw.jpeg`, `logo-tilbeck-alexianer.jpeg` (Root) | ✓ nicht referenziert — alle Verweise zeigen auf `assets/brand/…` | **offen** — Lösch-Kandidat, noch kein Beschluss |
| 15 | Doku-Zahl **121** Quizfragen — richtig sind **122** | Stations-Dokument (2 Stellen, vor dem Fix) | ✓ 122 nachgezählt (Skript über `topics.js`) | **erledigt** 09.09.2026 (Doku-Commit) |
| 16 | Zeilen- und Namen-Drift im Lerndesign-Vorschlag (`renderLesson` „:4066“ — real `:4111`; `buildCompletionProgress` „:4395“ — real `:4442`; `buildMerksatz` ≠ `buildRememberBox`; `buildProgress`/`buildWegweiser` = nur Planung) | `docs/lerndesign-vorschlag.md` | ✓ bestätigt; die Stufen-Tabelle markiert Stufe 5 selbst als offen | **zurückgestellt** — Aufräumen (kosmetisch) |
| 17 | Zweites Audit zählte **136** Precache-Einträge, erstes **137** | `sw.js:16–180` | ✓ **137** (robust nachgezählt: 137 Strings `"./…"` im Array) | **kein Handeln** — Zahl geklärt |
| 18 | Im flachen Audit-Klon war nur 1 Commit sichtbar, die Lerndesign-Commit-Hashes galten als ungeprüft | — | ✓ Voll-Klon: **334 Commits**; alle 5 Hashes (`8e83e32`, `b183533`, `9df7023`, `df20404`, `6fdc949`) existieren | **kein Handeln** — geklärt |
| 19 | Bewusste Architektur, kein Handeln: Cache-Kopplung an manuellen `CACHE_VERSION`-Bump (§16.6); Routing-Legacy ohne `thema-`-Präfix für gedruckte QR-Karten; Skript-Reihenfolge `topics.js` → `content-de.js` → `app.js` als implizite Abhängigkeit (`index.html:146–152`); Sitzungsdaten nur im RAM (§14); Inline-`onclick`; geräteabhängige Vorlese-Stimme | divers | ✓ | **kein Handeln** |

## Beschlüsse vom 09.09.2026

1. **Befund-Liste im Repo** (dieses Dokument) — je Fund Fundort, Gegencheck, Status.
2. **Hygiene-Commit sofort** (Funde 5–7): humans.txt, README.md, `_pikto-temp.tgz` — keine
   App-Dateien, nicht im Precache, daher kein `CACHE_VERSION`-Bump nötig.
3. **sw.js-Offline-Link und kleine Korrekturen reiten im Bau-Stapel** (Funde 2–4, Regel 9 im
   Stations-Dokument) — der Stapel hebt `CACHE_VERSION` ohnehin.
4. **praxis/* und material/* bleiben bewusst online** (Fund 8).
5. **Profil-Schlüssel-Lücke nur dokumentiert** (Fund 9) — sensible Profil-Logik; bei Angehen
   ein eigener Commit mit eigener Prüfung, nicht im Einstiegsseiten-Stapel.
