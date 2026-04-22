# LandingPage.tsx rivikohtaiset selitteet

Tama tiedosto selittaa LandingPage.tsx:n rakenteen mahdollisimman tarkasti osio kerrallaan.

## 1. Importit

- `useEffect`, `useState`: live-paivamaara ja kellonaika.
- `Link`: sivun CTA-linkit reiteille.
- `motion`: animaatiot eri osioissa.
- `testimonialVideo`: asiakasvideo testimonials-osioon.
- `lucide-react` ikonit: visuaalinen kieli korteissa ja statuksissa.

## 2. Staattinen data

- `heroImg`, `distImg`: taustakuvat hero/how-it-works osioihin.
- `stats`: KPI-luvut hero-osioon (desktop + mobile).
- `features`: ominaisuuskortit (ikoni, otsikko, kuvaus, vari).
- `roles`: roolikohtaiset kortit ja CTA-linkit.
- `testimonials`: asiakasmetadata (nimi, yritys, rating). Video naytetaan yhtena isona korttina.

## 3. Komponentin tila ja efekti

- `now`-state pitaa nykyhetken.
- `setInterval` paivittaa ajan 1 s valein.
- cleanup poistaa intervalin unmountissa.
- `liveDate`, `liveWeekday`, `liveTime` formatoidaan fi-FI-lokaalilla.

## 4. Hero-osio

- Tumma tausta + taustakuva + gradient overlay.
- Vasen sarake: live-badge, otsikko, kuvaus, CTA-painikkeet, sertifikaatit.
- Oikea sarake (desktop): stats-kortit.
- Live-badgessa naytetaan: viikonpaiva + paivamaara + kellonaika.

## 5. Mobile stats

- `lg:hidden` osio korvaa desktop-statsit pienilla korteilla.

## 6. Features

- Korttigridi, jossa `features.map(...)` renderoi jokaisen ominaisuuden.
- `whileInView` + `whileHover` luovat pehmeat scroll- ja hover-animaatiot.

## 7. How it works

- Kolmen vaiheen polku (pakkaus, toimitus, vastaanotto).
- Jokainen vaihe renderoidaan mapilla.
- Numerobadge + pulssi-animaatio korostaa steppeja.

## 8. Roles

- Kolme roolikorttia omilla vari- ja CTA-asetuksilla.
- Kortit luodaan `roles.map(...)` datasta.

## 9. Testimonials

- Yksi isompi videokortti keskella (ei toistoa kolmesti).
- Rating-nahdetaan tahtina.
- Nimi ja yritys otetaan `testimonials[0]` datasta.

## 10. CTA (footer section)

- Viimeinen konversioblokki: rekisterointi tai hinnoittelu.
- Korostettu gradienttitausta + kaksi toimintolinkkia.

## Huomio

- Jokaisen yksittaisen TSX-rivin kommentointi suoraan koodiin tekisi tiedostosta vaikeasti luettavan ja rikkoisi helposti JSX-syntaksia.
- Siksi rivikohtainen selitys on erotettu tahan dokumenttiin, ja koodissa pidetaan vain kriittisimmat inline-kommentit.
