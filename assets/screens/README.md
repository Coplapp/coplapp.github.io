# Skärmbilder till swajparen på startsidan

Fjorton filer - en per modul plus startsidan. Namnen står i `index.html`:

| Fil | Skärm |
|---|---|
| `hem.png` | Startsidan |
| `chatt.png` | Chatt |
| `kalender.png` | Vår kalender |
| `todo.png` | To-do |
| `inkop.png` | Inköpslistor |
| `mat.png` | Matplanering |
| `familj.png` | Familj |
| `traning.png` | Träning |
| `ekonomi.png` | Ekonomi |
| `overens.png` | Överenskommelser |
| `anteckningar.png` | Anteckningar |
| `paminn.png` | Påminn mig |
| `uppskatta.png` | Uppskatta |
| `relation.png` | Vår relation |

Rutan är 280 × 580 och bilden beskärs med `object-fit: cover`, så ett
telefonformat funkar rakt av - samma bilder som App Store-pipelinen tar fram.

**Håll dem under ~150 kB styck.** Fjorton bilder på samma sida blir tungt annars.
Bara den första laddas direkt; resten laddas när de behövs.

Saknas en fil göms `img` av sitt `onerror` och rutan visar "Bilden kommer hit"
i stället för en trasig bild. Du kan alltså lägga in dem en i taget.

Nedre femtedelen täcks av bildtexten. Lägg inget viktigt där.
