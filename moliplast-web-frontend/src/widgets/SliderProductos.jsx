import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';

import styled from 'styled-components'

import { SoloProductosImportantes } from './ProductosImportantes';
import { ContenedorSeccion } from '../Inicio';

import imageHelper from '../utils/imageHelper.js'

const BASE_URL_API = "http://127.0.0.1:8000";

const StyledCarousel = styled(Carousel)`
    width: 100%;

    >div{
        height:100%;

        >div{
            height:100%;
        }

        img{
          object-fit: cover;
          height: 100%;
        }
    } 

    a[class^="carousel-control-"]{
      width: 5%;
      
      > span{
        color: white;
        font-weight:1000;
        filter:none !important;
        
        padding: 2rem;
        text-shadow: 2px 2px 4px #CE5937;
      }

      > span.visually-hidden{
        display:none;
      }
    }

    div.carousel-indicators{
      display:none;
    }

    div.carousel-inner{
      overflow:visible;
    }

    .carousel-caption{
        display:none;
    }

    @media only screen and (max-width: 1000px) {
      aspect-ratio: 2/1;
      
      a > span {
          padding: 0 !important; /* ¡Importante! Usar con precaución */
      }

      >div{

        img{
          object-fit: cover;
          height: 100%;
        }
    } 
    }

`



function SliderProductos() {

  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      loadProductosDestacados();
  }, []);

  const loadProductosDestacados = async () => {
      setLoading(true);
      try {
          const response = await fetch(`${BASE_URL_API}/api/productos-destacados`);
          
          if (response.status === 404) {
              console.log('No hay productos destacados disponibles');
              setProductosDestacados([]);
              setLoading(false);
              return;
          }
          
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          setProductosDestacados(data);
      } catch (error) {
          console.error('Error fetching data:', error);
          setError('Error al cargar los productos destacados. Por favor, intenta nuevamente.');
          setProductosDestacados([]);
      } finally {
          setLoading(false);
      }
  };

  // Función para construir la URL completa de la imagen
  const getFullImageUrl = (path) => {
      if (!path) return '';
      return path.startsWith('http') ? path : `${BASE_URL_API}${path}`;
  };  
  

  const data = productosDestacados;

  let data_completa = data;

  if(data.length % 4 == 0){
    data_completa = [...data]
  }else if ((data.length * 2) % 4 == 0){
    data_completa = [...data, ...data];
  }else if ((data.length * 3) % 4 == 0){
    data_completa = [...data, ...data, ...data];
  }else{
    data_completa = [...data, ...data, ...data, ...data];
  }
  console.log(data_completa)

  const gruposDeCuatro = [];
  for (let i = 0; i < data_completa.length; i += 4) {
    gruposDeCuatro.push(data_completa.slice(i, i + 4));
  }

  console.log(gruposDeCuatro);

  return (

  <ContenedorSeccion titulo="Productos" color_fondo="negro">
      <StyledCarousel data-bs-theme="dark">
        {gruposDeCuatro.map((grupo, index) => (
          <Carousel.Item key={index} interval={3000}>
              <SoloProductosImportantes key={index} data={grupo} />
          </Carousel.Item>
        ))}
      </StyledCarousel>
  </ContenedorSeccion>
  );
}

export default SliderProductos;