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

## **Integración de Generación de Códigos QR con Simple QrCode**

### **1. Verificación de Extensiones PHP en el Hosting**

Crucial asegurar que el entorno de hosting cumpla con los requisitos necesarios.

* **Extensión GD:**
    * GD es una librería de gráficos esencial para la manipulación de imágenes en PHP.
    * Para verificar su instalación, ejecute el comando `php -m` en la terminal del host.
    * Busque `gd` en la lista de extensiones cargadas.
    * En caso de no estar presente, consulte la documentación de su proveedor de hosting para instrucciones sobre cómo habilitarla.
    * **Verificar la version:** `php -i | grep -i "gd version"`
* **Extensión Imagick:**
    * Imagick proporciona funcionalidades avanzadas de manipulación de imágenes a través de la librería ImageMagick.
    * Similarmente, ejecute `php -m` en la terminal del host y busque `imagick`.
    * Si no está instalada, siga las instrucciones de su proveedor para su instalación.
    * **Verificar la version:** `php -i | grep -i "imagick version"`

### **2. Configuración de Imagick en Entorno Local**


* **Verificación Inicial:** Ejecute `php -m` para confirmar la ausencia de `imagick`.
* **Instalación de ImageMagick:**
    * Descargue la última versión de ImageMagick desde [https://imagemagick.org/script/download.php](https://imagemagick.org/script/download.php).
    * Siga las instrucciones de instalación proporcionadas.
* **Instalación de la Extensión Imagick para PHP:**
    * Descargue la versión de la extensión Imagick que coincida con su versión de PHP desde [https://pecl.php.net/package/imagick](https://pecl.php.net/package/imagick) o directamente desde [https://windows.php.net/downloads/pecl/releases/imagick/](https://windows.php.net/downloads/pecl/releases/imagick/).
    * Extraiga el archivo ZIP descargado.
    * Copie el archivo `php_imagick.dll` a la carpeta `ext` de su instalación de PHP (por ejemplo, `C:\php\ext`).
    * Copie las DLLs de ImageMagick al directorio principal de la instalación de PHP (donde se encuentra el ejecutable php.exe)
    * Edite el archivo `php.ini` y agregue la línea `extension=imagick`.

    *Nota:** *Aunque algunos usuarios han reportado éxito colocando las DLLs de ImageMagick en el directorio `apache/bin/`, esta no es la práctica recomendada. La ubicación correcta para estas DLLs es el directorio principal de la instalación de PHP. El uso de apache/bin puede generar comportamientos inesperados y no se garantiza su funcionamiento en todas las configuraciones.*

* **Reinicio del Servidor:** Reinicie su servidor web (Apache, etc.) para que los cambios surtan efecto.

### **3. Instalación de Simple QrCode vía Composer**

Finalmente, instale la librería `simplesoftwareio/simple-qrcode` utilizando Composer:

```bash
composer require simplesoftwareio/simple-qrcode
```




