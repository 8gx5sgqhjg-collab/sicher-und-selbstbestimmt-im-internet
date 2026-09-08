# Prüf-Notiz: Merksatz-Kasten (Pilot) — für die Prüfgruppen-Sitzung

**Stand:** 08.09.2026 · **Status:** Bereit zur Prüfung, wartet auf Freigabe aus der Sitzung
**Betrifft:** `app.js`, Commits `8e83e32` (Baustein) + `b183533` (Umstellung)
**Diese Notiz enthält keinen Code** — reine Vorbereitung nach `CLAUDE.md` §13
(Prüfgruppe für Verständlichkeit) und Gamification-Doku §6 („Nicht bauen. Zuerst hinsehen.").

---

## Was sich technisch geändert hat (für die Person, die die Sitzung begleitet)

Der Merksatz-Kasten („Wichtig: …") auf dem Lernschritt sieht **optisch unverändert**
aus. Technisch kommt er jetzt aus einem gemeinsamen Baustein (`buildRememberBox()`)
statt aus eigenem, an sieben Stellen im Code kopiertem Markup — das ist eine
Aufräum-Maßnahme, **keine** inhaltliche oder gestalterische Änderung.

Vorher/Nachher automatisiert verglichen (Playwright, echter Browser): Titel, Text,
Vorlese-Verhalten und Mitmarkierung sind zwischen altem und neuem Code
byte-identisch. Das ersetzt keine echte Prüfung mit Menschen — es zeigt nur, dass
der Umbau selbst nichts kaputtgemacht hat.

## Der Pilot-Screen

- **Wo:** Lernschritt (Lesson-Ansicht) eines Themas mit einem „Wichtig"-Kasten.
- **Test-Thema laut Vereinbarung:** WhatsApp, Lektion „WhatsApp nutzen"
  (Merksatz: „Ich entscheide, wem ich antworte."). Erreichbar über
  Themen → WhatsApp → „Lernen starten" → Einstiegsfrage beantworten → einmal „Weiter".
- **Zu sehen:** eine Karte mit Überschrift und Text, darunter der hervorgehobene
  Kasten „Wichtig" mit dem Merksatz und einem kleinen Lautsprecher-Knopf daneben.

## Was in der Sitzung geprüft werden soll

Für den allgemeinen Rahmen der Sitzung gilt weiterhin `beobachtungsbogen.html` —
Abschnitt D „Vorlesen und Bedienung" deckt die Vorlese-Funktion und Knopfgrößen
grundsätzlich ab. **Zusätzlich, speziell für diesen einen Kasten**, bitte gezielt
beobachten (steht so noch nicht im Bogen):

| Prüfpunkt | Frage |
|---|---|
| Vorlesen + Mitmarkierung | Wird beim Antippen des Lautsprecher-Knopfs am „Wichtig"-Kasten der Text vorgelesen **und** der Kasten dabei sichtbar hervorgehoben, bis das Vorlesen endet? |
| Dark Mode | Ist der „Wichtig"-Kasten im dunklen Modus (Geräte-Einstellung) genauso gut lesbar wie hell — Text, Rahmen, Hintergrund ausreichend Kontrast? |
| Tastatur | Lässt sich der Lautsprecher-Knopf am Kasten allein mit Tab (Fokus sichtbar) und Enter/Leertaste bedienen, ohne Maus oder Touch? |
| Verständlichkeit der Kachel | Versteht die Person, dass „Wichtig" den wichtigsten Satz der Seite markiert — unabhängig vom übrigen Text? Erinnert sie den Merksatz noch, nachdem sie weitergeblättert hat? |

Notizen bitte im freien Feld des Beobachtungsbogens oder auf diesem Blatt
festhalten — kein Name der lernenden Person, keine Fotos (§13/§14).

## Was nicht geprüft werden muss

Der restliche Lernschritt (Text, Bullet-Punkte, Beispiele, Warnung, Erfolg) ist
in diesem Umbau **nicht** angefasst — dort läuft weiterhin die alte, eigenständige
Vorlese-Logik (siehe Commit `b183533`). Diese Notiz betrifft ausschließlich den
„Wichtig"-Kasten.

## Danach

Das Ergebnis der Sitzung entscheidet, ob Stufe 4 beginnt: die restlichen fünf
Stellen mit demselben Kasten-Muster (`renderPracticeFeedbackPage`,
`renderCompletionPage` ×2, `renderTrainingMessage` ×2, `renderTrainingResult`)
ebenfalls auf `buildRememberBox()` umzustellen — siehe
`docs/lerndesign-vorschlag.md`, Abschnitt 3. **Ohne Freigabe aus der Sitzung wird
nicht weitergebaut.**

Getrennt davon, nicht Teil dieser Prüfung: die Produktfrage, ob der Kurz-Modus
47 % oder ursprünglich 73 % der Lektionen zeigen sollte (`CLAUDE.md` §18.6) —
das ist eine Design-Entscheidung, keine Verständlichkeits-Frage für diesen
Kasten.
