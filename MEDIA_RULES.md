# MEDIA_RULES.md

### Medien- & Internet-Recherche-Regeln (ZERO Broken Links!)
1. **Keine erfundenen URLs:** Erfinde niemals Bild-URLs oder YouTube-IDs aus dem Gedächtnis. Jede externe URL muss vor dem Einbau aktiv verifiziert oder über offizielle APIs geladen werden.
2. **Fotos, Gemälde, Architektur, Porträts, Natur:**
   - Nutze primär die **Wikimedia Commons / Wikipedia REST API** (`https://de.wikipedia.org/api/rest_v1/page/summary/<Titel>` oder direkte verifizierte `upload.wikimedia.org`-URLs) für hochauflösende, lizenzsichere Bilder.
   - Baue eine wiederverwendbare `<SmartMediaImage />`-Komponente mit sauberem Loading-State, Bildunterschrift, Quellenangabe und automatischem Fallback-Handling, falls ein Bild nicht lädt.
3. **Videos & echte Musikaufnahmen:**
   - Suche aktiv echte, verfügbare **YouTube-Videos** (z. B. Dokus, historische Aufnahmen, Symphonien, Live-Aufführungen, Erklärclips).
   - Bette sie über eine wiederverwendbare `<SmartVideoPlayer />`-Komponente (`youtube-nocookie.com`) ein – **immer mit präzisen `start`- und `end`-Sekunden**, damit der Nutzer direkt die relevante Stelle sieht/hört.
4. **Interaktive Musik:**
   - Nutze für Musiktheorie, Motive, Akkorde, Rhythmen oder Stilvergleiche zusätzlich eine wiederverwendbare `<MusicLab />`-Komponente auf Basis von `Tone.js`, sodass der Nutzer Töne, Akkorde und Rhythmen direkt durch Klicken live hören kann.
