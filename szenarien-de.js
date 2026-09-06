/* =============================================================
   Übungs-Handy – Szenarien zu den 12 Themen
   -------------------------------------------------------------
   Ein Szenario pro Thema. Es zeigt einen nachgebauten Handy-
   Bildschirm und stellt darin echte Entscheidungen (§3 UDL:
   Handlung; §4 ressourcenorientiert; Testing-Effekt).

   Alles hier ist erfunden. Keine echten Marken, keine echten
   Nummern, keine echten Adressen. Erfundene Endungen (.xyz)
   machen sichtbar, dass es Übung ist.

   AUFBAU
   scenarios[themaId] = {
     titel      Überschrift auf der Startseite des Szenarios
     typ        chat | posteingang | einstellungen | anruf | shop | video
                chat  -> Bildschirm sammelt sich an (Verlauf)
                sonst -> jede Szene ersetzt den Bildschirm
     kanal      Zeile in der Handy-Statusleiste
     einstieg   ein bis drei Sätze, was gleich passiert
     szenen     [ { inhalt: [...], frage: {...} } ]
     abschluss  Satz am Ende
   }

   INHALTS-BAUSTEINE (alle optional kombinierbar)
     { typ:"nachricht", von, text, zeit }
     { typ:"eigene",    text }
     { typ:"liste",     eintraege:[{von, vorschau, zeit}] }
     { typ:"schalter",  label, wert, hinweis }
     { typ:"anruf",     von, nummer }
     { typ:"shop",      titel, preis, zeilen:[...] }
     { typ:"video",     titel, kanal, dauer, hinweis }
     { typ:"hinweis",   text }

   FRAGE = genau das Format von lesson.practice:
     question, pictogram, answers, correctIndex,
     feedbackWrong, feedbackCorrect, remember
   Dadurch gelten Vorlesen, Piktogramme und Rückmeldung
   unverändert weiter.
   ============================================================= */

const SCENARIOS = {

  /* ---------------------------------------------------------
     DATENSCHUTZ – Einstellungen und ein Formular
     --------------------------------------------------------- */
  datenschutz: {
    titel: "Dein Konto einstellen",
    typ: "einstellungen",
    kanal: "Einstellungen",
    einstieg: [
      "Du hast ein neues Konto.",
      "Jetzt stellst du es ein.",
      "Du entscheidest, wer was sehen darf."
    ],
    szenen: [
      {
        inhalt: [
          { typ: "hinweis", text: "Wer darf dein Geburts-Datum sehen?" },
          { typ: "schalter", label: "Mein Geburts-Datum", wert: "Alle im Internet" }
        ],
        frage: {
          question: "Wer soll dein Geburts-Datum sehen?",
          pictogram: "pikto-birthday",
          answers: ["Alle im Internet", "Nur ich"],
          correctIndex: 1,
          feedbackWrong: "Dein Geburts-Datum ist eine private Angabe. Fremde brauchen sie nicht. Betrüger können damit arbeiten.",
          feedbackCorrect: "Gut. Dein Geburts-Datum geht nur dich etwas an.",
          remember: "Mein Geburts-Datum bleibt privat."
        }
      },
      {
        inhalt: [
          { typ: "hinweis", text: "Jetzt brauchst du ein Passwort." },
          { typ: "schalter", label: "Passwort", wert: "Noch leer", hinweis: "Mindestens 12 Zeichen" }
        ],
        frage: {
          question: "Welches Passwort ist besser?",
          pictogram: "pikto-key",
          answers: ["BlauerStuhlAmFenster7", "12345678"],
          correctIndex: 0,
          feedbackWrong: "Dieses Passwort ist zu einfach. Ein Programm findet es in einer Sekunde.",
          feedbackCorrect: "Gut. Das ist lang. Und es ist leicht zu merken.",
          remember: "Ich nehme ein langes Passwort."
        }
      },
      {
        inhalt: [
          { typ: "hinweis", text: "Eine Seite fragt nach mehr." },
          { typ: "nachricht", von: "gewinnspiel-sommer.xyz", text: "Mach mit beim Gewinnspiel! Wir brauchen nur: deinen Namen, deine Adresse und deine Bank-Daten.", zeit: "jetzt" }
        ],
        frage: {
          question: "Was machst du?",
          pictogram: "pikto-no",
          answers: ["Ich gebe die Bank-Daten ein.", "Ich mache nicht mit."],
          correctIndex: 1,
          feedbackWrong: "Ein Gewinnspiel braucht nie deine Bank-Daten. Hier holt sich jemand deine Daten.",
          feedbackCorrect: "Richtig. Für ein Gewinnspiel braucht niemand deine Bank-Daten.",
          remember: "Bank-Daten gebe ich nicht für ein Gewinnspiel."
        }
      }
    ],
    abschluss: "Du hast dein Konto sicher eingestellt. So geht das auch bei deinem echten Handy."
  },

  /* ---------------------------------------------------------
     WHATSAPP – Chat-Verlauf: Hallo Mama und der Code
     --------------------------------------------------------- */
  whatsapp: {
    titel: "Eine neue Nummer schreibt dir",
    typ: "chat",
    kanal: "Nachrichten",
    einstieg: [
      "Du bekommst eine Nachricht.",
      "Die Nummer kennst du nicht.",
      "Schau, wie es weitergeht."
    ],
    szenen: [
      {
        inhalt: [
          { typ: "nachricht", von: "Unbekannte Nummer", text: "Hallo Mama. Mein Handy ist kaputt. Das ist meine neue Nummer.", zeit: "14:02" }
        ],
        frage: {
          question: "Was machst du zuerst?",
          pictogram: "pikto-stranger",
          answers: ["Ich rufe die alte Nummer an.", "Ich speichere die neue Nummer."],
          correctIndex: 0,
          feedbackWrong: "Noch weißt du nicht, wer das ist. Die alte Nummer sagt dir die Wahrheit.",
          feedbackCorrect: "Sehr gut. Ein Anruf bei der alten Nummer klärt alles.",
          remember: "Ich rufe die alte Nummer an."
        }
      },
      {
        inhalt: [
          { typ: "eigene", text: "Ich rufe dich gleich an." },
          { typ: "nachricht", von: "Unbekannte Nummer", text: "Nicht anrufen! Das geht gerade nicht. Kannst du mir schnell 300 Euro schicken?", zeit: "14:05" }
        ],
        frage: {
          question: "Woran erkennst du hier den Trick?",
          pictogram: "pikto-warning",
          answers: ["An der Uhrzeit.", "An dem Druck und an dem Geld."],
          correctIndex: 1,
          feedbackWrong: "Die Uhrzeit sagt nichts. Der Trick steckt im Druck: schnell, nicht anrufen, Geld.",
          feedbackCorrect: "Genau. Druck und eine Geld-Bitte sind das Warnzeichen.",
          remember: "Druck und Geld sind ein Warnzeichen."
        }
      },
      {
        inhalt: [
          { typ: "nachricht", von: "Unbekannte Nummer", text: "Ich schicke dir gleich einen Code. Bitte schick ihn mir sofort zurück.", zeit: "14:07" }
        ],
        frage: {
          question: "Schickst du den Code zurück?",
          pictogram: "pikto-code",
          answers: ["Nein. Codes gebe ich nie weiter.", "Ja, das ist ja nur eine Zahl."],
          correctIndex: 0,
          feedbackWrong: "Mit diesem Code kann jemand dein WhatsApp übernehmen. Der Code ist wie ein Schlüssel.",
          feedbackCorrect: "Richtig. Ein Code ist wie ein Schlüssel zu deiner Wohnung.",
          remember: "Ich gebe keinen Code weiter."
        }
      },
      {
        inhalt: [
          { typ: "eigene", text: "Nein." },
          { typ: "hinweis", text: "Du kannst die Nummer blockieren und melden." }
        ],
        frage: {
          question: "Du hast vorhin schon geantwortet. Ist jetzt alles verloren?",
          pictogram: "pikto-feel",
          answers: ["Ja, jetzt ist es zu spät.", "Nein. Ich kann jederzeit aufhören."],
          correctIndex: 1,
          feedbackWrong: "Das stimmt nicht. Solange du kein Geld und keinen Code geschickt hast, ist nichts passiert. Aufhören geht immer.",
          feedbackCorrect: "Genau so ist es. Du darfst mitten im Gespräch aussteigen.",
          remember: "Ich darf jederzeit aufhören."
        }
      }
    ],
    abschluss: "Du hast den Hallo-Mama-Trick erkannt. Und du weißt: aussteigen geht immer."
  },

  /* ---------------------------------------------------------
     FACEBOOK – Einstellungen und eine Anfrage
     --------------------------------------------------------- */
  facebook: {
    titel: "Wer sieht deinen Beitrag?",
    typ: "einstellungen",
    kanal: "Dein Profil",
    einstieg: [
      "Du willst ein Foto zeigen.",
      "Vorher stellst du ein: Wer darf es sehen?"
    ],
    szenen: [
      {
        inhalt: [
          { typ: "hinweis", text: "Du hast ein Foto von deinem Zimmer gemacht." },
          { typ: "schalter", label: "Wer sieht diesen Beitrag?", wert: "Öffentlich" }
        ],
        frage: {
          question: "Was stellst du ein?",
          pictogram: "pikto-people",
          answers: ["Nur Freunde.", "Öffentlich. Alle dürfen es sehen."],
          correctIndex: 0,
          feedbackWrong: "Öffentlich heißt: wirklich alle. Auch Menschen, die du nie treffen willst.",
          feedbackCorrect: "Gut gewählt. Deine Freunde reichen.",
          remember: "Ich poste nicht alles öffentlich."
        }
      },
      {
        inhalt: [
          { typ: "nachricht", von: "Freundschafts-Anfrage", text: "Lena Sommer möchte deine Freundin sein. Ihr habt 0 gemeinsame Freunde. Das Profil ist 2 Tage alt.", zeit: "heute" }
        ],
        frage: {
          question: "Nimmst du die Anfrage an?",
          pictogram: "pikto-stranger",
          answers: ["Ja, mehr Freunde sind schön.", "Nein. Ich kenne die Person nicht."],
          correctIndex: 1,
          feedbackWrong: "Ein neues Profil ohne gemeinsame Freunde ist oft falsch. Solche Profile wollen an deine Daten.",
          feedbackCorrect: "Richtig. Neues Profil, keine gemeinsamen Freunde: das prüfe ich lieber.",
          remember: "Ich prüfe Freundschafts-Anfragen."
        }
      },
      {
        inhalt: [
          { typ: "nachricht", von: "Kommentar unter deinem Foto", text: "Was für ein hässliches Zimmer. Du hast echt keinen Geschmack.", zeit: "vor 5 Minuten" }
        ],
        frage: {
          question: "Was tust du?",
          pictogram: "pikto-help",
          answers: ["Ich melde den Kommentar und hole Unterstützung.", "Ich schreibe eine Beleidigung zurück."],
          correctIndex: 0,
          feedbackWrong: "Zurück beleidigen macht es schlimmer. Und es kann Ärger für dich geben.",
          feedbackCorrect: "Gut. Melden hilft. Und du musst das nicht allein aushalten.",
          remember: "Bei Beleidigungen hole ich Unterstützung."
        }
      }
    ],
    abschluss: "Du hast dein Profil sicher eingestellt und weißt, was du bei fiesen Kommentaren tust."
  },

  /* ---------------------------------------------------------
     INSTAGRAM – Konto privat und Standort im Foto
     --------------------------------------------------------- */
  instagram: {
    titel: "Dein Konto und dein Standort",
    typ: "einstellungen",
    kanal: "Dein Konto",
    einstieg: [
      "Du willst ein Foto hochladen.",
      "Vorher schaust du in die Einstellungen."
    ],
    szenen: [
      {
        inhalt: [
          { typ: "schalter", label: "Privates Konto", wert: "Aus", hinweis: "Aus heißt: Alle sehen deine Fotos." }
        ],
        frage: {
          question: "Was machst du mit diesem Schalter?",
          pictogram: "pikto-lock",
          answers: ["Ich lasse ihn aus.", "Ich schalte ihn an."],
          correctIndex: 1,
          feedbackWrong: "Mit einem offenen Konto sehen fremde Menschen alle deine Fotos.",
          feedbackCorrect: "Gut. Jetzt sehen nur Menschen deine Fotos, die du erlaubst.",
          remember: "Mein Konto ist privat."
        }
      },
      {
        inhalt: [
          { typ: "hinweis", text: "Dein Foto zeigt dich vor deiner Haustür. Das Straßen-Schild ist gut zu lesen." },
          { typ: "schalter", label: "Standort zum Foto", wert: "An" }
        ],
        frage: {
          question: "Was ist hier das Problem?",
          pictogram: "pikto-location",
          answers: ["Fremde sehen, wo du wohnst.", "Das Foto ist zu dunkel."],
          correctIndex: 0,
          feedbackWrong: "Es geht nicht um die Helligkeit. Das Schild und der Standort zeigen deine Adresse.",
          feedbackCorrect: "Genau. Schild und Standort verraten zusammen deine Adresse.",
          remember: "Ich schütze meinen Standort."
        }
      },
      {
        inhalt: [
          { typ: "nachricht", von: "modell_agentur_star", text: "Hallo Schönheit! Du könntest Modell werden. Schick mir ein Foto ohne Kleidung. Nur für die Bewerbung.", zeit: "22:40" }
        ],
        frage: {
          question: "Was machst du?",
          pictogram: "pikto-no",
          answers: ["Ich schicke das Foto.", "Ich schicke nichts und erzähle es jemandem."],
          correctIndex: 1,
          feedbackWrong: "Keine echte Agentur fragt so etwas. Das Foto wäre für immer aus deiner Hand.",
          feedbackCorrect: "Genau richtig. Und darüber reden ist stark, nicht peinlich.",
          remember: "Ich schicke fremden Personen keine privaten Fotos."
        }
      }
    ],
    abschluss: "Dein Konto ist privat. Dein Standort ist geschützt. Und du weißt, wann du Nein sagst."
  },

  /* ---------------------------------------------------------
     YOUTUBE – Werbung, Trend und Pause
     --------------------------------------------------------- */
  youtube: {
    titel: "Was du im Video siehst",
    typ: "video",
    kanal: "Videos",
    einstieg: [
      "Du schaust Videos.",
      "Nicht alles darin ist ehrlich."
    ],
    szenen: [
      {
        inhalt: [
          { typ: "video", titel: "Diese Creme macht dich in 3 Tagen jünger!", kanal: "BeautyTipps24", dauer: "8:12", hinweis: "Unten steht ganz klein: Anzeige" }
        ],
        frage: {
          question: "Was ist dieses Video?",
          pictogram: "pikto-search",
          answers: ["Werbung.", "Ein ehrlicher Tipp."],
          correctIndex: 0,
          feedbackWrong: "Schau auf das kleine Wort Anzeige. Dann wird das Video für Geld gemacht.",
          feedbackCorrect: "Richtig. Anzeige heißt: Da wird etwas verkauft.",
          remember: "Ich achte auf das Wort Anzeige."
        }
      },
      {
        inhalt: [
          { typ: "video", titel: "Krasse Mutprobe! Mach das nach!", kanal: "XtremeBoys", dauer: "2:44", hinweis: "1,2 Millionen Aufrufe" }
        ],
        frage: {
          question: "Viele Menschen haben das gesehen. Ist es deshalb sicher?",
          pictogram: "pikto-warning",
          answers: ["Ja, so viele können sich nicht irren.", "Nein. Viele Aufrufe sagen nichts über Sicherheit."],
          correctIndex: 1,
          feedbackWrong: "Viele Aufrufe heißt nur: viele haben geschaut. Gefährlich bleibt gefährlich.",
          feedbackCorrect: "Genau. Bekannt ist nicht dasselbe wie sicher.",
          remember: "Ich mache gefährliche Dinge nicht nach."
        }
      },
      {
        inhalt: [
          { typ: "hinweis", text: "Du schaust jetzt seit 90 Minuten. Das nächste Video startet von allein." }
        ],
        frage: {
          question: "Was tust du?",
          pictogram: "pikto-pause",
          answers: ["Ich mache eine Pause.", "Ich schaue weiter."],
          correctIndex: 0,
          feedbackWrong: "Das nächste Video startet immer. Die Pause musst du selbst machen.",
          feedbackCorrect: "Gut. Du entscheidest, wann Schluss ist. Nicht die App.",
          remember: "Ich darf Videos stoppen."
        }
      }
    ],
    abschluss: "Du erkennst Werbung, du machst nichts Gefährliches nach, und du machst Pausen."
  },

  /* ---------------------------------------------------------
     SNAPCHAT – Druck und Standort-Karte
     --------------------------------------------------------- */
  snapchat: {
    titel: "Ein Bild und eine Karte",
    typ: "chat",
    kanal: "Snaps",
    einstieg: [
      "Jemand schreibt dir.",
      "Es geht um ein Bild von dir."
    ],
    szenen: [
      {
        inhalt: [
          { typ: "nachricht", von: "tim_2007", text: "Schick mir ein Bild von dir. Es verschwindet ja gleich wieder.", zeit: "20:15" }
        ],
        frage: {
          question: "Stimmt das? Verschwindet das Bild wirklich?",
          pictogram: "pikto-photo",
          answers: ["Ja, danach ist es weg.", "Nein. Man kann es abfotografieren."],
          correctIndex: 1,
          feedbackWrong: "Ein Bildschirm-Foto geht immer. Dann ist dein Bild gespeichert.",
          feedbackCorrect: "Richtig. Ein Bildschirm-Foto ist schnell gemacht.",
          remember: "Bilder können gespeichert werden."
        }
      },
      {
        inhalt: [
          { typ: "eigene", text: "Lieber nicht." },
          { typ: "nachricht", von: "tim_2007", text: "Komm schon. Alle machen das. Wenn du mich mögen würdest, würdest du das machen.", zeit: "20:18" }
        ],
        frage: {
          question: "Das ist Druck. Was machst du?",
          pictogram: "pikto-no",
          answers: ["Ich bleibe bei Nein.", "Ich gebe nach, damit Ruhe ist."],
          correctIndex: 0,
          feedbackWrong: "Wer dich mag, macht keinen Druck. Nachgeben hört meistens nicht auf.",
          feedbackCorrect: "Stark. Dein Nein gilt. Auch beim zweiten Mal.",
          remember: "Ich sage Nein bei Druck."
        }
      },
      {
        inhalt: [
          { typ: "hinweis", text: "Auf der Karte in der App sieht man einen kleinen Punkt. Das bist du. Zu Hause." },
          { typ: "schalter", label: "Mein Standort auf der Karte", wert: "Alle Freunde sehen mich" }
        ],
        frage: {
          question: "Was stellst du ein?",
          pictogram: "pikto-location",
          answers: ["Alle Freunde dürfen mich sehen.", "Niemand sieht meinen Standort."],
          correctIndex: 1,
          feedbackWrong: "In der Freundes-Liste stehen oft auch Menschen, die du kaum kennst.",
          feedbackCorrect: "Gut. Deinen Standort brauchst nur du.",
          remember: "Ich schütze meinen Standort."
        }
      }
    ],
    abschluss: "Du hast Nein gesagt und deinen Standort geschützt. Beides war richtig."
  },

  /* ---------------------------------------------------------
     TIKTOK – Trend, Nachricht und Zeit
     --------------------------------------------------------- */
  tiktok: {
    titel: "Trends und Zeit",
    typ: "video",
    kanal: "Für dich",
    einstieg: [
      "Die App zeigt dir Videos.",
      "Sie entscheidet, was du siehst."
    ],
    szenen: [
      {
        inhalt: [
          { typ: "video", titel: "Salz-Challenge – trau dich!", kanal: "trendkiste", dauer: "0:22", hinweis: "In den Kommentaren: Mach mit!" }
        ],
        frage: {
          question: "Machst du mit?",
          pictogram: "pikto-warning",
          answers: ["Nein. Das kann wehtun.", "Ja, das machen doch alle."],
          correctIndex: 0,
          feedbackWrong: "Manche Trends schaden dem Körper. Der Trend ist morgen vorbei. Ein Schaden bleibt.",
          feedbackCorrect: "Genau. Du musst nicht mitmachen.",
          remember: "Ich mache gefährliche Trends nicht nach."
        }
      },
      {
        inhalt: [
          { typ: "nachricht", von: "sunny_edits", text: "Hey! Du bist süß. Wie alt bist du? Und wo wohnst du?", zeit: "17:33" }
        ],
        frage: {
          question: "Was antwortest du?",
          pictogram: "pikto-stranger",
          answers: ["Ich sage mein Alter und meinen Ort.", "Ich antworte nicht."],
          correctIndex: 1,
          feedbackWrong: "Alter und Wohnort sind private Daten. Fremde brauchen sie nicht.",
          feedbackCorrect: "Richtig. Private Daten bleiben bei dir.",
          remember: "Ich schütze private Daten."
        }
      },
      {
        inhalt: [
          { typ: "hinweis", text: "Du wolltest 10 Minuten schauen. Jetzt sind es 70 Minuten." }
        ],
        frage: {
          question: "Warum ist so viel Zeit vergangen?",
          pictogram: "pikto-clock",
          answers: ["Weil die App immer weiter zeigt.", "Weil ich keine Geduld habe."],
          correctIndex: 0,
          feedbackWrong: "Das liegt nicht an dir. Die App ist gebaut, damit du weiter schaust.",
          feedbackCorrect: "Genau. Die App hört nie von allein auf. Du darfst aufhören.",
          remember: "Ich mache Pausen."
        }
      }
    ],
    abschluss: "Du entscheidest, was du nachmachst, was du erzählst und wann du aufhörst."
  },

  /* ---------------------------------------------------------
     HILFE BEI PROBLEMEN – Stopp, zeigen, Unterstützung
     --------------------------------------------------------- */
  hilfe: {
    titel: "Etwas ist passiert",
    typ: "chat",
    kanal: "Nachrichten",
    einstieg: [
      "Eine gemeine Nachricht kommt an.",
      "Hier übst du, was du dann tust."
    ],
    szenen: [
      {
        inhalt: [
          { typ: "nachricht", von: "Unbekannt", text: "Ich weiß, wo du wohnst. Wenn du das jemandem erzählst, passiert etwas.", zeit: "21:52" }
        ],
        frage: {
          question: "Was ist der erste Schritt?",
          pictogram: "pikto-no",
          answers: ["Sofort zurückschreiben.", "Stopp machen. Nicht antworten."],
          correctIndex: 1,
          feedbackWrong: "Antworten macht oft weiter. Erst einmal nichts tun ist stark.",
          feedbackCorrect: "Richtig. Erst Stopp. Dann in Ruhe überlegen.",
          remember: "Ich mache Stopp."
        }
      },
      {
        inhalt: [
          { typ: "hinweis", text: "Dein Finger liegt auf dem Papierkorb." }
        ],
        frage: {
          question: "Löschst du die Nachricht?",
          pictogram: "pikto-screen",
          answers: ["Nein. Ich mache erst ein Bildschirm-Foto.", "Ja, dann ist sie weg."],
          correctIndex: 0,
          feedbackWrong: "Gelöscht ist weg. Dann kann niemand mehr sehen, was passiert ist.",
          feedbackCorrect: "Sehr gut. Das Bild ist dein Beweis.",
          remember: "Ich lösche nicht sofort."
        }
      },
      {
        inhalt: [
          { typ: "nachricht", von: "Unbekannt", text: "Und nicht petzen!", zeit: "21:54" }
        ],
        frage: {
          question: "Die Nachricht sagt: nicht erzählen. Was machst du?",
          pictogram: "pikto-help",
          answers: ["Ich behalte es für mich.", "Ich zeige es einer vertrauten Person."],
          correctIndex: 1,
          feedbackWrong: "Genau das wollen solche Nachrichten. Allein bleibst du mit der Angst.",
          feedbackCorrect: "Genau richtig. Wer so schreibt, hat Angst vor Erwachsenen.",
          remember: "Ich zeige die Nachricht."
        }
      }
    ],
    abschluss: "Stopp. Nicht löschen. Zeigen. Diese drei Schritte helfen bei fast jedem Problem."
  },

  /* ---------------------------------------------------------
     KI UND CHATBOTS – falsche Antwort und private Daten
     --------------------------------------------------------- */
  ki: {
    titel: "Du fragst einen Chatbot",
    typ: "chat",
    kanal: "Chatbot",
    einstieg: [
      "Ein Chatbot ist ein Programm.",
      "Er antwortet immer freundlich.",
      "Aber er kann sich irren."
    ],
    szenen: [
      {
        inhalt: [
          { typ: "eigene", text: "Wie viele Einwohner hat meine Stadt?" },
          { typ: "nachricht", von: "Chatbot", text: "Deine Stadt hat 84.000 Einwohner. Stand 2019.", zeit: "10:04" }
        ],
        frage: {
          question: "Die Zahl ist alt. Was machst du?",
          pictogram: "pikto-search",
          answers: ["Ich prüfe sie woanders nach.", "Ich glaube der Zahl."],
          correctIndex: 0,
          feedbackWrong: "Eine KI klingt sicher, auch wenn sie sich irrt. Alte Zahlen sind ein Hinweis.",
          feedbackCorrect: "Gut. Wichtige Angaben prüfst du nach.",
          remember: "Ich prüfe wichtige Antworten."
        }
      },
      {
        inhalt: [
          { typ: "nachricht", von: "Chatbot", text: "Ich helfe dir gern weiter. Sag mir deinen vollen Namen, deine Adresse und deine Bank-Verbindung.", zeit: "10:06" }
        ],
        frage: {
          question: "Gibst du die Daten ein?",
          pictogram: "pikto-data",
          answers: ["Ja, es ist ja nur ein Programm.", "Nein. Das geht das Programm nichts an."],
          correctIndex: 1,
          feedbackWrong: "Alles, was du einer KI schreibst, wird gespeichert. Du weißt nicht, wer es später liest.",
          feedbackCorrect: "Richtig. Was du dort eingibst, bekommst du nicht zurück.",
          remember: "Ich gebe der KI keine privaten Daten."
        }
      },
      {
        inhalt: [
          { typ: "eigene", text: "Bist du ein Mensch?" },
          { typ: "nachricht", von: "Chatbot", text: "Ich bin für dich da. Ich verstehe dich besser als alle anderen.", zeit: "10:09" }
        ],
        frage: {
          question: "Ist der Chatbot dein Freund?",
          pictogram: "pikto-ki",
          answers: ["Nein. Er ist ein Programm.", "Ja, er versteht mich."],
          correctIndex: 0,
          feedbackWrong: "Der Chatbot fühlt nichts. Er setzt Wörter zusammen, die freundlich klingen.",
          feedbackCorrect: "Genau. Freundlich klingen und fühlen sind zwei Dinge.",
          remember: "KI ist ein Programm. Kein Mensch."
        }
      }
    ],
    abschluss: "Eine KI kann helfen. Prüfen musst du selbst. Und private Daten bleiben bei dir."
  },

  /* ---------------------------------------------------------
     FAKE NEWS UND KI-FAKES – Weiterleitung, Bild, Stimme
     --------------------------------------------------------- */
  fakes: {
    titel: "Stimmt das wirklich?",
    typ: "posteingang",
    kanal: "Posteingang",
    einstieg: [
      "Drei Sachen kommen bei dir an.",
      "Bei jeder fragst du: Stimmt das?"
    ],
    szenen: [
      {
        inhalt: [
          { typ: "liste", eintraege: [
            { von: "Gruppe: Nachbarschaft", vorschau: "ACHTUNG! Ab morgen kostet Trinkwasser 5 Euro pro Liter! Bitte an alle weiterleiten!!!", zeit: "08:12" }
          ] }
        ],
        frage: {
          question: "Was fällt dir an dieser Nachricht auf?",
          pictogram: "pikto-fake",
          answers: ["Sie ist hilfreich und wichtig.", "Große Aufregung und Bitte um Weiterleitung."],
          correctIndex: 1,
          feedbackWrong: "Große Buchstaben, viele Ausrufezeichen und Weiterleiten sind typisch für Falsch-Nachrichten.",
          feedbackCorrect: "Genau. Aufregung plus Weiterleiten ist das Muster.",
          remember: "Aufregende Nachrichten prüfe ich erst."
        }
      },
      {
        inhalt: [
          { typ: "hinweis", text: "Im Bild dazu hat eine Person sechs Finger an einer Hand. Der Text im Hintergrund ist verschwommen." }
        ],
        frage: {
          question: "Was heißt das?",
          pictogram: "pikto-photo",
          answers: ["Das Bild ist wahrscheinlich vom Computer gemacht.", "Das Foto ist nur unscharf."],
          correctIndex: 0,
          feedbackWrong: "Sechs Finger und verschwommene Schrift sind typische Fehler von KI-Bildern.",
          feedbackCorrect: "Gut erkannt. Hände und Schrift verraten KI-Bilder oft.",
          remember: "Bilder können gefälscht sein."
        }
      },
      {
        inhalt: [
          { typ: "anruf", von: "Deine Nichte?", nummer: "Unbekannte Nummer" },
          { typ: "hinweis", text: "Die Stimme klingt wie deine Nichte. Sie weint und bittet um Geld." }
        ],
        frage: {
          question: "Die Stimme klingt echt. Was machst du?",
          pictogram: "pikto-phone",
          answers: ["Ich schicke das Geld sofort.", "Ich lege auf und rufe die bekannte Nummer an."],
          correctIndex: 1,
          feedbackWrong: "Eine Stimme kann heute nachgemacht werden. Nur ein Rückruf gibt Sicherheit.",
          feedbackCorrect: "Sehr gut. Auflegen und selbst zurückrufen ist der sichere Weg.",
          remember: "Stimmen können gefälscht sein."
        }
      }
    ],
    abschluss: "Text, Bild und Stimme können gefälscht sein. Erst prüfen. Dann glauben."
  },

  /* ---------------------------------------------------------
     ONLINE-BETRUG – Posteingang mit vier Nachrichten
     --------------------------------------------------------- */
  betrug: {
    titel: "Dein Posteingang",
    typ: "posteingang",
    kanal: "Posteingang",
    einstieg: [
      "Vier Nachrichten sind da.",
      "Du entscheidest bei jeder: Trick oder echt?"
    ],
    szenen: [
      {
        inhalt: [
          { typ: "liste", eintraege: [
            { von: "SMS · Unbekannte Nummer", vorschau: "Ihr Paket wartet. Zahlen Sie 1,99 Euro Zoll-Gebühr: paket-info-24.xyz", zeit: "09:41" }
          ] }
        ],
        frage: {
          question: "Trick oder echt?",
          pictogram: "pikto-fraud",
          answers: ["Das ist ein Trick.", "Das ist echt."],
          correctIndex: 0,
          feedbackWrong: "Echte Paket-Dienste wollen kein Geld per SMS. Und die Adresse ist erfunden.",
          feedbackCorrect: "Richtig. Kleine Gebühr plus komische Adresse: der Paket-Trick.",
          remember: "Ich klicke nicht auf fremde Links."
        }
      },
      {
        inhalt: [
          { typ: "liste", eintraege: [
            { von: "SMS · Praxis Dr. Weber", vorschau: "Erinnerung: Sie haben morgen um 10 Uhr einen Termin bei uns.", zeit: "11:02" }
          ] }
        ],
        frage: {
          question: "Trick oder echt?",
          pictogram: "pikto-done",
          answers: ["Das ist ein Trick.", "Das ist echt."],
          correctIndex: 1,
          feedbackWrong: "Schau genau: kein Geld, kein Link, kein Druck. Das sind gute Zeichen.",
          feedbackCorrect: "Genau. Kein Geld, kein Link, kein Druck. Unsicher? Dann dort anrufen.",
          remember: "Kein Geld, kein Link, kein Druck: meistens echt."
        }
      },
      {
        inhalt: [
          { typ: "liste", eintraege: [
            { von: "E-Mail · service@bank-sicherheit24.xyz", vorschau: "Ihr Konto wird heute gesperrt! Bestätigen Sie sofort Ihre Bank-Daten.", zeit: "13:20" }
          ] }
        ],
        frage: {
          question: "Trick oder echt?",
          pictogram: "pikto-bank",
          answers: ["Das ist ein Trick.", "Das ist echt."],
          correctIndex: 0,
          feedbackWrong: "Deine Bank fragt nie per E-Mail nach deinen Daten. Drohung und Eile sind Warnzeichen.",
          feedbackCorrect: "Richtig. Das ist Phishing. Deine Bank schreibt so nicht.",
          remember: "Druck und Drohung sind Warnzeichen."
        }
      },
      {
        inhalt: [
          { typ: "liste", eintraege: [
            { von: "E-Mail · gewinn@super-lotto-plus.xyz", vorschau: "Sie haben 1.000 Euro gewonnen! Zahlen Sie nur 20 Euro Gebühr.", zeit: "16:55" }
          ] }
        ],
        frage: {
          question: "Trick oder echt?",
          pictogram: "pikto-money",
          answers: ["Das ist echt.", "Das ist ein Trick."],
          correctIndex: 1,
          feedbackWrong: "Bei einem echten Gewinn zahlst du nie zuerst etwas.",
          feedbackCorrect: "Genau. Erst zahlen für einen Gewinn: immer ein Trick.",
          remember: "Echte Gewinne kosten kein Geld."
        }
      }
    ],
    abschluss: "Du hast alle vier geprüft. Genau so kannst du es bei echten Nachrichten machen."
  },

  /* ---------------------------------------------------------
     ONLINE-EINKAUFEN – ein Shop mit Warnzeichen
     --------------------------------------------------------- */
  einkaufen: {
    titel: "Ein Schnäppchen im Netz",
    typ: "shop",
    kanal: "Shop",
    einstieg: [
      "Du suchst neue Schuhe.",
      "Ein Shop bietet sie sehr billig an."
    ],
    szenen: [
      {
        inhalt: [
          { typ: "shop", titel: "Marken-Schuhe", preis: "19,90 €", zeilen: [
            "Normal-Preis: 149,00 €",
            "Shop: schuhe-guenstig-outlet.xyz",
            "Kein Impressum gefunden"
          ] }
        ],
        frage: {
          question: "Was ist hier auffällig?",
          pictogram: "pikto-shop",
          answers: ["Sehr billig und kein Impressum.", "Der Shop hat eine schöne Seite."],
          correctIndex: 0,
          feedbackWrong: "Eine schöne Seite ist schnell gebaut. Der Preis und das fehlende Impressum sind die Hinweise.",
          feedbackCorrect: "Gut geschaut. Beides zusammen ist ein deutliches Warnzeichen.",
          remember: "Sehr billig und kein Impressum: Warnzeichen."
        }
      },
      {
        inhalt: [
          { typ: "shop", titel: "Bezahlen", preis: "19,90 €", zeilen: [
            "Vorkasse per Überweisung",
            "Andere Bezahl-Arten: keine"
          ] }
        ],
        frage: {
          question: "Nur Vorkasse ist möglich. Was heißt das für dich?",
          pictogram: "pikto-card",
          answers: ["Das ist normal.", "Ich zahle zuerst und bekomme vielleicht nichts."],
          correctIndex: 1,
          feedbackWrong: "Bei Vorkasse ist dein Geld weg, bevor die Ware da ist. Zurückholen ist schwer.",
          feedbackCorrect: "Genau. Auf Rechnung wärst du sicherer.",
          remember: "Rechnung ist sicherer als Vorkasse."
        }
      },
      {
        inhalt: [
          { typ: "hinweis", text: "Der Kaufen-Knopf blinkt. Daneben steht: Nur noch 2 Minuten!" }
        ],
        frage: {
          question: "Was machst du?",
          pictogram: "pikto-clock",
          answers: ["Ich breche ab.", "Schnell kaufen, bevor es weg ist."],
          correctIndex: 0,
          feedbackWrong: "Der Zeit-Druck ist gemacht. Er soll das Nachdenken verhindern.",
          feedbackCorrect: "Sehr gut. Abbrechen darfst du immer. Auch kurz vor dem Kauf.",
          remember: "Ich darf jeden Kauf abbrechen."
        }
      }
    ],
    abschluss: "Du hast den Shop geprüft und abgebrochen. Nichts gekauft ist manchmal die beste Entscheidung."
  }
};

/* =============================================================
   ÜBUNGS-HANDY: RUNDEN 2 UND 3 — Versuch, nur Thema "Betrug"
   -------------------------------------------------------------
   Stand 04.09.2026. Abgetrennter Block, damit der Versuch in
   einem Stück wieder entfernt werden kann. Die vier Szenen von
   Runde 1 oben bleiben unverändert; hier bekommen sie nur ihr
   Fallen-Bild dazu.

   NEUE FELDER (alle freiwillig — Szenarien ohne sie laufen
   unverändert weiter):
     stufe   1, 2 oder 3. Fehlt das Feld, gilt 1.
     falle   { inhalt:[...], text, textFalsch }
             Wird nach der Antwort gezeigt: was die Nachricht will.
             inhalt nutzt dieselben Bausteine wie der Bildschirm,
             dazu neu: { typ:"webseite", adresse, titel, felder[], knopf }
     schwer  true -> Rückmeldung sagt "Die war schwer."

   DIDAKTIK: Runde 1 und 2 fragen "Trick oder echt?" (Erkennen).
   Runde 3 fragt "Was machst du?" (Handeln). Das ist Absicht:
   auf Runde 3 sind die Nachrichten nicht mehr sicher zu erkennen.
   Sicherheit kommt dort aus der Handlung, nicht aus dem Blick.
   (§3 CLAUDE.md, UDL Handlung und Ausdruck.)

   Alles erfunden. Keine echten Marken, keine echten Nummern,
   keine echten Adressen.
   ============================================================= */

(function erweitereBetrug() {
  if (typeof SCENARIOS === "undefined" || !SCENARIOS.betrug) return;
  const b = SCENARIOS.betrug;

  /* ---- Texte je Runde ---- */
  b.stufen = {
    1: { einstieg: ["Vier Nachrichten sind da.", "Du entscheidest bei jeder: Trick oder echt?"] },
    2: { einstieg: ["Runde 2. Die Tricks sind besser gemacht.", "Keine Fehler mehr im Text. Schau genau hin."] },
    3: { einstieg: ["Runde 3. Jetzt kannst du es nicht mehr sehen.", "Auch geübte Menschen nicht.", "Deshalb fragen wir jetzt: Was machst du?"] }
  };

  /* ---- Runde 1: Fallen-Bilder ergänzen ---- */
  const fallen1 = {
    0: {
      inhalt: [{ typ: "webseite", adresse: "paket-info-24.xyz", titel: "Paket-Service",
                 felder: ["Ihre Karten-Nummer", "Gültig bis"], knopf: "Jetzt 1,99 € zahlen" }],
      text: "Schau: Das passiert, wenn du auf den Link tippst. Die Seite will deine Karten-Nummer. Das Paket gibt es nicht.",
      textFalsch: "So sieht die Falle von innen aus. Die Seite will deine Karten-Nummer. Jetzt kennst du sie."
    },
    2: {
      inhalt: [{ typ: "webseite", adresse: "bank-sicherheit24.xyz", titel: "Konto bestätigen",
                 felder: ["Kontonummer", "PIN"], knopf: "Konto freischalten" }],
      text: "Schau: Die Seite will deine Kontonummer und deine PIN. Deine Bank fragt so etwas nie.",
      textFalsch: "So sieht die Falle aus. Sie will deine Kontonummer und deine PIN. Deine Bank fragt so etwas nie."
    },
    3: {
      inhalt: [{ typ: "webseite", adresse: "super-lotto-plus.xyz", titel: "Gewinn abholen",
                 felder: ["Ihr Name", "Konto für die Gebühr"], knopf: "20 € zahlen und Gewinn holen" }],
      text: "Schau: Du sollst erst 20 Euro zahlen. Den Gewinn gibt es nicht.",
      textFalsch: "So sieht die Falle aus. Du sollst erst zahlen. Den Gewinn gibt es nicht."
    }
  };
  Object.keys(fallen1).forEach(i => {
    const szene = b.szenen[Number(i)];
    if (szene && !szene.falle) szene.falle = fallen1[i];
  });

  /* ---- Runde 2: gut gemachte Tricks ---- */
  b.szenen.push(
    {
      stufe: 2, schwer: true,
      inhalt: [{ typ: "liste", eintraege: [
        { von: "SMS · DHL Paket-Info", vorschau: "Ihre Sendung 4471 kommt heute zwischen 12 und 14 Uhr. Adresse ändern: dhl-liefertermin.de/4471", zeit: "08:14" }
      ] }],
      frage: {
        question: "Trick oder echt?",
        pictogram: "pikto-fraud",
        answers: ["Das ist ein Trick.", "Das ist echt."],
        correctIndex: 0,
        feedbackCorrect: "Richtig. Die Adresse ist fast richtig. Die echte Seite heißt dhl.de. Diese heißt dhl-liefertermin.de.",
        feedbackWrong: "Die Adresse ist fast richtig. Aber nur fast. Die echte Seite heißt dhl.de. Diese heißt anders.",
        remember: "Ich tippe nicht auf Links in Nachrichten. Ich öffne die App selbst."
      },
      falle: {
        inhalt: [{ typ: "webseite", adresse: "dhl-liefertermin.de/4471", titel: "Bitte anmelden",
                   felder: ["Ihr Name", "Ihr Passwort"], knopf: "Weiter" }],
        text: "Schau: Die Seite sieht aus wie die echte Seite. Sie will deinen Namen und dein Passwort.",
        textFalsch: "So sieht die Falle aus. Die Seite sieht echt aus. Sie will deinen Namen und dein Passwort."
      }
    },
    {
      stufe: 2,
      inhalt: [{ typ: "liste", eintraege: [
        { von: "E-Mail · bestellung@amazon-service.net", vorschau: "Ihre Bestellung über 89,90 Euro wurde storniert. Bei Fragen antworten Sie auf diese Mail.", zeit: "10:30" }
      ] }],
      frage: {
        question: "Trick oder echt?",
        pictogram: "pikto-mail",
        answers: ["Das ist ein Trick.", "Das ist echt."],
        correctIndex: 0,
        feedbackCorrect: "Richtig. Du hast gar nichts bestellt. Das ist das wichtigste Zeichen.",
        feedbackWrong: "Frag dich immer zuerst: Habe ich das wirklich bestellt? Wenn nein, ist es ein Trick.",
        remember: "Ich frage mich: Habe ich das wirklich bestellt?"
      },
      falle: {
        inhalt: [{ typ: "hinweis", text: "Du antwortest. Kurz danach ruft jemand an. Er sagt: Ich hole Ihr Geld zurück. Bitte öffnen Sie Ihr Online-Banking." }],
        text: "Schau: Die Mail will nur, dass du antwortest. Danach kommt der Anruf. Das ist die Falle.",
        textFalsch: "So geht die Falle weiter. Wer antwortet, bekommt einen Anruf. Der Anruf ist der Betrug."
      }
    },
    {
      stufe: 2,
      inhalt: [{ typ: "liste", eintraege: [
        { von: "SMS · Mein Handy-Anbieter", vorschau: "Ihre Rechnung für September ist fertig. Sie sehen sie in Ihrer App.", zeit: "07:00" }
      ] }],
      frage: {
        question: "Trick oder echt?",
        pictogram: "pikto-done",
        answers: ["Das ist ein Trick.", "Das ist echt."],
        correctIndex: 1,
        feedbackCorrect: "Genau. Kein Link. Kein Druck. Die Nachricht schickt dich in deine eigene App. Das ist gut.",
        feedbackWrong: "Schau noch einmal: kein Link, kein Geld, kein Druck. Sie schickt dich in deine eigene App.",
        remember: "Kein Link und kein Druck: das ist ein gutes Zeichen."
      }
    },
    {
      stufe: 2, schwer: true,
      inhalt: [{ typ: "liste", eintraege: [
        { von: "SMS · Sicherheits-Info", vorschau: "Ihr Konto wurde von einem neuen Gerät geöffnet. Waren Sie das nicht? Hier stoppen: konto-schutz.de/stop", zeit: "23:47" }
      ] }],
      frage: {
        question: "Trick oder echt?",
        pictogram: "pikto-warning",
        answers: ["Das ist ein Trick.", "Das ist echt."],
        correctIndex: 0,
        feedbackCorrect: "Richtig. Die Nachricht macht Angst. Und sie gibt dir einen Link. Beides zusammen ist ein Warnzeichen.",
        feedbackWrong: "Die Nachricht macht Angst. Genau das will sie. Angst und ein Link zusammen sind ein Warnzeichen.",
        remember: "Angst und ein Link zusammen: ich mache nichts."
      },
      falle: {
        inhalt: [{ typ: "webseite", adresse: "konto-schutz.de/stop", titel: "Zugriff stoppen",
                   felder: ["Benutzername", "Passwort"], knopf: "Jetzt stoppen" }],
        text: "Schau: Die Seite will deinen Namen und dein Passwort. Damit kommen die Betrüger erst in dein Konto.",
        textFalsch: "So sieht die Falle aus. Sie will deinen Namen und dein Passwort. Damit kommen die Betrüger in dein Konto."
      }
    }
  );

  /* ---- Runde 3: nicht mehr erkennbar — es zählt die Handlung ---- */
  b.szenen.push(
    {
      stufe: 3, schwer: true,
      inhalt: [{ typ: "liste", eintraege: [
        { von: "SMS · Deine Bank", vorschau: "Wir haben eine Zahlung über 340 Euro gestoppt. War das nicht Sie? Rufen Sie uns an: 0251 598 0", zeit: "19:30" }
      ] }],
      frage: {
        question: "Was machst du?",
        pictogram: "pikto-phone",
        answers: ["Ich rufe die Nummer aus der Nachricht an.", "Ich nehme die Nummer von meiner Bank-Karte."],
        correctIndex: 1,
        feedbackCorrect: "Sehr gut. Diese Nachricht ist echt. Aber das kannst du nicht sicher sehen. Betrüger schreiben genau so. Mit deiner eigenen Nummer bist du immer sicher.",
        feedbackWrong: "Diese Nachricht ist echt. Trotzdem ist die eigene Nummer besser. Denn Betrüger schreiben genau solche Nachrichten. Man sieht den Unterschied nicht.",
        remember: "Ich rufe nur Nummern an, die ich schon habe."
      },
      falle: {
        inhalt: [{ typ: "anruf", von: "Angeblich deine Bank", nummer: "Nummer aus der Nachricht" }],
        text: "Diese Nachricht war echt. Aber schau, was bei einer falschen passiert: Am Telefon sitzt ein Betrüger. Er klingt freundlich. Er sagt: Ich bin von Ihrer Bank.",
        textFalsch: "Schau, was bei einer falschen Nachricht passiert: Am Telefon sitzt ein Betrüger. Er klingt freundlich. Er sagt: Ich bin von Ihrer Bank."
      }
    },
    {
      stufe: 3, schwer: true,
      inhalt: [{ typ: "liste", eintraege: [
        { von: "SMS · Deine Bank", vorschau: "Ihre neue TAN-App ist bereit. Bitte bestätigen Sie einmalig Ihre Anmeldung: bank-tan-start.de", zeit: "19:41" }
      ] }],
      frage: {
        question: "Was machst du?",
        pictogram: "pikto-bank",
        answers: ["Ich tippe auf den Link.", "Ich öffne meine Bank-App selbst."],
        correctIndex: 1,
        feedbackCorrect: "Sehr gut. Das war ein Trick. Die Seite ist sehr gut nachgemacht. Auch geübte Menschen erkennen sie nicht. Du musst sie nicht erkennen. Du öffnest die App selbst. Dann bist du sicher.",
        feedbackWrong: "Das war ein Trick. Die Seite ist sehr gut nachgemacht. Auch geübte Menschen erkennen sie nicht. Deshalb hilft nur eins: die App selbst öffnen.",
        remember: "Ich muss den Trick nicht erkennen. Ich öffne die App selbst."
      },
      falle: {
        inhalt: [{ typ: "webseite", adresse: "bank-tan-start.de", titel: "Anmeldung bestätigen",
                   felder: ["Anmeldename", "PIN", "TAN"], knopf: "Bestätigen" }],
        text: "Schau: Die Seite sieht genau aus wie deine Bank. Sie will deine PIN und deine TAN. Damit holen die Betrüger dein Geld.",
        textFalsch: "So sieht die Falle aus. Die Seite sieht genau aus wie deine Bank. Sie will deine PIN und deine TAN."
      }
    },
    {
      stufe: 3, schwer: true,
      inhalt: [{ typ: "liste", eintraege: [
        { von: "WhatsApp · Unbekannte Nummer", vorschau: "Hallo, ich bin es. Mein Handy ist kaputt. Das ist meine neue Nummer. Kannst du mir kurz helfen?", zeit: "17:12" }
      ] }],
      frage: {
        question: "Was machst du?",
        pictogram: "pikto-message",
        answers: ["Ich schreibe zurück und helfe.", "Ich rufe die alte Nummer an."],
        correctIndex: 1,
        feedbackCorrect: "Sehr gut. Ruf die alte Nummer an. Geht die Person dort ran, war die Nachricht ein Trick.",
        feedbackWrong: "Betrüger schreiben oft so. Erst sind sie nett. Dann bitten sie um Geld. Ruf immer zuerst die alte Nummer an.",
        remember: "Neue Nummer? Ich rufe zuerst die alte an."
      },
      falle: {
        inhalt: [{ typ: "nachricht", von: "Unbekannte Nummer", text: "Danke! Ich komme gerade nicht an mein Konto. Kannst du eine Rechnung für mich zahlen? Es sind 890 Euro. Ich gebe es dir morgen wieder.", zeit: "17:20" }],
        text: "Schau, wie es weitergeht. Erst ist es nett. Dann kommt die Bitte um Geld.",
        textFalsch: "So geht die Falle weiter. Erst ist es nett. Dann kommt die Bitte um Geld."
      }
    },
    {
      stufe: 3, schwer: true,
      inhalt: [
        { typ: "liste", eintraege: [
          { von: "SMS · Sicherheits-Code", vorschau: "Ihr Code lautet 449812. Geben Sie ihn niemandem weiter.", zeit: "20:05" }
        ] },
        { typ: "hinweis", text: "Kurz danach klingelt das Telefon. Jemand sagt: Ich bin von Ihrer Bank. Bitte nennen Sie mir den Code." }
      ],
      frage: {
        question: "Was machst du?",
        pictogram: "pikto-lock",
        answers: ["Ich sage den Code.", "Ich sage den Code nicht."],
        correctIndex: 1,
        feedbackCorrect: "Sehr gut. Die SMS ist echt. Der Anruf ist der Betrug. Niemand darf diesen Code haben. Auch nicht deine Bank. Auch nicht die Polizei.",
        feedbackWrong: "Die SMS ist echt. Aber der Anruf ist der Betrug. Mit dem Code kommt der Anrufer in dein Konto. Niemand darf ihn haben.",
        remember: "Meinen Code sage ich niemandem. Auch nicht am Telefon."
      },
      falle: {
        inhalt: [{ typ: "hinweis", text: "Der Anrufer hat den Code. Er meldet sich in deinem Konto an. Das Geld ist weg." }],
        text: "Schau: Die SMS war echt. Der Anruf danach ist der Trick. Der Code ist der Schlüssel zu deinem Konto.",
        textFalsch: "So endet die Falle. Der Code ist der Schlüssel zu deinem Konto. Wer ihn hat, kommt hinein."
      }
    }
  );

  b.abschluss = "Du hast geprüft und entschieden. Genau so kannst du es bei echten Nachrichten machen.";
})();

/* =============================================================
   AUS DEM TRAININGS-POSTFACH GERETTET (Sept 2026)
   -------------------------------------------------------------
   Das Trainings-Postfach hatte eine EIGENE Nachrichtenliste
   (TRAINING_INBOX in topics.js). Vier ihrer Nachrichten waren
   wortgleich mit Szenen aus dem Übungs-Handy – zwei Angebote mit
   demselben Inhalt, und nur eines zahlte auf "Deine Karte" ein.

   Ab jetzt hat das Postfach keine eigenen Daten mehr: Es mischt
   Fragen aus DIESEN Szenarien. Damit dabei nichts verlorengeht,
   ziehen die Nachrichten, die es nur dort gab, hier ein – mit
   Merksatz, damit sie auf die Karte einzahlen.

   Nicht übernommen wurde die Lotto-Gewinn-Nachricht: die steht
   inhaltlich schon als Szene in Runde 1 von "betrug".
   TRAINING_INBOX bleibt in topics.js unangetastet stehen, wird
   aber nicht mehr benutzt.
   ============================================================= */

(function rettePostfachNachrichten() {
  if (typeof SCENARIOS === "undefined") return;

  /* --- WhatsApp: zwei echte Nachrichten. Wichtig fuers Augenmass:
         Wer nur Tricks sieht, wird misstrauisch gegen alles. --- */
  if (SCENARIOS.whatsapp) {
    SCENARIOS.whatsapp.szenen.push(
      {
        inhalt: [{ typ: "nachricht", von: "Anna", text: "Hallo! Kommst du am Samstag zum Kaffee? Ich freue mich. Liebe Grüße, Anna", zeit: "15:20" }],
        frage: {
          question: "Trick oder echt?",
          pictogram: "pikto-friend",
          answers: ["Das ist ein Trick.", "Das ist echt."],
          correctIndex: 1,
          feedbackCorrect: "Genau. Die Nachricht kommt von einer Person, die du kennst. Sie will kein Geld. Sie macht keinen Druck.",
          feedbackWrong: "Schau noch einmal: Du kennst Anna. Sie will kein Geld. Sie macht keinen Druck. Das ist eine normale Nachricht.",
          remember: "Kein Geld und kein Druck von einer Person, die ich kenne: das ist normal."
        }
      },
      {
        inhalt: [{ typ: "nachricht", von: "Wohn-Gruppe", text: "Erinnerung an alle: Morgen um 15 Uhr ist unser Treffen im Gemeinschaftsraum.", zeit: "18:05" }],
        frage: {
          question: "Trick oder echt?",
          pictogram: "pikto-people",
          answers: ["Das ist ein Trick.", "Das ist echt."],
          correctIndex: 1,
          feedbackCorrect: "Richtig. Eine Erinnerung aus deiner Gruppe. Kein Link, kein Geld, keine Eile.",
          feedbackWrong: "Diese Nachricht kommt aus deiner Gruppe. Sie will nichts von dir. Sie ist echt.",
          remember: "Ich prüfe: Will die Nachricht etwas von mir?"
        }
      }
    );
  }

  /* --- Einkaufen: echte Bestell-Bestaetigung --- */
  if (SCENARIOS.einkaufen) {
    SCENARIOS.einkaufen.szenen.push({
      inhalt: [{ typ: "liste", eintraege: [
        { von: "E-Mail · bestellung@musterschuhe.de", vorschau: "Danke für deine Bestellung. Deine Schuhe kommen am Donnerstag. Du kannst alles in deinem Konto ansehen.", zeit: "09:15" }
      ] }],
      frage: {
        question: "Trick oder echt?",
        pictogram: "pikto-shop",
        answers: ["Das ist ein Trick.", "Das ist echt."],
        correctIndex: 1,
        feedbackCorrect: "Genau. Du hast dort wirklich bestellt. Die Mail will kein Geld und macht keinen Druck.",
        feedbackWrong: "Frag dich zuerst: Habe ich dort bestellt? Wenn ja, und die Mail will kein Geld: dann ist sie echt.",
        remember: "Ich frage mich: Habe ich das wirklich bestellt?"
      }
    });
  }

  /* --- Betrug, Runde 2: zwei gut gemachte Tricks --- */
  if (SCENARIOS.betrug) {
    SCENARIOS.betrug.szenen.push(
      {
        stufe: 2, schwer: true,
        inhalt: [{ typ: "liste", eintraege: [
          { von: "SMS · Unbekannte Nummer", vorschau: "Hallo! Ich habe dir aus Versehen einen Code geschickt. Kannst du ihn mir bitte kurz weiterleiten?", zeit: "14:33" }
        ] }],
        frage: {
          question: "Trick oder echt?",
          pictogram: "pikto-code",
          answers: ["Das ist ein Trick.", "Das ist echt."],
          correctIndex: 0,
          feedbackCorrect: "Richtig. Niemand schickt aus Versehen einen Code. Wer danach fragt, will in dein Konto.",
          feedbackWrong: "Ein Code kommt nie aus Versehen bei dir an. Der Absender will damit in dein Konto.",
          remember: "Meine Codes sage ich niemandem. Auch nicht am Telefon."
        },
        falle: {
          inhalt: [{ typ: "hinweis", text: "Du schickst den Code. Der Absender meldet sich damit in deinem Konto an. Der Code war der Schlüssel." }],
          text: "Schau: Der Code war der Schlüssel zu deinem Konto. Deshalb hat jemand danach gefragt.",
          textFalsch: "So geht die Falle aus. Der Code ist der Schlüssel zu deinem Konto. Wer ihn hat, kommt hinein."
        }
      },
      {
        stufe: 2,
        inhalt: [{ typ: "liste", eintraege: [
          { von: "SMS · Stream-Dienst", vorschau: "Ihr Konto ist abgelaufen. Aktualisieren Sie sofort Ihre Bank-Daten, sonst wird gekündigt.", zeit: "21:10" }
        ] }],
        frage: {
          question: "Trick oder echt?",
          pictogram: "pikto-warning",
          answers: ["Das ist ein Trick.", "Das ist echt."],
          correctIndex: 0,
          feedbackCorrect: "Richtig. Sofort und sonst: das ist Druck. Und niemand fragt per SMS nach Bank-Daten.",
          feedbackWrong: "Achte auf das Wort sofort und auf die Drohung. Und: Bank-Daten gibt man nie per SMS.",
          remember: "Druck und die Frage nach Bank-Daten: immer ein Trick."
        },
        falle: {
          inhalt: [{ typ: "webseite", adresse: "stream-konto-verlaengern.xyz", titel: "Konto verlängern",
                     felder: ["Kontonummer", "Bank-Leitzahl"], knopf: "Jetzt verlängern" }],
          text: "Schau: Die Seite will deine Bank-Daten. Der Stream-Dienst hat damit nichts zu tun.",
          textFalsch: "So sieht die Falle aus. Die Seite will deine Bank-Daten. Der echte Dienst fragt so nie."
        }
      }
    );
  }
})();
