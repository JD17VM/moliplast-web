# Usamos PHP 8.2 con Apache (Servidor web incluido)
FROM php:8.2-apache

# 1. Instalar dependencias del sistema (Librerías para que funcione zip, imágenes, etc.)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar extensiones de PHP que Laravel necesita sí o sí
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# 3. Activar "mod_rewrite" de Apache (Vital para las rutas de Laravel)
RUN a2enmod rewrite

# 4. Cambiar la carpeta raíz de Apache para que apunte a la carpeta "public" de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# 5. Instalar Composer (El gestor de paquetes de PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Definir carpeta de trabajo
WORKDIR /var/www/html

# Nota: No copiamos el código aquí (COPY . .), lo haremos con volúmenes en el docker-compose
# para que los cambios que hagas en tu Windows se vean al instante.