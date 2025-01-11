import Carousel from 'react-bootstrap/Carousel';

import styled from 'styled-components'

const StyledCarousel = styled(Carousel)`
    width: 100%;
    aspect-ratio: 3/1;

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

    a {
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



function SliderImgs({ images }) {
  return (
    <StyledCarousel data-bs-theme="dark">
      {images.map((imagen, index) => (
        <Carousel.Item interval={3000} key={index}>
          <img
            className="d-block w-100"
            src={imagen.enlace_imagen}
            alt={imagen.name}
          />
          {/*<Carousel.Caption>
            <h5>First slide label</h5>
            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
      </Carousel.Caption>*/}
        </Carousel.Item>
      ))}
    </StyledCarousel>
  );
}

export default SliderImgs;