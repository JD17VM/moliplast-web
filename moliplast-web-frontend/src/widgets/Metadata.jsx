import React from 'react';

const MetaData = ({
    title = "Moliplast", 
    description = "Moliplast S.R.L.: Expertos en sistemas de riego tecnificado, tubos PVC/PEAD, tanques y biodigestores. Productos de alta calidad y atención personalizada en Arequipa, Pedregal y La Joya.",
    ogImage = "URL_DE_TU_IMAGEN_DESTACADA",
    robots = "index, follow",
    canonical = "",
    icon = "/icono_moliplast.ico",
    icon_dark = "/icono_moliplast_dark.ico",
    icon_light = "/icono_moliplast.ico"
}) => {
  const baseUrl = "https://www.moliplast.com";
  return (
    <>
      <title>{title}</title> {/* Navegadores y motores de búsqueda. */}
      <meta name="description" content={description}/>
      {/*  og - Redes sociales y plataformas Open Graph. */}
      <meta property="og:title" content={title} /> {/* Redes sociales y plataformas Open Graph. */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${baseUrl}${canonical}`} />
      {/* <meta property="og:image" content={ogImage} /> */}
      {/* indexar y seguir la pagina */}
      <meta name="robots" content={robots} /> 
      <link rel="canonical" href={`${baseUrl}${canonical}`} />
      {/*  
        El canonical es una herramienta fundamental para evitar problemas de contenido duplicado causados por parámetros extra en las URLs.
        Permite indicar a los motores de búsqueda cuál es la versión preferida de una página, consolidando las señales de clasificación y mejorando el SEO. 
      */}
      <link rel="icon" type="image/x-icon" href={icon}/>
      <link rel="icon" type="image/x-icon" href={icon_dark} media="(prefers-color-scheme: dark)"/>
      <link rel="icon" type="image/x-icon" href={icon_light} media="(prefers-color-scheme: light)"/>
    </>
  );
};

export default MetaData;