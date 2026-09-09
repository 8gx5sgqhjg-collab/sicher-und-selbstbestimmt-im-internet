# CLAUDE.md — Verbindliche Arbeitsanweisung

**Projekt:** Sicher und selbstbestimmt im Internet (Marke: „Alex und Tilda")
**Live:** https://alex-und-tilda.github.io/sicher-und-selbstbestimmt-im-internet/
**Repo:** alex-und-tilda/sicher-und-selbstbestimmt-im-internet (GitHub Pages)
**Träger:** Stift Tilbeck / Alexianer · gefördert u. a. von der Sozialstiftung NRW
**Art:** Barrierearme Lern-Plattform in drei Sprach-Ebenen, als reine JavaScript-SPA (kein Framework, kein Build-Tool).

> Diese Datei liegt im Repo-Root. Claude Code liest sie bei jeder Session als verbindliche Regel. Wenn eine Anweisung der nutzenden Person dieser Datei widerspricht, weise freundlich darauf hin und frage nach.
>
> Du arbeitest mit drei Kompetenzen zugleich: **inklusive Lern-/Mediendidaktik (Eingliederungshilfe)**, **barrierefreie Web-Entwicklung (WCAG, kognitive Barrierefreiheit)** und **praktische Umsetzung** (Git, Editor). Design-Entscheidungen werden **begründet** aus Lerntheorie und Barrierefreiheits-Normen getroffen, nicht aus Bauchgefühl. Jede Entscheidung lässt sich auf ein Prinzip in §3 oder §6 zurückführen.

---

## 1. Prime Directive

**Barrierefreiheit, verständliche Sprache und Teilhabe stehen über allem.** Ziel ist nicht „Inhalte zeigen", sondern **Handlungskompetenz und Selbstbestimmung im digitalen Alltag** stärken. Erfolg heißt: Eine Person erkennt eine Gefahr, weiß was sie tun und wo sie Hilfe holen kann — und traut sich das zu. Das ist ein **Teilhabe-Ziel** (UN-BRK, ICF), kein reines Wissensziel. Im Zweifel gewinnt immer die Verständlichkeit für Menschen mit Lern-Schwierigkeiten — nicht technische Eleganz, nicht Optik, nicht Kürze des Codes.

**Bestand schützen — niemals ohne Auftrag entfernen oder beschädigen:**

- Drei-Ebenen-Sprachsystem (§2) und die Begleit-Ebene für Fachkräfte (§7)
- Dark Mode (`prefers-color-scheme`, dokumentierte APCA-Kontraste in `styles.css`)
- Vorlese-/Audio-Funktion (Web Speech API), Ton-Schalter und Vorlese-Tempo-Einstellung
- Offline-Fähigkeit (Service Worker `sw.js`, PWA-Manifest)
- **Feste 5-Punkte-Tab-Navigation** unten (Start · Themen · Mein Lernweg · Hilfe · Einstellungen, `main-tabbar` in `index.html`) inkl. Hash-Routing/Browser-Zurück (`rememberRoute`, `handleHash`)
- **Orientierungssystem:** Orientierungszeile (`#orientLine`) mit Farb-Faden in Themen-Farbe, Bild-Anker (Themen-Symbol), Hör-Knopf; Vorlesen beginnt mit dem Orientierungssatz; **Rück-Anker** (`lastLessonContext`, „Weiter lernen: …, Schritt X")
- **Fortschritts-Erkennung ohne Speicherzwang:** Sitzungs-Gedächtnis `sessionDoneTopics` (nur RAM, KDG-konform), Fortschritts-Rückmeldung + Lernstand-Einwilligung auf der Abschluss-Seite
- **Adaptive Themen-Seite** (`renderTopicChoice`): EINE Hauptaktion je Zustand (neu → Lernen starten + Mengen-Wahl; unterbrochen → Weiter lernen; geschafft → Quiz wiederholen); Quiz/Merk-Karte als „Für später"-Chips
- **Themen-Gruppen** auf der Themen-Seite (`TOPIC_GROUPS`: Wichtig für alle · Apps · Gefahren und Hilfe) und exakt gleich große Kacheln (`grid-auto-rows: 1fr`)
- **Frage des Tages** (Start-Seite, deterministisch übers Datum, kein Tracking), **Erfolgs-Heft** (`printSuccessBook`) und **QR-Karten** (`assets/qr/`, `printQrCards`, QR im Begleit-Panel — lokal erzeugt, kein externer Dienst)
- **Einweisungs-Schritt** fürs Menü (`renderMenuIntro`, einmalig) und Menü-Erklärung in der Hilfe
- Wörter-Hilfe (Glossar, 50+ Einträge) mit antippbaren Begriffen
- „Zurück / Weiter"-Navigation, Hilfe-Knopf, Pause-Funktion, Schriftgrößen-Schalter (in Einstellungen)
- Die lokale Schrift **Atkinson Hyperlegible**
- Die Logos der Träger im Footer

Wer eine dieser Funktionen anfasst, prüft danach ausdrücklich, dass sie noch funktioniert.

---

## 2. Drei-Ebenen-Sprachsystem (zentrale Architektur)

Jede Lerneinheit existiert in **drei Sprach-Ebenen**. Die Auswahl trifft die nutzende Person am Start; sie ist jederzeit über „Sprache: …" umstellbar und wird gemerkt.

| Schlüssel | Anzeige | Zielgruppe | Quelle im Code |
|-----------|---------|-----------|----------------|
| `leicht` | Leichte Sprache | Menschen mit Lern-Schwierigkeiten | **Basistext** in `topics.js` |
| `einfach` | Einfache Sprache | Sprachniveau ~B1, Lese-Ungeübte | `versions.einfach` in `content-de.js` |
| `standard` | Alltagssprache | alle anderen | `versions.standard` in `content-de.js` |

**Technik (nicht ändern ohne Auftrag):**

- `topics.js` enthält `const topics = [...]`. Die Lektions-Felder dort **sind** die Leichte-Sprache-Fassung.
- `content-de.js` enthält `CONTENT_VERSIONS[themaId][lektionTitel] = { einfach:{...}, standard:{...} }` + `applyContentVersions()`. Das hängt die Fassungen als `lesson.versions` an. Optional gibt es `SELF_ASSESSMENT_VERSIONS` (Einstiegsfrage je Stufe → `topic.saVersions`).
- Renderer in `app.js`: `resolveLessonContent(lesson, languageLevel)`. **Fallback-Kette:** `leicht` → Basistext; `einfach` → `versions.einfach` sonst Basistext; `standard` → `versions.standard` sonst `einfach` sonst Basistext. So bleibt die Seite immer funktionsfähig.
- Verknüpfung über den **exakten Lektions-Titel**. Titel in `content-de.js` müssen wortgleich zu `topics.js` sein.

**Pflicht:** Wird eine Lektion inhaltlich geändert, werden **alle drei Ebenen synchron** gepflegt. Diese Drei-Ebenen-Logik ist die Umsetzung des UDL-Prinzips *Repräsentation* (§3). Prüfung:

```bash
node --check topics.js && node --check content-de.js
# jede Lektion: versions.einfach UND versions.standard; keine verwaisten Titel in CONTENT_VERSIONS
```

---

## 3. Lernwissenschaftliches Fundament (verbindlich)

Jeder Inhalt und jede Interaktion folgt diesen Prinzipien (in Klammern die Design-Konsequenz):

**Universal Design for Learning (UDL) als Leitrahmen — alle drei Säulen sichtbar machen:**
- *Repräsentation* (das Was): jeder Inhalt auf mehreren Wegen — Text in mehreren Sprach-Ebenen (§2), Vorlesen/Audio, Piktogramm.
- *Handlung und Ausdruck* (das Wie): Lernende tun mehr als lesen — Selbstchecks, eigener Lernweg, „nochmal zeigen", ausdruckbare Merk-Karte. Kein erzwungener linearer Zwang.
- *Engagement* (das Warum): Alltagsbezug, Erfolgserlebnisse, ermutigende Rückmeldung, klarer Sinn („Das schützt dich, weil …").

**Cognitive Load Theory (Sweller) + Multimedia-Lernen (Mayer):**
- Ein Konzept pro Bildschirm (Segmentierung). Keine Wand aus Inhalt.
- Signaling: Wichtiges hervorheben, klare Überschriften, Piktogramm-Anker.
- Kohärenz: keine Dekoration ohne Funktion, keine sinnlose Animation (`prefers-reduced-motion` respektieren).
- **Bewusste Ausnahme zum Redundanz-Prinzip:** Gleichzeitiges Hören und Mitlesen hilft dieser Zielgruppe. Vorlesen synchron zum sichtbaren Text ist erwünscht — als Wahl, nicht aufgezwungen.

**Aktives Erinnern & Wiederholung:** Quiz ist Retrieval Practice (Testing-Effekt), keine Prüfung. Kernbotschaften mehrfach wiederholen (Anfang/Mitte/Schluss) und über Module hinweg verzahnen (verteiltes Lernen). Quiz-Rückmeldung **elaboriert und ermutigend** (kurz erklären, warum richtig/falsch).

**Mediiertes Lernen & Settings:** Lernen geschieht oft begleitet. Beide Wege unterstützen — **SOLO** (allein, vollständig selbsterklärend) und **begleitet** (Tandem/Peer): siehe Begleit-Ebene §7. Begleit-Hinweise dürfen den SOLO-Gebrauch nicht stören.

**Emotionale Sicherheit (Došen):** Vorhersehbarkeit, klare Struktur, angstfreie Fehlerkultur, kein Overwhelm. Bei belastenden Themen (Cybermobbing, Online-Betrug, Belästigung): ruhiger Ton, sofort die handlungsfähige Botschaft („Das ist nicht deine Schuld. Du kannst Hilfe holen."), **nie Angst als Lernmittel**.

---

## 4. Zielgruppe und Haltung

Erwachsene mit Lern-Schwierigkeiten, geistiger Behinderung oder Verständnis-Schwierigkeiten; sehr unterschiedliche Lese- und Konzentrationsfähigkeit. Haltung: wertschätzend, ressourcenorientiert, empowernd, Selbstbestimmung fördernd, **niemals infantilisierend oder belehrend**.

---

## 5. Regeln für Leichte Sprache (Ebene `leicht` / Basistext)

Nach dem offiziellen Ratgeber (Netzwerk Leichte Sprache / BMAS, DIN SPEC 33429) und den EU-Easy-to-Read-Regeln (Inclusion Europe):

**Wörter:** einfache, kurze, bekannte Wörter. Lange zusammengesetzte Wörter mit **Bindestrich** trennen (Bank-Daten, Sprach-Nachricht). Im ganzen Text dasselbe Wort für dieselbe Sache. Keine Abkürzungen/Fach-/Fremdwörter ohne Erklärung. **Kein Genitiv** („vom Vater" statt „des Vaters"). **Kein Konjunktiv** (würde, könnte, wäre …). Tun-Wörter statt Haupt-Wörter, Aktiv statt Passiv, einfache Zeit-Formen. Keine Rede-Wendungen / bildliche Sprache.

**Zahlen/Zeichen:** Zahlen als Ziffern. Große Zahlen verständlich runden. **Anführungs-Zeichen vermeiden.** Ausrufe-Zeichen nur sparsam und nur, wenn inhaltlich nötig (z. B. eine Betrugs-Masche zeigen). Sonderzeichen (`; / § % & ()`) vermeiden.

**Sätze:** kurz, **eine Aussage pro Satz, keine Neben-Sätze.** Einfacher Satz-Bau: wer macht was. Verkürzte Sätze („Oder", „Und", „Aber") erlaubt.

**Texte:** möglichst kurz, klarer Aufbau, persönliche Anrede (§9).

**Logo-Hinweis:** Für den offiziellen Einsatz mit dem geschützten Leichte-Sprache-Logo ist eine **Prüfgruppe** (Menschen mit Lern-Schwierigkeiten) nötig (§13). Logo-relevante neue Texte ausdrücklich flaggen.

---

## 6. Regeln für Einfache Sprache (Ebene `einfach`)

Plain Language, etwa Niveau **B1**. **Sichtbar voller als Leichte Sprache, einfacher als Alltagssprache.** Kurze, aber **verbundene** Sätze (ein Nebensatz erlaubt; „weil/wenn/damit/deshalb"). Größerer, gängiger Wortschatz; Fachwörter kurz erklären. Aktiv, konkrete Beispiele. Keine Piktogramm-Pflicht. Richtwert: deutlich mehr als ~6 Wörter/Satz (Leicht), aber keine Schachtelsätze.

---

## 7. Begleit-Ebene „Für Begleitpersonen und Fachkräfte" (Fachsprache Eingliederungshilfe)

Eine **eigene, klar getrennte Ebene** — keine Sprach-Stufe für Lernende. Quelle: `begleitung-de.js` (`COMPANION[themaId]` → `topic.companion`), Anzeige als aufklappbares Panel im Themen-Einstieg + Druck-/PDF-Handout (`printCompanion`). Sieben Abschnitte je Thema: **Kompetenz-Einordnung, Lernziele, Methodische Hinweise, Gesprächsanlässe, Hinweise zur Begleitung, Rechts-/Fachbezüge, Alltagstransfer.**

Diese Ebene setzt das mediierte Lernen (§3) und das Kompetenz-Modell um:
- **Lernziele** beobachtbar formulieren („Nach diesem Thema kannst du …").
- **DigComp 2.2** verorten (v. a. Bereich 4 „Sicherheit", Bereich 2 „Kommunikation").
- **ICF** verknüpfen: was die Person danach im **Alltag** besser kann (Aktivität/Teilhabe), nicht nur Wissen.

**Kompetenz-Einordnung (`kompetenzen`), Stand August 2026 für alle 12 Themen gepflegt:**

```js
kompetenzen: {
  digcomp: [ { code: "4.2", titel: "…", stufe: "Stufe 1–2 · grundlegend", bezug: "…" } ],
  icf:     [ { code: "d177", titel: "Entscheidungen treffen", bezug: "…" } ]
}
```

- `code` DigComp: `<Bereich>.<Kompetenz>` nach DigComp 2.2 (EU-Fassung, 5 Bereiche / 21 Kompetenzen). Schwerpunkt der Plattform: Bereich 4 (Sicherheit) und Bereich 2 (Kommunikation).
- `stufe`: für diese Zielgruppe durchgehend Stufe 1–2 (grundlegend: mit Anleitung bis selbstständig bei einfachen Aufgaben). Höhere Stufen nicht behaupten.
- `code` ICF: `d…` Aktivitäten und Teilhabe, `e…` Umweltfaktoren (z. B. `e310` Vertrauensperson, `e5750` Beratungsstellen). **Keine `b`-Codes (Körperfunktionen)** — die Ebene beschreibt Teilhabe, kein Defizit.
- `bezug` beschreibt beobachtbares Alltags-Handeln, ressourcenorientiert formuliert (§4).
- Gerendert von `buildCompetenceBlock()` in `app.js`; im Handout steht der Block direkt hinter den Lernzielen.

---

## 8. Anrede

**Durchgängig „du"** — auf allen drei Lern-Ebenen, in allen Texten, Knöpfen und Hinweisen. Bewusst nähebewusst gewählt (Tilbeck-/Eingliederungshilfe-Kontext) und regelkonform, weil die Lesenden bekannt sind. Die Begleit-Ebene (§7) ist neutral/fachlich formuliert. Nicht zu „Sie" wechseln, außer ausdrücklich angeordnet.

---

## 9. Barrierefreiheit und Normen (verbindlich)

- **Maßstab: WCAG 2.2 Stufe AA**, dazu **BITV 2.0** und **EN 301 549**.
- **Kognitive Barrierefreiheit** zusätzlich nach WCAG-COGA: einfache Navigation, vorhersehbares Verhalten, klare Wege zur Hilfe, **keine Zeitlimits**, keine ablenkende Bewegung.
- Kontrast mindestens AA; bestehende Werte sind in `styles.css` als APCA dokumentiert — nicht verschlechtern. Auch Dark Mode AA-konform halten.
- Sichtbarer **Fokus-Rahmen**, `prefers-reduced-motion` respektieren.
- Jedes `<img>` braucht ein `alt` (dekorativ: `alt="" aria-hidden="true"`).
- Sinnvolle Überschriften-Hierarchie, `lang="de"`, „Zum Inhalt springen"-Link, `Escape` schließt Overlays.
- Bedienelemente groß (Knöpfe ≥ ~58 px), große Touch-Flächen, alles per Tastatur bedienbar.
- Werkzeugleiste erhalten: Schriftgröße A / A+ / A++, Vorlesen, Navigation, Sprach-Auswahl.

---

## 10. Design-System (Tilbeck / „Alex und Tilda")

- **Schrift:** Atkinson Hyperlegible (lokal in `assets/fonts/`), Fallback `Segoe UI, Arial`.
- **Farben:** ausschließlich über die CSS-Variablen in `styles.css` (`--accent` = Blau `#0a5c95`, `--ink`, `--surface`, `--line`, Feedback-Farben gut/warn/bad …). **Keine hartkodierten Hex-Farben** in neuen Stilen — sonst bricht der Dark Mode.
- **Form:** ruhige, runde Karten (`--radius-l/m/s`), weiche Schatten, sanfter Hintergrund-Verlauf. Ruhig und reizarm (Kohärenz, §3).
- **Themenfarben:** je Thema eine Farbe über `getTopicColorStyle()`. Beibehalten.
- **Logos** der Träger im Footer nicht entfernen.

---

## 11. Piktogramm-System (eigene Icons)

**Stand August 2026: Die Lern-Plattform nutzt ausschließlich eigene, neu gezeichnete SVG-Icons.** ARASAAC wurde abgelöst — es gibt keinen externen Bild-Aufruf mehr.

- Quelle: eigene SVGs in `assets/pictograms/<key>.svg`, im Marken-Blau gezeichnet. Neu erstellt, **nicht** von ARASAAC abgeleitet → keine CC-BY-NC-SA-Pflichten, keine Quellenangabe nötig.
- Resolver in `app.js`: `pictoSrc(key)` liefert schlicht `assets/pictograms/<key>.svg`. Zusätzlich verfeinert `refinePicto(key, text)` die Zuordnung anhand des Satz-Textes über `PICTO_RULES` (zentral und umkehrbar — `topics.js` bleibt unverändert).
- Offline: alle Piktogramme stehen im Precache von `sw.js`. **Echte Offline-Fähigkeit ist damit erreicht** (früher offener Punkt §18.5).
- Neues Piktogramm: SVG in `assets/pictograms/` anlegen (viewBox `0 0 96 96`, `role="img"`, `aria-label`, Farben aus dem Marken-Blau) und in die Precache-Liste in `sw.js` eintragen.
- **Piktogramme nicht als selbsterklärend voraussetzen** — mit der Zielgruppe testen (§13).
- **Altlast entfernt (September 2026):** `download_pictos.js` (lud ARASAAC-Bilder von `static.arasaac.org` anhand einer Liste `ARASAAC_PICTO` in `app.js`) wurde gelöscht. Diese Liste gab es seit der Ablösung oben nicht mehr, das Skript brach beim Aufruf sofort ab — reiner toter Rest aus der alten externen Strategie. `download-fonts.sh` und `assets/fonts/DOWNLOAD.md` bleiben, sie funktionieren weiterhin für die lokale Schrift. **Nicht wieder anlegen ohne Auftrag.**

**Ausnahme Workshop-Seiten:** Die Praxis-Seiten unter `praxis/` stammen aus der Workshop-Pipeline und enthalten weiterhin **eingebettete ARASAAC-Bilder** (base64, kein externer Aufruf). Ihre Quellenangabe im Fuß („Bildzeichen: ARASAAC – Autor Sergio Palao (Gobierno de Aragón), Lizenz CC BY-NC-SA") ist Pflicht und **bleibt stehen**.

---

## 12. Modul-/Lektions-Aufbau (Inhaltsarchitektur)

12 Themen (Datenschutz inkl. Passwörter, WhatsApp, Facebook, Instagram, YouTube, Snapchat, TikTok, Hilfe bei Problemen, KI/Chatbots, Fake News/KI-Fakes, Online-Betrug, Online-Einkaufen). **Keine Module ohne Auftrag erfinden.** Neue Inhalte immer im **identischen Format** der bestehenden (Wiedererkennbarkeit).

Lektions-Felder (in `topics.js`, je Stufe überschreibbar via `content-de.js`): `text[]` (Sätze, je mit optionalem `pictogram`), `bullets[]`, `examples[]`, `warning`, `success`, `remember` (Merksatz), `practice` (Übung mit elaboriertem Feedback). Pro Thema: `selfAssessment` (Einstiegsfrage = Aktivierung/Engagement), `quiz` (Retrieval Practice), `learningGoals`.

Pädagogische Rahmung konsistent über alle Module: Lernziel + Aktivierung (Engagement) → ein Konzept klar (CLT) → Merksätze (Wiederholung) → Warnsignale & Alltags-Situationen → Quiz mit ermutigendem Feedback → Zusammenfassung + **Transfer** („eine Sache, die du heute tun kannst") + Hilfe-Bezug. Begleit-Ebene (§7) ergänzt Gesprächsimpulse.

---

## 13. Partizipation, Evaluation, Aktualität

- **Co-Design:** Vor offiziellem Einsatz Prüfung durch eine **Prüfgruppe** von Menschen mit Lern-Schwierigkeiten — auf Verständlichkeit der **Texte und der Piktogramme**. Unsere Texte sind ein fachlich sauberer Entwurf dafür.
- **Datensparsame Wirkungs-Evaluation:** strukturierte Beobachtung statt Datensammlung (Navigierbarkeit, Verständlichkeit, Nutzung des Vorlesens, kann die Person das Transfer-Ziel benennen?). Ergebnisse fließen in die nächste Iteration. Kein Tracking, keine Lernanalyse über die Person.
- **Aktualität:** Inhalte zu Betrug, Plattformen und KI veralten schnell. Bei Änderungen auf seriöse, aktuelle Quellen achten (z. B. klicksafe, BSI, polizeiliche Kriminalprävention, jugend.support) und überprüfungsbedürftige Stellen markieren.

---

## 14. Datenschutz

- Maßgeblich ist das **KDG (Katholisches Datenschutzgesetz)** (kirchlicher Träger), zusätzlich DSGVO-Prinzipien. Hinweise in `datenschutz.html`.
- Keine personenbezogenen Daten, keine Tracker, keine Analytics, kein Login, keine sendenden Formulare. **Stand August 2026 gar keine externen Quellen mehr:** Schrift liegt lokal in `assets/fonts/`, Piktogramme sind eigene lokale SVGs (§11).
- `localStorage` speichert **nur lokale Einstellungen** (Sprach-Ebene, Schriftgröße, Lern-Fortschritt der Sitzung). Das ist kein personenbezogenes Datum und KDG-konform. Lern-Fortschritt ist bewusst flüchtig; für die Mitnahme dient die **ausdruckbare Merk-Karte** und die dialogische Reflexion mit der Begleitperson.

---

## 15. Architektur & Dateien

| Datei | Zweck |
|-------|-------|
| `index.html` | Hülle. Lädt `topics.js` → `content-de.js` → `begleitung-de.js` → `app.js` (Reihenfolge wichtig). |
| `topics.js` | 12 Themen, 129 Lektionen, Quiz, Merksätze. Basistext = **Leichte Sprache** (DIN-SPEC-33429-konform: keine Nebensätze, kein Konjunktiv, kein Passiv außer gewollten Betrugs-Zitaten). |
| `content-de.js` | `CONTENT_VERSIONS` (`einfach`/`standard`) + `SELF_ASSESSMENT_VERSIONS` + Apply-Funktionen. |
| `begleitung-de.js` | `COMPANION` (Begleit-Ebene für Fachkräfte, §7). |
| `app.js` | Renderer + Engine: Sprach-Ebenen, `resolveLessonContent`, `resolveSelfAssessment`, `pictoSrc`, Tab-Navigation (`navigateTab`, `setActiveTab`), Hash-Routing (`handleHash`, `rememberRoute`), Orientierung (`setOrientation`, `lastLessonContext`), Sitzungs-Fortschritt (`sessionDoneTopics`), Frage des Tages, `printSuccessBook`, `printQrCards`, Glossar (`GLOSSAR`), Vorlesen, Dark-Mode-Reaktion, `buildCompanionPanel`/`printCompanion`. |
| `styles.css` | Design-System, Dark Mode, APCA-Kontraste, Responsive, Tab-Leiste (`main-tabbar`), textsichere Themen-Farben (`--topic-text`). |
| `sw.js` | Offline-Cache (App-Dateien, eigene Piktogramme, QR-Karten). `CACHE_VERSION` erhöhen, sobald eine Datei aus der Precache-Liste geändert wurde — siehe §16.6, dort steht auch, warum. |
| `fortschritt.html` | Live-Dashboard (Stand der Ebenen + GitHub-Commits). |
| `assets/` | Schriften, Logos, Icons, Illustrationen, lokale Piktogramme. |
| `assets/qr/` | Lokal vorerzeugte QR-Codes je Thema + Startseite (13 SVGs, kein externer Dienst). Bei neuen Themen neu erzeugen. |
| `_vorschau-*.html` | Lokale Berichte (DIN-Prüfung, Aktualität, Wegzeichen-Konzept) — in `.gitignore`, nie ins Repo. |

Reines HTML/CSS/JS, **kein Framework/Bundler/npm**. JS wird über `<script src>` als Browser-Globals geladen (`const topics`, `const CONTENT_VERSIONS`, `const COMPANION` sind absichtlich global). Interne Verweise **relativ** (funktioniert im Unterpfad von GitHub Pages). Diese Einfachheit ist gewollt — kein Build-System ohne Auftrag.

---

## 16. Arbeitsweise & Workflow

1. **Erst lesen, dann ändern:** betroffene Dateien aus §15 lesen; Architektur verstehen.
2. **Kleine, begründete Schritte:** jede Änderung mit Zweck und Bezug zu einem Prinzip (§3/§9). Vor der Übernahme zeigen, was geändert wird; nichts ohne Rückfrage löschen.
3. Inhalte ändern → **alle drei Ebenen** (§2); Begleit-Ebene (§7) bei Bedarf mitpflegen.
4. **Datenschutz-Check bei jeder Änderung:** kein neues Tracking, kein neuer externer Aufruf, keine neue Speicherung.
5. **Lokal prüfen** vor Veröffentlichen:
   ```bash
   node --check app.js && node --check topics.js && node --check content-de.js && node --check begleitung-de.js && node --check sw.js
   python3 -m http.server 8000   # http://localhost:8000 testen
   ```
6. **`CACHE_VERSION` in `sw.js` hochzählen, sobald *irgendeine* Datei aus der Precache-Liste geändert wurde** — also insbesondere bei jeder Änderung an `app.js`, `styles.css`, `index.html` oder den Inhalts-Dateien (`topics.js`, `content-de.js`, `begleitung-de.js`, `szenarien-de.js`, `regeln-de.js`, `uebungen-de.js`), und natürlich bei geändertem `sw.js` oder geänderter Precache-Liste selbst.
   **Warum das keine Formsache ist:** Alles außer HTML wird **Cache-first** ausgeliefert (`sw.js`, Fetch-Handler: `if (cached) return cached;`). Ohne neue Version liefert der Browser bei jedem, der die Seite schon einmal offen hatte, weiter die **alte** Datei aus — er fragt das Netz gar nicht erst. Die Änderung ist dann zwar auf GitHub Pages, kommt aber bei niemandem an. Genau so blieben im September 2026 mehrere Änderungen an `app.js` unsichtbar, weil die Regel vorher nur von „`sw.js` oder Precache-Liste" sprach und `app.js` **in** dieser Liste steht.
   Vor dem Hochzählen prüfen, dass alle Einträge der Precache-Liste auf existierende Dateien zeigen — ein toter Eintrag lässt `cache.addAll` und damit die ganze Installation scheitern.
7. **Veröffentlichen über GitHub Desktop** (Commit to main → Push origin) — erst nach **ausdrücklicher Freigabe**. Die nutzende Person ist nicht technisch; Schritte einfach erklären. (Bei „lock file"-Meldung: GitHub Desktop beenden, `rm ~/Downloads/lernplattform-live/.git/index.lock`, neu öffnen.)
8. Vorschau-/Hilfsdateien (`_vorschau-*.html`, `*.bak`) sind in `.gitignore` und gehören nicht ins Repo.

---

## 17. Qualitäts-Checkliste vor jedem Push

**Pädagogik**
- [ ] Geänderte Lektion in **allen drei Ebenen** vorhanden und synchron (§2).
- [ ] Alle drei UDL-Säulen sichtbar; ein Konzept pro Bildschirm (CLT).
- [ ] Quiz mit elaboriertem, ermutigendem Feedback; Transfer-Schritt vorhanden.
- [ ] Belastende Themen emotional sicher (Došen); Begleit-Hinweise stören SOLO nicht.
- [ ] Lernziel + DigComp/ICF-Bezug in der Begleit-Ebene gepflegt (§7).

**Sprache & Barrierefreiheit**
- [ ] Leichte Sprache hält §5 ein; Einfache Sprache sichtbar voller (§6); Anrede „du" (§8).
- [ ] WCAG 2.2 AA / BITV 2.0 / EN 301 549 + COGA beachtet; Kontrast nicht verschlechtert; alle Bilder mit `alt`.
- [ ] Vorlesen, Schriftgröße, Tastatur, Skip-Link, Fokus, `Escape` funktionieren.
- [ ] Neues Piktogramm als SVG in `assets/pictograms/` angelegt und in die Precache-Liste in `sw.js` eingetragen (§11); `refinePicto`-Regel geprüft, Fallback intakt.
- [ ] Logo-relevante Leichte-Sprache-Texte für die Prüfgruppe geflaggt (§13).

**Technik & Datenschutz**
- [ ] `node --check` für alle berührten JS-Dateien ohne Fehler; lokal getestet.
- [ ] Statisch, kein Backend/Build; **keine externen Quellen** — Schrift lokal in `assets/fonts/`, Piktogramme als eigene SVG in `assets/pictograms/` (§11). Ausnahme: `praxis/` mit eingebetteten ARASAAC-Bildern (base64, kein Aufruf) samt Pflicht-Quellenangabe.
- [ ] Keine neue Speicherung/Tracker (KDG/DSGVO); relative Pfade.
- [ ] Dark Mode, Vorlesen, Offline, Navigation funktionieren weiter.
- [ ] **`CACHE_VERSION` erhöht, sobald eine Datei aus der Precache-Liste geändert wurde** — also bei jeder Änderung an `app.js`, `styles.css`, `index.html`, den Inhalts-Dateien oder `sw.js` selbst (§16.6). Sonst bleibt die alte Fassung im Cache und die Änderung erreicht niemanden.
- [ ] Titel-Abgleich `content-de.js` ↔ `topics.js` stimmt (keine verwaisten Fassungen).
- [ ] Klare Commit-Nachricht; Freigabe der nutzenden Person liegt vor.

---

## 18. Offene Entscheidungen (mit der nutzenden Person klären)

1. **Dritte Ebene:** bleibt „Alltagssprache (für alle)" — oder zusätzlich/stattdessen weiter ausbauen? (Die Fachkräfte-Inhalte liegen bereits in der separaten Begleit-Ebene §7.)
2. ~~**Standard-Start-Ebene:** Beim allerersten Besuch zeigt die App zuerst die Sprach-Auswahl. Alternative Vorauswahl?~~ **Erledigt:** Es gibt den **Sprach-Finder** (`renderSampleFinder`, `SAMPLE_ROUNDS`) — zwei Beispiel-Runden mit demselben Inhalt in drei Stufen; die Person wählt nach Gefühl, daraus wird eine Stufe empfohlen. Bewusst kein Test und keine Selbsteinschätzung (§4).
3. ~~**Quiz/Einstiegsfrage je Stufe:** Einstiegsfrage ist je Stufe möglich (Pilot Datenschutz). Voll ausrollen?~~ **Erledigt (August 2026):** alle 12 Themen haben `saVersions`. Quiz bleibt bewusst gemeinsam für alle Stufen.
4. ~~**DigComp/ICF in der Begleit-Ebene:** explizite DigComp-Codes je Thema ergänzen?~~ **Erledigt (August 2026):** alle 12 Themen haben `kompetenzen` mit DigComp-2.2- und ICF-Codes (§7). **Entschieden (09.09.2026):** Die Codes stehen **nur in der Begleit-Ebene** der App (§7) — weder im Beobachtungsbogen (Abschnitt H entfernt) noch im Erfolgs-Heft (hatte nie Codes).
5. ~~**Echter Offline-Zwang:** Falls ja, ARASAAC-Piktogramme lokal hosten (§11).~~ **Erledigt (August 2026):** eigene SVG-Icons liegen lokal im Precache, kein externer Bild-Aufruf mehr.
6. ~~**QR-Betrugs-Lektion auch im Kurz-Modus?**~~ **Erledigt:** „Vorsicht bei QR-Codes" liegt im Kurz-Modus. ~~**Neu offen dafür:** Der Kurz-Modus hält sein Versprechen nicht — er liefert 94 von 129 Lektionen (73 %).~~ **Ebenfalls erledigt (September 2026):** Der Kurz-Modus liefert heute **60 von 129 Lektionen (47 %)**, gleichmäßig **5 Schritte je Thema** — Start + 3 Kern-Lektionen + „Das merke ich mir". Die Themen-Seite beziffert die Menge sichtbar („Kurz — 5 Schritte", Prüfbericht B8), das Versprechen stimmt also wieder. Gesteuert wird das über **`topic.einfachLessons`** in `topics.js` (alle 12 Themen), nicht über `shortLessonIndexes`: Dieses Feld ist aus `topics.js` entfernt und in `getLessonsForMode()` (`app.js`) nur noch **Rückfallzweig** für ein künftiges Thema ohne eigene Kurzfassung. Der Zweig bleibt stehen; wer den Kurz-Modus ändert, ändert `einfachLessons`.
7. **Wegzeichen (Alex und Tilda an festen Orten):** Konzept liegt vor (`_vorschau-wegzeichen-konzept.html`). Erst Prüfgruppe, dann 7 Illustrations-Varianten, dann Einbau.
8. **Prüfgruppen-Katalog (offen):** Menü-Wörter („Mein Lernweg"), Lautsprecher-Symbol ohne Wort, Formel „eine Person, der du vertraust", Themen-Gruppen-Namen, Frage des Tages, KI-Einsamkeits-Satz, Frage-Muster-Sätze, QR-Karten, „Lernen starten"-Knopf, Leitsatz „So lernst du." mit den Stations-Wörtern „Merken" / „Prüfen" / „Handeln" (🧠 ✅ ➜, Station 0), „DEINE eine Sache für heute" (Station 5 — live heute als „Eine Sache für heute", app.js:4654/:4723), Stations-Etikett 🧠 Merken / ✅ Prüfen / ➜ Handeln im Themenfluss (Stationen 3–5), Liste „Prüfe dich selbst:" im Quiz-Ergebnis (Station 4), Knopf „Hilfe nochmal lesen" (Station 5, sensible Themen).

---

## 19. Startregel

Sobald eine Aufgabe gestellt wird: (1) aktuellen Stand einlesen, (2) kurz zusammenfassen, was du vorhast — mit Bezug zu den Prinzipien, (3) in kleinen Schritten umsetzen und zeigen, (4) lokal testen, (5) erst nach ausdrücklicher Freigabe veröffentlichen. Ruhig, klar, direkt. Keine langen Vorreden, keine Entschuldigungen. Rückfragen nur bei fachlich unklaren Inhalten.
