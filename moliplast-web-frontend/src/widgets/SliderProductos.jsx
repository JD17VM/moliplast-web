import Carousel from 'react-bootstrap/Carousel';

import styled from 'styled-components'

import { SoloProductosImportantes } from './ProductosImportantes';
import { ContenedorSeccion } from '../Inicio';

import imageHelper from '../utils/imageHelper.js'

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

  
  const data =  [
    { nombre: 'Item 1', img: imageHelper.Macetas, id:1 },
    { nombre: 'Item 2', img: imageHelper.Tachos, id:2 },
    { nombre: 'Item 3', img: imageHelper.Agri, id:3 },
    { nombre: 'Item 4', img: imageHelper.Tapers, id:4 },
    { nombre: 'Item 5', img: imageHelper.Tanques, id:5 },
    { nombre: 'Item 6', img: imageHelper.Tubos, id:6 },
  ]

  let data_completa = [...data];

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