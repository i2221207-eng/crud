# CRUD de Productos con Express.js, Node.js y MySQL

Esta aplicación es un CRUD (Create, Read, Update, Delete) completo para gestionar productos organizados por categorías, con soporte para múltiples imágenes por producto.

## Estructura de la Base de Datos

La base de datos consta de 3 tablas principales:

- **categorias**: Almacena las categorías de productos
- **productos**: Almacena la información de los productos, cada uno asociado a una categoría
- **imagenes_productos**: Almacena las imágenes asociadas a cada producto

## Características

- Gestión completa de categorías (crear, leer, actualizar, eliminar)
- Gestión completa de productos (crear, leer, actualizar, eliminar)
- Subida y gestión de múltiples imágenes por producto
- Interfaz visual intuitiva con Bootstrap
- API RESTful para todas las operaciones
- Visualización de productos por categoría

## Requisitos Previos

- Node.js (v12 o superior)
- MySQL (v5.7 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clonar el repositorio o descargar los archivos

2. Instalar las dependencias:
   ```
   npm install
   ```

3. Crear un archivo `.env` en la raíz del proyecto con la siguiente configuración:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=crud_db
   ```

4. Crear la base de datos y las tablas necesarias:
   - Puedes usar el archivo `database.sql` incluido en el proyecto para crear la estructura de la base de datos
   - Ejecuta el script SQL en tu servidor MySQL:
     ```
     mysql -u tu_usuario -p < database.sql
     ```

5. Crear la carpeta para almacenar las imágenes subidas:
   ```
   mkdir -p src/public/uploads
   ```

## Ejecución

1. Para iniciar el servidor en modo desarrollo (con recarga automática):
   ```
   npm run dev
   ```

2. Para iniciar el servidor en modo producción:
   ```
   npm start
   ```

3. Accede a la aplicación en tu navegador:
   ```
   http://localhost:3000
   ```

## Estructura del Proyecto

```
├── src/
│   ├── config/         # Configuración de la base de datos
│   ├── controllers/    # Controladores para la lógica de negocio
│   ├── models/         # Modelos para interactuar con la base de datos
│   ├── public/         # Archivos estáticos (CSS, JS, imágenes)
│   │   ├── css/        # Hojas de estilo
│   │   ├── js/         # Scripts del cliente
│   │   └── uploads/    # Imágenes subidas
│   ├── routes/         # Definición de rutas API
│   ├── views/          # Vistas HTML
│   └── app.js          # Configuración de la aplicación Express
├── .env                # Variables de entorno
├── database.sql        # Script SQL para crear la base de datos
├── index.js            # Punto de entrada de la aplicación
└── package.json        # Dependencias y scripts
```

## API Endpoints

### Categorías

- `GET /api/categorias` - Obtener todas las categorías
- `GET /api/categorias/:id` - Obtener una categoría por ID
- `POST /api/categorias` - Crear una nueva categoría
- `PUT /api/categorias/:id` - Actualizar una categoría existente
- `DELETE /api/categorias/:id` - Eliminar una categoría

### Productos

- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/categoria/:id` - Obtener productos por categoría
- `GET /api/productos/:id` - Obtener un producto por ID
- `POST /api/productos` - Crear un nuevo producto
- `PUT /api/productos/:id` - Actualizar un producto existente
- `DELETE /api/productos/:id` - Eliminar un producto

### Imágenes

- `GET /api/imagenes/producto/:id` - Obtener imágenes de un producto
- `POST /api/imagenes/producto/:id` - Subir una imagen para un producto
- `DELETE /api/imagenes/:id` - Eliminar una imagen

## Uso de la Interfaz

1. **Navegación por Categorías**:
   - En el panel izquierdo se muestran todas las categorías disponibles
   - Haz clic en una categoría para ver los productos asociados

2. **Gestión de Categorías**:
   - Haz clic en "Nueva Categoría" en la barra de navegación
   - Completa el formulario y guarda

3. **Gestión de Productos**:
   - Haz clic en "Nuevo Producto" en la barra de navegación
   - Completa el formulario, selecciona una categoría y guarda

4. **Ver Detalles de Producto**:
   - Haz clic en "Ver Detalle" en la tarjeta de un producto
   - Verás la información completa y las imágenes asociadas

5. **Gestión de Imágenes**:
   - En la vista de detalle del producto, usa el formulario para subir nuevas imágenes
   - Las imágenes se mostrarán en un carrusel

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Manejo de Archivos**: Multer
- **Variables de Entorno**: dotenv

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.