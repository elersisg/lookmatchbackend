-Lookmatch Backend API
Este backend sirve como núcleo de la aplicación Lookmatch, una plataforma de gestión de outfits que permite a los usuarios registrar, organizar, y generar combinaciones de ropa personalizadas. Está construido sobre Node.js, Express y PostgreSQL.

-Características principales
Autenticación segura con JWT.

CRUD de prendas, categorías, subcategorías y colores.

Generador inteligente de outfits aleatorios con lógica de estilo y color.

Asociación de prendas a stacks (conjuntos) y favoritos.

Upload de imágenes a Cloudinary.

Swagger UI para documentación de endpoints.

- Estructura del proyecto
```
lookmatch-backend/
|-- app.js                # Configuración principal de Express
|--server.js             # Punto de entrada
|-- .env                  # Variables de entorno
|-- /src
│   |-- controllers       # Lógica para manejar peticiones HTTP
│   |-- routes            # Rutas agrupadas por entidad
│   |-- models            # Acceso a la base de datos y lógica de negocio
│   |-- services          # Servicios reutilizables (negocio, validaciones)
│   |-- config            # Configuración de base de datos, JWT, etc.
│   L-- middlewares       # Autenticación y manejo de errores

```
- Tecnologías utilizadas
Node.js – Entorno de ejecución.

Express – Framework para construir la API.

PostgreSQL – Base de datos relacional.

pg – Cliente para PostgreSQL.

Cloudinary – Almacenamiento y procesamiento de imágenes.

Swagger – Documentación de API.

jsonwebtoken – Manejo de autenticación con JWT.

express-fileupload – Manejo de archivos.

express-session – Soporte para sesiones.

dotenv – Variables de entorno.

morgan – Logging HTTP.

-nstalación
Clona el repositorio.

Ejecuta npm install.

Crea un archivo .env con tus variables.

Ejecuta el servidor:

bash
```
npm run dev
```
-Core funcional: Generador de outfits
La funcionalidad clave de la app permite al usuario generar un outfit aleatorio combinando:

Prenda superior

Prenda inferior

Zapatos

Opcionalmente se filtra por color y estilo. Esta lógica está contenida en OutfitService.generateRandomOutfit.

-Despliegue
El backend está desplegado en Render.com.

Keep-alive automático mediante pings programados cada 15 minutos.

