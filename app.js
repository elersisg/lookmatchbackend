require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const SwaggerJsdoc = require('swagger-jsdoc');
const session = require('express-session');
const { pool } = require('./src/config/dbConfig');
const fileUpload = require('express-fileupload');

// Importar rutas de API
const usuarioRoutes = require('./src/routes/usuario.routes.js');
const prendaRoutes  = require('./src/routes/prenda.routes.js');
const categoriaRoutes  = require('./src/routes/categoria.routes.js');
const subcategoriaRoutes = require('./src/routes/subcategoria.routes.js');
const colorRoutes = require('./src/routes/color.routes.js');
const outfitRoutes = require('./src/routes/outfit.routes.js');
const stackRoutes = require('./src/routes/stack.routes.js');
const { Http2ServerRequest } = require('http2');


const app = express();

// 1) Servir los archivos estáticos de Flutter Web
//    Ajusta la ruta según dónde tengas tu build/web de Flutter
const flutterWebPath = path.resolve('Agregar la ruta correspondiente'); // Para construir la version web del proyecto correr <Flutter build web> y colocar el path de la carpeta <web>  
app.use(express.static(flutterWebPath));

// 2) Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// 3) CORS
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'; 
app.use(cors({
  origin: allowedOrigin, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4) Middlewares de parsing y logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : './uploads/'
}));
app.use(morgan ('dev'));

//Seguridad de Swagger 
app.use(
  ['/api-docs','/swagger.json'],
  basicAuth({
    users: {
      [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD
    },
    challenge: true,
    realm: 'Admin area'
  })
);

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Lookmatch',
      version: '1.0.0',
      description: 'API para gestionar outfits.',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};
const swaggerDocs = SwaggerJsdoc(swaggerOptions);

// 5) Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// 7) Fallback para SPA: cualquier GET que no empiece con /api devuelve index.html
app.use(express.static(flutterWebPath));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(flutterWebPath, 'index.html'));
});

// Registro de rutas
app.use('/api/usuario', usuarioRoutes);
app.use('/api/prenda', prendaRoutes); 
app.use('/api/categoria', categoriaRoutes);
app.use('/api/subcategoria', subcategoriaRoutes);
app.use('/api/color', colorRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/stacks', stackRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  console.error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 9) Middleware global de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;