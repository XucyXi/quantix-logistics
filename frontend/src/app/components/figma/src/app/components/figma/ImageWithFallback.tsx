import React, {useState} from 'react';

// Käytetään Base64-muotoista SVG:tä erillisen kuvatiedoston sijaan.
// SYY: Jos nettiyhteys pätkii tai kuvaserveri on alhaalla, emme halua, että
// myöskään virhekuvan lataaminen epäonnistuu. Tämä on leivottu suoraan koodiin
// ja näkyy aina välittömästi.
const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

/**
 * Kuva-komponentti, joka korvaa rikkoutuneet tai puuttuvat kuvat tyylikkäällä virheikonilla.
 * * Estää selaimen omien (usein rumien) rikkinäisten kuvakkeiden näkymisen ja pitää
 * käyttöliittymän ehyenä, jos esim. backendistä tulee vanhentunut kuva-URL.
 * Ottaa vastaan kaikki standardit HTML-kuvan ominaisuudet (props).
 */
export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  // Erotellaan tietyt propsit, jotta voimme hallita miten ne viedään varakuvaan.
  // ...rest sisältää loput (esim. width, height, loading="lazy"), jotka haluamme säilyttää.
  const {src, alt, style, className, ...rest} = props;

  return didError ? (
    // Kääritään virhekuva diviin, joka yrittää periä alkuperäisen kuvan luokat ja tyylit.
    // SYY: Näin estetään sivun asettelun (layoutin) "hyppiminen", kun kuva korvautuu
    // erikokoisella virheikonilla.
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          // Tallennetaan alkuperäinen URL DOMiin debuggausta varten.
          // Näin kehittäjä näkee suoraan selaimen Inspectorista, mikä URL tarkalleen epäonnistui.
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}
