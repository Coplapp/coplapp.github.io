# Copl App Store Preview Video

15-sekunders preview-video för App Store-listningen, gjord i HTML/CSS.

## Workflow

### Steg 1: Visa animationen i din browser

```
Öppna landing/preview-video.html i Chrome
```

Du ser direkt en nedskalad version (540×960) som loopar 15-sekunders-animationen.

### Steg 2: Byt ut de 5 placeholder-skärmarna

Ta 5 screenshots på din iPhone (Settings → Screen Recording, eller Volume-Up + Power för en bild):

| Filnamn | Vad ska visas |
|---|---|
| `screen-1.png` | **Dashboard** — startsidan med modulkort + pulserande logga |
| `screen-2.png` | **Kalender** — månadsvy eller agenda |
| `screen-3.png` | **Familj** — översikten med familjemedlemmar |
| `screen-4.png` | **Ekonomi** — översikten med balans + sparande |
| `screen-5.png` | **Närhet** — PIN-låsskärmen (INTE innehållet bakom!) |

**Krav på screenshots:**
- iPhone-skärmupplösning (1170×2532 px för 6.7", 1242×2688 för 6.5", t.ex.)
- PNG-format
- Mörk Frost-bakgrund (canvas #061018) — passar med video-bakgrunden

**Lägg filerna i:** `landing/preview-video-assets/`

### Steg 3: Aktivera screenshots i HTML

Öppna `landing/preview-video.html` och leta upp blocken `.screen-1`, `.screen-2` etc i CSS:n.

**Ersätt:**
```css
.screen-1 {
  background: linear-gradient(180deg, #0a1620 0%, #0e1a26 100%);
}
```

**Med:**
```css
.screen-1 {
  background-image: url('preview-video-assets/screen-1.png');
  background-size: cover;
  background-position: center;
}
```

Gör samma sak för screen-2, 3, 4, 5.

Ta även bort `class="screen-placeholder"` från HTML-divarna och deras inner-content (icon, name, note).

### Steg 4: Förhandsvisa fullsize

Öppna i Chrome med `?fullsize` i URL:en:
```
file:///.../landing/preview-video.html?fullsize
```

Nu renderar animationen i exakt 1080×1920 (vertikal iPhone). Maximera Chrome-fönstret till minst den storleken.

### Steg 5: Spela in skärmen

**Mac (QuickTime):**
1. QuickTime → File → New Screen Recording
2. Välj "Record Selected Portion"
3. Dra rutan så den täcker EXAKT 1080×1920 av stage:n (eller mer + crop senare)
4. Klicka Record när animationen står på "intro" (logga i mitten)
5. Spela in i 15+ sekunder
6. Stoppa, spara som `.mov`

**Windows (Xbox Game Bar):**
1. Win + G → Capture-widget
2. Klicka Record (eller Win + Alt + R)
3. Spela in 15+ sekunder
4. Spara MP4

**Bästa kvalitet (rekommenderat):** Använd OBS Studio (gratis):
- Källa: "Display Capture" eller "Window Capture" → Chrome
- Output: MP4, 60 fps, hög bitrate
- Recordstorlek 1080×1920

### Steg 6: Trimma och konvertera med FFmpeg

App Store kräver **exakt 15-30 sek** och specifika dimensioner.

**Installera FFmpeg** (om du inte har det):
- Mac: `brew install ffmpeg`
- Windows: ladda från ffmpeg.org

**Trimma till exakt 15s + konvertera:**
```bash
ffmpeg -i din-inspelning.mov \
  -ss 00:00:00 \
  -t 15 \
  -vf "scale=1080:1920,fps=30" \
  -c:v libx264 -preset slow -crf 18 \
  -c:a aac -b:a 128k \
  -pix_fmt yuv420p \
  copl-preview-67.mp4
```

**Förklaring:**
- `-ss 00:00:00 -t 15` — börja vid 0, klipp 15 sek
- `-vf "scale=1080:1920,fps=30"` — skala till App Store-spec
- `-c:v libx264 -crf 18` — hög kvalitet H.264
- `-pix_fmt yuv420p` — App Store-kompatibel pixel-format

**För andra storlekar:**
- 6.5" iPhone XS Max: `scale=886:1920`
- 5.5" iPhone 8 Plus: `scale=1080:1920` (samma)

### Steg 7: Ladda upp till App Store Connect

1. Logga in på `appstoreconnect.apple.com`
2. Din app → App Preview and Screenshots
3. Välj storlek (6.7", 6.5", 5.5") — ladda upp respektive `.mp4`
4. Drag-and-drop tills uppladdningen är klar

## Tips

- **Inspelning på Mac med exakt 1080×1920:** öppna preview-video.html, F11 fullskärm, justera ev. Chrome-storleken till 1080×1920 via DevTools (Cmd+Shift+M → välj iPhone 12 Pro Max)
- **Loopen är 15s exakt** — vänta tills animationen står på intro (logga i mitten) innan du börjar inspelning
- **Om FFmpeg klagar** på pixel-format, lägg till `-pix_fmt yuv420p` (redan inkluderat ovan)
- **Apple kräver INGA tredjepartslogos** i preview-videon (bara din app + Copl-logga är OK)

## Bakgrund: Storyboard

Animationen är uppdelad så här (15 sek):

| Tid | Vad visas | Text |
|---|---|---|
| 0.0 - 2.0s | Intro: pulserande logga | "Få ihop livspusslet" |
| 2.0 - 4.5s | Dashboard | "Allt ni delar - på ett ställe" |
| 4.5 - 7.0s | Kalender | "Veckan i ett ögonkast" |
| 7.0 - 9.5s | Familj | "Familjen samlad" |
| 9.5 - 12.0s | Ekonomi | "Hushållets ekonomi" |
| 12.0 - 13.5s | Närhet (PIN) | "Bara mellan er två" |
| 13.5 - 15.0s | Outro: logga + CTA | "🍎 Snart i App Store" |

Du kan justera tajming, text och färger direkt i HTML-filen.
