import Carousel from 'react-bootstrap/Carousel';

import styled from 'styled-components'

import { SoloProductosImportantes } from './ProductosImportantes';
import { ContenedorSeccion } from '../Inicio';

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
  return (
    

  <ContenedorSeccion titulo="Productos" color_fondo="negro">
      <StyledCarousel data-bs-theme="dark">
          <Carousel.Item interval={3000}>
            <SoloProductosImportantes/>
          </Carousel.Item>

          <Carousel.Item interval={3000}>
            <SoloProductosImportantes/>
          </Carousel.Item>

          <Carousel.Item interval={3000}>
            <SoloProductosImportantes/>
          </Carousel.Item>
          
      </StyledCarousel>
  </ContenedorSeccion>
  );
}

export default SliderProductos;