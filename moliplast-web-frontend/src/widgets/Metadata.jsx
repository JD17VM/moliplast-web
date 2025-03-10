import React from 'react';

const MetaData = ({
    title = "Moliplast", 
    description = "Moliplast S.R.L.: Expertos en sistemas de riego tecnificado, tubos PVC/PEAD, tanques y biodigestores. Productos de alta calidad y atención personalizada en Arequipa, Pedregal y La Joya.",
    ogTitle = "Moliplast S.R.L",
    ogUrl = "https://moliplast.com",
    ogImage = "URL_DE_TU_IMAGEN_DESTACADA",
    robots = "index, follow",
    canonical = "https://moliplast.com",
    icon = "/icono_moliplast.ico"
}) => {
  return (
    <>
      <title>{title}</title> {/* Navegadores y motores de búsqueda. */}
      <meta name="description" content={description}/>
      {/*  og - Redes sociales y plataformas Open Graph. */}
      <meta property="og:title" content={ogTitle} /> {/* Redes sociales y plataformas Open Graph. */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      {/* <meta property="og:image" content={ogImage} /> */}

      <meta name="robots" content={robots} /> {/* indexar y seguir la pagina */}
      <link rel="canonical" href={canonical} />
      {/*  
        El canonical es una herramienta fundamental para evitar problemas de contenido duplicado causados por parámetros extra en las URLs.
        Permite indicar a los motores de búsqueda cuál es la versión preferida de una página, consolidando las señales de clasificación y mejorando el SEO. 
      */}
      <link rel="icon" type="image/x-icon" href={icon} />
      <html lang="es" />
    </>
  );
};

export default MetaData;