import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Definir la animación
const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-235px * var(--cantidad_de_imagenes_de_marca)));
  }
`;

export const CarouselMarcas = styled.div`
  --cantidad_de_imagenes_de_marca: 1; /* Puedes cambiar este valor dinámicamente */
  padding: 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .contenedor_slider {
    width: 95vw;
    overflow: hidden;
    height: auto;

    .slider-track {
      display: flex;
      animation: ${scroll} 40s linear infinite;
      width: calc(235px * (var(--cantidad_de_imagenes_de_marca) * 3));
    }

    .slide {
      width: 235px;
      height: 115px;
      display: flex;
      justify-content: center;

      img {
        height: 100%;
        border-radius: 10px;
      }
    }
  }
`;

/*
.contenedor_slider > .slider-track{
    display: flex;
    animation: scroll 40s linear infinite;
    width: calc(235px * (var(--cantidad_de_imagenes_de_marca)*3));
}

@keyframes scroll {
    0%{
        transform:translateX(0);
    }
    100%{
        transform:translateX(calc(-235px * var(--cantidad_de_imagenes_de_marca)));
    }
}
*/

const CarruselImgs = (props) => {

    let data = props.data

    let lista_triplicada_para_slider = []
    for (let i = 1; i <= 3; i++) {
        lista_triplicada_para_slider = lista_triplicada_para_slider.concat(data);
    }

    const [totalSlides, setTotalSlides] = useState(0); 

    useEffect(() => {
        setTotalSlides(data.length);
      }, [data]);


    return (
        <CarouselMarcas className="contenedor_marcas" style={{ '--cantidad_de_imagenes_de_marca': totalSlides }}>
            <div className="contenedor_slider">
                <div className="slider-track" id="sliderTrack">
                    {lista_triplicada_para_slider.map((imagen,index) => (
                        <div key={index} className="slide"><img
                        src={imagen.enlace}
                        alt=""/></div>
                    ))}
                </div>
            </div>
        </CarouselMarcas>
    )
}

export default CarruselImgs;