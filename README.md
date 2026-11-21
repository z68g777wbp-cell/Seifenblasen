# DENKAVO – Seifenblasen (Malreihen)

Ein eigenständiges, dependency-freies HTML/CSS/JavaScript-Lernspiel. Läuft lokal, auf statischem Hosting (z. B. GitHub Pages) und kann später als Spielmodul in DENKAVO eingebettet werden.

## Spielen

`index.html` im Browser öffnen oder den Ordner auf ein statisches Hosting legen.

- Malreihen: 3, 4, 6, 7, 8, 9
- Tempo: Schildkröte, Pferd, Gepard
- Es sind mindestens acht Blasen im Spielfeld; mindestens drei davon sind noch nicht gefangene Ergebnisse der gewählten Reihe.
- Die zehn Ergebnisse sind die Produkte der gewählten Reihe von 1× bis 10×.
- Richtige Blase: platzt, Ergebnis-Stern erscheint kurz und wird beim Abschluss in der Fang-Reihenfolge unten gesammelt.
- Falsche Blase: Fehler wird im Hintergrund gezählt; die konkrete Zahl erscheint in der Abschlussauswertung.
- Abschluss: benötigte Zeit, Fehleranzahl und angetippte falsche Ergebnisse.

## Plattform-Integration

Beim Abschluss werden zwei Browserereignisse ausgelöst:

- `denkavo:game-result`
- `denkavo:task-event` (Typ `session_complete`)

Das Ergebnisobjekt enthält `game`, `table`, `elapsedMs`, `elapsedSeconds`, `mistakes`, `mistakeCount`, `captured` und `completed`. Bei Einbettung in ein iframe wird zusätzlich `DENKAVO_GAME_RESULT` an das Elternfenster gesendet. Vor dem produktiven Einsatz sollte dieser Adapter mit dem bestehenden DENKAVO-Sitzungs-/Aufgaben-Backend verbunden werden; die Spieloberfläche schreibt selbst keine Schülerdaten in Supabase.

## Dateien

- `index.html` – Struktur und Steuerung
- `styles.css` – responsives Design, Touch-/Landscape-/Portrait-Regeln
- `game.js` – Bewegung, Treffer, Zeit, Auswertung und Integrationsereignisse

## Test

`npm test` prüft HTML-/Dateistruktur, JavaScript-Syntax und zentrale Spielverträge. Ein zusätzlicher Playwright-End-to-End-Test liegt unter `test/browser_test.py`; dafür Playwright samt Chromium installieren. Im Arbeitscontainer war kein nutzbarer Headless-Browser verfügbar, daher wurde der vollständige Klicktest hier nicht als bestanden ausgewiesen.

## Datenschutz

Das Spiel ist offline-first und erhebt/speichert keine personenbezogenen Daten lokal oder serverseitig. Es sendet Ergebnisse nur als Ereignis an die einbettende Plattform bzw. das Elternfenster. Die Plattform entscheidet über Speicherung und Zuordnung.
