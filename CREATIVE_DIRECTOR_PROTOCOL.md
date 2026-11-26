# CREATIVE_DIRECTOR_PROTOCOL.md

Befolge dieses Protokoll strikt bei JEDER neuen Lektion:

### A) Offenes Kategorien-System (Zukunftssicher)
- Die 13 Startkategorien sind nur die Basis. Kategorien dürfen **nicht** starr im Code festgenagelt sein, sondern werden über eine dynamische Konfigurationsdatei (`/src/config/categories.ts`) verwaltet.
- Wenn neue OneNote-Notizen zu einer noch nicht existierenden Kategorie gehören (z. B. Psychologie, Recht, Medizin, Astronomie, Sport, Finanzen), schlage die neue Kategorie inkl. passender Editorial-Dark-Mode-Akzentfarbe und Lucide-Icon automatisch vor und erweitere die Registry sauber.

### B) Strategische Inhalts-Analyse (Kategorie-unabhängig)
Betrachte die 13-Kategorien-Matrix in `VISUAL_GUIDELINES.md` nur als **Inspiration, niemals als Limit**. Zerlege jede neue OneNote-Notiz stattdessen zuerst nach **6 universellen visuellen Dimensionen**:
1. **Raum & Ort:** Wo passiert es? (Echte Karte, Route, Grundriss, Querschnitt, Zoom-Ebenen)
2. **Zeit & Kausalität:** Was löst was aus? (Zeitstrahl, Epochen-Slider, Ursache-Wirkung-Kette, Vorher/Nachher)
3. **System & Mechanik:** Wie funktioniert es? (Interaktive Regler, Wenn-Dann-Simulation, Stoff-/Geld-/Datenfluss)
4. **Struktur & Aufbau:** Woraus besteht es? (Explosionszeichnung, Ebenen-Toggle, klickbare Hotspots auf echtem Foto/Gemälde)
5. **Beziehungen & Konflikt:** Wer steht wie zu wem? (Netzwerk-Graph, Stammbaum, Kräfteverhältnis, Entscheidungsbaum)
6. **Sinne & Kontext:** Was muss man sehen oder hören? (Verifizierte Wikimedia-Bilder, YouTube-Clips mit exaktem Zeitstempel, Tone.js-Audio)

### C) Pflicht-Workflow: PITCH BEFORE CODE (Strikt einhalten!)
Wann immer neue OneNote-Notizen geschickt werden, **STOPPE vor der Implementierung. Schreibe noch KEINEN Code!**
Erstelle stattdessen zuerst einen kompakten, strategischen **Visualisierungs-Pitch** mit genau diesem Aufbau:

1. **Kern-Diagnose (2 Sätze):** Was ist das eigentliche „Aha!-Prinzip“ hinter diesen Notizen – was muss der Nutzer visuell *begreifen*, statt es nur auswendig zu lernen?
2. **3 konkrete Umsetzungskonzepte zur Auswahl:**
   - **Option A – Der visuelle Atlas (Klar & strukturiert):** Fokus auf räumliche/zeitliche Einordnung, echte Karten, kuratierte Fotos/Videos und glasklare Struktur.
   - **Option B – Das interaktive Labor (Mechanik & Simulation):** Fokus auf aktives Ausprobieren (Regler, Phasen-Stepper, Live-Reaktionen, Experimente, Audio-Lab).
   - **Option C – Die Überraschungs-Idee (Wildcard / Ungewöhnlicher Blickwinkel):** Ein originelles, unerwartetes Interaktions-Konzept, das perfekt zum Stoff passt und wirklich überrascht – z. B. ein spielbarer Entscheidungs-Simulator („Du bist der General / der Zentralbankchef / der Architekt“), eine Zeitmaschinen-Ansicht, ein interaktiver Tatort-/Werk-Scanner oder ein ungewöhnlicher Perspektivwechsel. **Muss technisch solide, hochwertig und realistisch in unserer Web-App umsetzbar sein – keine leeren Luftschlösser.**
3. **Medien-Vorschläge:** Liste kurz auf, welche konkreten echten Bilder (Wikimedia), Videos/Musikstellen (YouTube inkl. grobem Fokus) oder Tone.js-Sounds recherchiert und eingebaut würden.
4. **Vorgeschlagene Wiederholungs-Quizze:** 2–3 konkrete Ideen, wie das Wissen im Wiederholungsordner *visuell* abgefragt wird.

Beende den Pitch immer mit der Frage:
> **„Welche Option soll ich bauen – oder willst du Elemente aus A, B und C kombinieren (z. B. Screen 1–2 aus A + die Überraschungs-Idee aus C)?“**

Erst nach ausdrücklicher Freigabe wird der Code für die Lektion geschrieben.
