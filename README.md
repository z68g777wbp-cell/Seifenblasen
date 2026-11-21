# DENKAVO – Seifenblasen-Lernspiel

Ein eigenständiges, statisches Lernspiel für Malreihen (3, 4, 6, 7, 8, 9).

## Start
`index.html` im Browser öffnen. Keine Installation, keine Datenbank und keine externen Bibliotheken erforderlich.

## Spiel
- Fange alle zehn Ergebnisse der ausgewählten Malreihe.
- Geschwindigkeiten: Schildkröte (langsam), Pferd (mittel), Gepard (schnell).
- Mindestens acht Blasen im Spielfeld; richtige Ergebnisse werden laufend ergänzt.
- Richtige Blasen platzen; ein Stern erscheint kurz und wandert danach als dauerhafter Stern in die Erfolgsleiste.
- Falsche Treffer werden im Hintergrund protokolliert und in der Abschlussauswertung mit konkreten Zahlen angezeigt.
- Die Zeit läuft im Hintergrund; bei Abschluss wird ein `denkavo:game-complete`-Event ausgelöst.
- Alle Blasen zeigen ausschließlich Produkte der Reihen 3, 4, 6, 7, 8 oder 9 bis maximal 10×. Es erscheinen keine darüber hinausgehenden Vielfachen und keine fremden Zahlen. In den angebotenen Reihen kommen als Primzahl-Ergebnisse nur 3 und 7 vor.

## Integration in DENKAVO
Das Spiel sendet bei Abschluss ein Browser-Event:
```js
window.addEventListener("denkavo:game-complete", event => {
  console.log(event.detail);
  // game, table, elapsedSeconds, wrongValues, wrongCount, correctCount
});
```
Es werden derzeit keine Schülerdaten übertragen oder gespeichert. Die spätere Plattformintegration kann diesen Adapter gezielt ergänzen.

## GitHub Pages
Repository erstellen, diese Dateien hochladen und in GitHub unter **Settings → Pages** die Veröffentlichung aus dem `main`-Branch und `/ (root)` aktivieren.

## Projektstruktur
- `index.html` – Oberfläche
- `styles.css` – responsive Darstellung
- `game.js` – Spielablauf und Auswertung
