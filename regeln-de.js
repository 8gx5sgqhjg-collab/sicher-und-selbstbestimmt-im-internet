/* =============================================================
   DEINE KARTE – die 12 Regeln unter allen Themen
   -------------------------------------------------------------
   Stand 04.09.2026.

   WOZU
   Die Plattform hat 152 Merksätze in 12 Themen. Inhaltlich sind
   das immer wieder dieselben Regeln in anderen Worten: "Druck ist
   ein Warnzeichen" steht in 10 Themen, "Hilfe holen" in 10.
   Diese Datei macht die gemeinsame Ebene sichtbar – als etwas,
   das man sammelt.

   WIE MAN EINE REGEL SAMMELT
   - GEFUNDEN: Die Regel wird zum ersten Mal richtig angewendet.
     Nicht durch Lesen. Durch Tun (Übung, Quiz, Übungs-Handy).
   - SITZT:    Dieselbe Regel wird in einem ZWEITEN Thema
     wiedergefunden. Das ist der Transfer – der eigentliche Sinn.

   Am Ende druckt man EINE Karte mit den eigenen Regeln.
   Ohne Lernstand-Einwilligung lebt die Sammlung nur in dieser
   Sitzung (KDG, §14 CLAUDE.md). Deshalb ist das Drucken kein
   Extra, sondern der Kern: Gedrucktes bleibt.

   ZUORDNUNG
   Jeder Merksatz gehört über `muster` zu genau einer Regel. Die
   Reihenfolge im Array zählt: das erste passende Muster gewinnt.
   Geprüft am 04.09.2026: alle Sätze zugeordnet, und jede Regel ist
   in mindestens 2 Themen DURCH ÜBEN erreichbar (sonst könnte sie
   nie "sitzen" – ein Platz, der nie umklappt, wäre nur Frust).
   Deshalb gibt es keine eigene KI-Regel: "KI kann sich irren" war
   nur im Thema KI erreichbar. Die Botschaft steckt jetzt in
   "Nicht alles ist wahr. Auch KI irrt sich."
   Neue Merksätze greifen automatisch, wenn sie zu einem Muster
   passen. Prüfen mit: pruefeRegelZuordnung() in der Konsole.
   ============================================================= */

const REGELN = [
  { id: "codes",     pikto: "pikto-key",
    kurz: "Meine Codes sage ich niemandem.",
    was:  "Passwort, PIN, TAN und Codes bleiben bei mir. Auch am Telefon. Auch bei der Bank.",
    muster: /code|pin\b|passwort|tan\b|geheim|doppelt sicher|bank fragt nie|anmeldung/i },

  { id: "links",     pikto: "pikto-link",
    kurz: "Ich klicke nicht auf fremde Links.",
    was:  "Links in fremden Nachrichten tippe ich nicht an. QR-Bilder scanne ich nicht einfach.",
    muster: /link|klick|antipp|scann|qr/i },

  { id: "selbst",    pikto: "pikto-phone",
    kurz: "Ich gehe selbst hin.",
    was:  "Ich öffne die App selbst. Ich rufe die Nummer an, die ich schon habe. Nicht die aus der Nachricht.",
    muster: /selbst öffn|eigene nummer|nummer.*(schon|karte)|app selbst|alte nummer|selbst zurück|lege ich auf|neue nummer/i },

  { id: "geld",      pikto: "pikto-money",
    kurz: "Bei Geld werde ich langsam.",
    was:  "Für einen Gewinn zahle ich nie vorher. Sehr billig ist ein Warnzeichen. Abbrechen darf ich immer.",
    muster: /geld|zahl|gewinn|gebühr|bezahl|kauf|euro|vorkasse|rechnung|bestellt|kostenlos|impressum|zurückgeben|abo/i },

  { id: "druck",     pikto: "pikto-clock",
    kurz: "Druck heißt: Stopp.",
    was:  "Sofort, schnell, nur heute: Das soll mein Nachdenken verhindern. Dann mache ich langsam.",
    muster: /druck|eile|sofort|hetzen|zeit-druck|zeitdruck|langsam|nachdenk|denke.*nach|komisch/i },

  { id: "bilder",    pikto: "pikto-photo",
    kurz: "Ich denke nach, bevor ich sende.",
    was:  "Ein Bild ist schnell verschickt und schwer zurückzuholen. Das gilt auch für das, was ich schreibe.",
    muster: /foto|bild(er)?\b|stor(y|ies)|senden|posten|poste\b|respektvoll/i },

  { id: "wersieht",  pikto: "pikto-lock",
    kurz: "Ich bestimme, wer was von mir sieht.",
    was:  "Meine Daten, mein Profil, meine Beiträge – und auch, wo ich gerade bin.",
    muster: /privat|wer sieht|wer.*sehen|öffentlich|profil|einstellung|gruppe|daten (gebe|weiter)|adresse|telefon-nummer|zeige nicht alles|standort/i },

  { id: "echt",      pikto: "pikto-stranger",
    kurz: "Ich prüfe, wer da schreibt.",
    was:  "Ist das wirklich die Person? Kenne ich sie? Bei einer neuen Nummer frage ich anders nach.",
    muster: /wirklich|echte? person|person.*echt|kenne ich|fremde|unbekannt|anfrage|kontakt|wer mir schreibt|antworte/i },

  { id: "wahr",      pikto: "pikto-search",
    kurz: "Nicht alles ist wahr. Auch KI irrt sich.",
    was:  "Bilder, Videos und Stimmen können gemacht sein. Ein Chatbot klingt sicher und liegt trotzdem falsch. Bei Aufregung prüfe ich erst.",
    muster: /wahr|gefälscht|fake|stimmt|quelle|prüfe|nicht alles|aufregung|aufregend|glauben|video|stimme|anzeige|werbung|\bki\b|chatbot|künstlich/i },

  { id: "mitmachen", pikto: "pikto-no",
    kurz: "Ich muss nicht mitmachen.",
    was:  "Gefährliche Trends mache ich nicht nach. Ich muss nicht auf alles antworten. Ich vergleiche mich nicht.",
    muster: /nachmach|nicht nach|trend|gefährlich|mutprobe|reagieren|vergleich/i },

  { id: "aufhoeren", pikto: "pikto-pause",
    kurz: "Ich darf aufhören. Immer.",
    was:  "Pause machen, weglegen, abbrechen. Auch mitten im Kauf. Auch mitten im Gespräch.",
    muster: /pause|aufhör|weglegen|stopp|abbrech|zeit für|genug|darf.*stopp/i },

  { id: "hilfe",     pikto: "pikto-help",
    kurz: "Ich hole Hilfe. Das ist stark.",
    was:  "Ich zeige die Nachricht einer Person, der ich vertraue. Vorher lösche ich nichts. Ich bin nicht allein.",
    muster: /hilfe|hilft|unterstützung|vertrau|jemand|melde|blockier|allein|erzähl|zeige die nachricht|gefühle|sprechen|plan|helfen/i }
];

/* Welche Regel gehört zu diesem Merksatz? Erstes passendes Muster gewinnt.
   Kein Treffer -> null, dann passiert einfach nichts (nie ein Fehler). */
function regelZuSatz(satz) {
  if (!satz || typeof satz !== "string") return null;
  for (let i = 0; i < REGELN.length; i++) {
    if (REGELN[i].muster.test(satz)) return REGELN[i].id;
  }
  return null;
}

/* Quizfragen haben kein remember-Feld (122 Fragen, keine einzige).
   Deshalb wird hier STRENG zugeordnet: nur wenn die Frage UND die
   Erklaerung der richtigen Antwort zur selben Regel fuehren.

   Warum so streng? Gemessen am 06.09.2026:
     nur ueber die Frage      111 Treffer, ~1 von 4 falsch
                              ("Am Automaten klebt ein QR-Code" -> Codes
                               statt Links, weil das Wort Code gewinnt)
     nur ueber die Erklaerung  90 Treffer, immer noch ~1 von 4 falsch
                              ("Die anderen duerfen mitbestimmen" -> Nicht
                               alles ist wahr, weil in mitbestimmen das
                               Wort stimmt steckt)
     beide muessen einig sein  46 Treffer, in der Stichprobe sauber
   Lieber 46 verlaessliche als 90, von denen jede vierte die falsche
   Regel gutschreibt. Die uebrigen Fragen zahlen einfach nicht ein. */
function regelAusQuizfrage(q) {
  if (!q) return null;
  if (q.remember) return regelZuSatz(q.remember);
  const ausFrage = regelZuSatz(q.question);
  const ausErklaerung = regelZuSatz(q.feedbackCorrect);
  if (ausFrage && ausErklaerung && ausFrage === ausErklaerung) return ausFrage;
  return null;
}

function regelById(id) {
  return REGELN.filter(function (r) { return r.id === id; })[0] || null;
}

/* Selbstprüfung für die Entwicklung: in der Browser-Konsole aufrufen.
   Meldet Merksätze ohne Regel und Regeln, die in weniger als zwei
   Themen vorkommen (die könnten nie "sitzen"). */
function pruefeRegelZuordnung() {
  const saetze = {};
  const add = function (s, thema) {
    if (!s || !String(s).trim()) return;
    const k = String(s).trim();
    saetze[k] = saetze[k] || {};
    saetze[k][thema] = true;
  };
  if (typeof topics !== "undefined") {
    topics.forEach(function (x) {
      (x.memoryRules || []).forEach(function (s) { add(s, x.id); });
      (x.lessons || []).forEach(function (l) {
        add(l.remember, x.id);
        if (l.practice) add(l.practice.remember, x.id);
      });
    });
  }
  if (typeof SCENARIOS !== "undefined") {
    Object.keys(SCENARIOS).forEach(function (id) {
      (SCENARIOS[id].szenen || []).forEach(function (z) {
        if (z.frage) add(z.frage.remember, id);
      });
    });
  }
  const proRegel = {};
  REGELN.forEach(function (r) { proRegel[r.id] = { saetze: 0, themen: {} }; });
  const ohne = [];
  Object.keys(saetze).forEach(function (s) {
    const id = regelZuSatz(s);
    if (!id) { ohne.push(s); return; }
    proRegel[id].saetze++;
    Object.keys(saetze[s]).forEach(function (t) { proRegel[id].themen[t] = true; });
  });
  const schwach = REGELN.filter(function (r) { return Object.keys(proRegel[r.id].themen).length < 2; });
  return {
    saetzeGesamt: Object.keys(saetze).length,
    ohneRegel: ohne,
    schwach: schwach.map(function (r) { return r.id; }),
    proRegel: REGELN.map(function (r) {
      return r.id + ": " + proRegel[r.id].saetze + " Sätze, " + Object.keys(proRegel[r.id].themen).length + " Themen";
    })
  };
}
