# UMNA ceník 2026

Listovací ceník Ultra Marine Europe. Šest původních stran, aktivní weby, e-maily a telefony, hledání, náhledy, přiblížení a stažení původního PDF. Bez externích knihoven a sledování návštěvníků.

## Spuštění

Statický web: publikujte obsah této složky přes GitHub Pages (větev `main`, složka `/ (root)`). Lokálně použijte `python -m http.server 8080`.

## Aktualizace

Nahraďte `UMNA-cenik-2026.pdf`, exportujte strany pomocí Poppler `pdftoppm -jpeg -r 150 -jpegopt quality=90 UMNA-cenik-2026.pdf page` a spusťte `python prepare.py` (vyžaduje pdfplumber). Při změně počtu stran upravte názvy sekcí v app.js a údaj v index.html.

PDF ke stažení je původní nezměněný soubor. Aktivní kontaktní odkazy jsou doplněné ve webovém prohlížeči ceníku.

Obsah ceníku © Ultra Marine Europe. Repozitář neuděluje licenci k obchodním značkám ani obsahu dokumentu.
