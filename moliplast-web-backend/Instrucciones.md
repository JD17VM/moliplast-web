## **Despliegue de la Aplicación en cPanel**

### Configuración de la Base de Datos MySQL

1. **Acceso a la Administración de Bases de Datos:** Navegue a la sección "Bases de datos MySQL" dentro del panel de control de cPanel.
2. **Creación de la Base de Datos:** Proceda a crear una nueva base de datos, siguiendo la convención de nomenclatura `moliplas_<nombre_bd>`.
3. **Gestión de Usuarios MySQL:** Diríjase a la sección "Usuarios MySQL" y cree un nuevo usuario con las siguientes especificaciones:
    - Nombre de usuario `moliplas_<nombre_usuario>`
    - Contraseña: `moliplas_<nombre_usuario>`
4. **Asignación de Privilegios:** Vincule el usuario recién creado a la base de datos correspondiente, otorgándole los privilegios necesarios para su funcionamiento.
    - Usuario:  `moliplas_<nombre_usuario>`
    - Base de datos: `moliplas_<nombre_bd>`


### Configuración de Acceso Remoto MySQL

1. **Habilitación de Acceso Remoto:** En la sección de MySQL remoto, configure el acceso remoto especificando la dirección IP de la máquina desde la cual se conectará (puede obtener su IP en [vermiip](https://vermiip.es).
2. **Acceso Universal (Opcional):** Si desea permitir el acceso desde cualquier dirección IP, utilice el comodín `%`


### Despliegue del Backend Laravel
1. **Creación del Directorio del Backend:** Cree un directorio dedicado para alojar los archivos del backend (Ej. `/api`).
2. **Carga del Proyecto Laravel:** Cargue los archivos del proyecto Laravel en el directorio creado.
3. **Despliegue del Contenido Público:** Mueva el contenido de la carpeta public del proyecto Laravel al directorio raíz del backend (Ej. `/api`).
4. **Verificación de la Funcionalidad:** Realice pruebas para asegurar que las solicitudes al backend se procesen correctamente (Ej. `/api/api/...`).

### Despliegue del Frontend React

1. **Generación del Build de Producción:** Ejecute el comando `npm run build` para generar la versión de producción del frontend.
2. **Compresión de Archivos:** Comprima el contenido de la carpeta `dist` en un archivo ZIP (`dist.zip`).
3. **Carga en el Directorio Público:** Cargue el archivo `dist.zip` en el directorio `public_html/` de cPanel.