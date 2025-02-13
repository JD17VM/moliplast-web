const dataPaginas = {
    data: [
        { 
            nombre: "Inicio", 
            enlace: "/"
        },
        { 
            nombre: "Nosotros", 
            enlace: "/nosotros"
        },
        { 
            nombre: "Productos", 
            enlace: "/productos",
            subsecciones: [
                { nombre: "Producto 1", enlace: "/productos/Producto 1" },
                { nombre: "Producto 2", enlace: "/productos/Producto 2" },
            ] 
        },
        { 
            nombre: "Servicios", 
            enlace: "/servicios",
        },
        { 
            nombre: "Catálogos", 
            enlace: "/catalogos"
        },
        { 
            nombre: "Contacto", 
            enlace: "/contacto"
        }
        
    ]
}

export default dataPaginas;