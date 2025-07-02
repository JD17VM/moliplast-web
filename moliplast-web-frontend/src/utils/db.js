import Dexie from 'dexie';

// Creamos la instancia de la base de datos
export const db = new Dexie('moliplastDatabase');

// Aumentamos la versión de la base de datos porque hemos cambiado su estructura.
// Esto es MUY IMPORTANTE. Si no cambias la versión, la nueva tabla no se creará.
db.version(2).stores({
  // Tabla para el "Índice Maestro". 
  // La clave primaria es el 'id' del producto.
  // Guardará objetos como { id: 123, id_categoria: 45 }
  productIndex: 'id', 

  // Tabla para guardar los productos completos (con nombre, precio, etc.).
  // 'id' es la clave primaria.
  // 'id_categoria' es un índice para poder borrar por categoría si es necesario.
  products: 'id, id_categoria',

  // Tabla para guardar la fecha de actualización de cada categoría.
  // 'id' de la categoría será la clave primaria.
  categoriesCache: 'id'
});
