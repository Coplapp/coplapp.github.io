# Skärmbilder till swajparen på startsidan

JPEG, skalade till 840 px bredd. Namnen står i `index.html` och `en/index.html`.

| Fil | Skärm |
|---|---|
| `hem.jpg` | Startsidan |
| `kalender.jpg` | Vår kalender |
| `todo.jpg` | To-do |
| `mat.jpg` | Matplanering |
| `familj.jpg` | Familj |
| `traning.jpg` | Träning |
| `ekonomi.jpg` | Ekonomi |
| `overens.jpg` | Överenskommelser |
| `anteckningar.jpg` | Anteckningar |
| `paminn.jpg` | Påminn mig |
| `uppskatta.jpg` | Uppskatta |
| `relation.jpg` | Vår relation |

**Saknas: Chatt och Inköpslistor.** De två skärmarna ligger inte i swajparen
eftersom en tom ruta på en publik sajt är sämre än ingen ruta. Lägg in
`chatt.jpg` och `inkop.jpg` och säg till, så läggs de tillbaka.

## Att lägga till eller byta en bild

Ta skärmbilden i telefonen och skala den:

```
ffmpeg -y -i INBILD.jpg -vf "scale=840:-2" -q:v 4 landing/assets/screens/NAMN.jpg
```

Rutan är 280 × 580 och beskär med `object-fit: cover`. Håll filerna under
~150 kB - bara den första laddas direkt, resten när besökaren swajpar dit.

Nedre femtedelen täcks av bildtexten. Lägg inget viktigt där.
