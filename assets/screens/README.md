# Skärmbilder till swajparen på startsidan

Fem filer, samma namn som i `index.html`:

- `hem.png` - startsidan
- `kalender.png` - Vår kalender
- `mat.png` - Matplanering
- `inkop.png` - Inköpslistor
- `relation.png` - Vår relation

Rutan är 280 × 580 och bilden beskärs med `object-fit: cover`, så ett
telefonformat funkar rakt av - samma bilder som App Store-pipelinen tar fram.
Håll dem under ~200 kB styck; fem bilder laddas på samma sida.

Saknas en fil göms `img` av sitt `onerror` och rutan visar "Bilden kommer hit"
i stället för en trasig bild.

Nedre femtedelen täcks av bildtexten. Lägg inget viktigt där.
