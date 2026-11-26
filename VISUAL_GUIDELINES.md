# VISUAL_GUIDELINES.md

### Goldene Regeln für jede Lektion
1. **Show, Don't Tell:** Maximal 3–4 kurze Sätze Text pro Screen. Erkläre Konzepte durch Interaktion, Visualisierung und echte Medien – nicht durch Textblöcke.
2. **Echte Karten-Pflicht (Profi-Tipp):** Nutze für reale Länder, Kontinente, Meere und Grenzen **immer echte GeoJSON/TopoJSON-Daten** aus den Karten-Bibliotheken (Leaflet / d3-geo + world-atlas) statt handgezeichneter SVG-Polygone. Eigene SVGs sind nur für Taktik-Overlays, animierte Pfeile, Moleküle, Explosionszeichnungen und Schemata erlaubt!
3. **Mindestens 1 echte Interaktion pro Screen:** Slider ziehen, Phasen weiterschalten, Hotspots auf Bildern anklicken, Regler verändern, Layer umschalten oder Audio abspielen. Keine statischen Deko-Boxen.

### Visualisierungs-Matrix nach Kategorie
Wähle beim Umwandeln neuer OneNote-Notizen pro Screen die passenden Module:
- **Geschichte:** Territoriums-Slider (Reiche über Zeit auf echter Karte), animierte Schlacht-/Taktik-Karten (Phasen-Stepper mit `stroke-dashoffset`-Truppenpfeilen), Kausal-Zeitstrahl (Ursache-Wirkung-Highlighting), historische Fotos/Videos.
- **Geografie:** Zoombarer Standort-Atlas mit pulsierenden Pins & Routen (Handelswege, Flüsse, Platten), interaktive Schichten-/Höhen-Querschnitte (SVG), Klimazonen-Layer.
- **Architektur:** Echte Bauwerks-Fotos (Wikimedia) mit **klickbarem Hotspot-Scanner** (Bauteile hervorheben), Grundriss-Overlay, Epochen-Vergleichsslider (Vorher/Nachher).
- **Kunst:** Hochauflösende Gemälde (Wikimedia) mit **Deep-Zoom & umschaltbaren Analyse-Layern** (Fluchtpunkt, Goldener Schnitt, Licht/Schatten, Farbpalette) + klickbare Detail-Hotspots.
- **Musik:** Verifizierte YouTube-Hörbeispiele mit exakten Sprungmarken (`start`/`end`) + **interaktives Tone.js Sound-Lab** (klickbare Tonleitern, Dur/Moll-Vergleich, Rhythmus-Pattern, visuelle Wellenform/Motiv-Timeline).
- **Politik:** Interaktive Gewaltenteilungs-/Macht-Organigramme, Parlaments-Sitzverteilung / politischer Kompass, animierter Gesetzgebungs-Flowchart, geopolitische Karten.
- **Wirtschaft:** Interaktive Kurven- & Markt-Simulatoren mit Live-Slidern (Angebot/Nachfrage, Zins, Inflation), Geld-/Warenfluss-Sankey-Diagramme, Konjunkturphasen-Explorer.
- **Wissenschaft:** Molekül- & Reaktions-Simulator (CPK-Farbschema, Bindungsbruch per Slider), Physik-/Chemie-Parameter-Spielplatz (Live-Regler für Temperatur, Druck, Strom, Gravitation), Größenordnungs-Zoom.
- **Technologie:** Interaktive Explosionszeichnungen (Bauteil anklicken → Detailfokus), animierte Daten-/Signalfluss-Simulationen Schritt für Schritt.
- **Natur:** Ein-/ausblendbare Anatomie- & Zell-Layer, animierte Ökosystem-Nahrungsnetze & Kreisläufe, echte Verbreitungskarten mit Tier-/Pflanzenfotos (Wikimedia).
- **Philosophie:** Interaktiver Ideen- & Einfluss-Graph (Wer beeinflusste wen? Wer widerspricht wem?), spielbare Gedankenexperimente / Dilemma-Entscheidungspfade, Weltbild-Split-Screen.
- **Mythologie:** Interaktiver Götter-Stammbaum (Beziehungen & Symbole anklickbar), mythologische Routenkarte auf echter Geografie (z. B. Odyssee) + echte klassische Gemälde/Statuen.
- **Literatur:** Interaktives Figuren-Beziehungsnetz (Allianzen/Konflikte), klickbarer Spannungsbogen (Akte & Schlüsselszenen), Handlungs-Atlas + interaktiver Zitat-/Stilmittel-Scanner.

### Qualitätskontrolle vor Abschluss jeder Lektion
- Laufen alle Karten auf echten Geodaten ohne verzerrte Umrisse?
- Laden alle externen Bilder/Videos/Audio-Elemente fehlerfrei?
- Sind alle Fakten aus den OneNote-Notizen sauber verarbeitet?
- Funktionieren alle Interaktionen und Quiz-Typen auf Desktop und mobil ohne Konsolenfehler?
