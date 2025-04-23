require('dotenv').config(); // Cargar variables de entorno
const express      = require('express');
const path         = require('path');
const cors         = require('cors');
const morgan       = require('morgan');
const swaggerUi    = require('swagger-ui-express');
const basicAuth    = require('express-basic-auth');           // <–– Importar express-basic-auth
const SwaggerJsdoc = require('swagger-jsdoc');
const session      = require('express-session');
const fileUpload   = require('express-fileupload');
const { pool }     = require('./src/config/dbConfig');

// Importar rutas de API
const usuarioRoutes      = require('./src/routes/usuario.routes.js');
const prendaRoutes       = require('./src/routes/prenda.routes.js');
const categoriaRoutes    = require('./src/routes/categoria.routes.js');
const subcategoriaRoutes = require('./src/routes/subcategoria.routes.js');
const colorRoutes        = require('./src/routes/color.routes.js');
const outfitRoutes       = require('./src/routes/outfit.routes.js');
const stackRoutes        = require('./src/routes/stack.routes.js');

const app = express();




// 2) Configuración de sesión (MemoryStore no recomendado en producción)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// 3) CORS 
const rawOrigins = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// 4) Parsers y logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: './uploads/' }));
app.use(morgan('dev'));

// 5) Protege Swagger UI y JSON con HTTP Basic Auth
app.use(
  ['/api-docs', '/swagger.json'],
  basicAuth({
    users: {
      [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD  // <–– Usa SWAGGER_PASS, no SWAGGER_PASSWORD
    },
    challenge: true,
    realm: 'Admin Area'
  })
);

// 6) Configuración de Swagger
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Lookmatch',
      version: '1.0.0',
      description: 'API para gestionar outfits.'
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
    security: [
      {
        BearerAuth: []
      }
    ],
    servers: [
      {
        url: `${BASE_URL}/api`,
        description: 'API Lookmatch'
      }
    ]
  },
  apis: ['./src/routes/*.js'],
};


// Handler GET /api para devolver un status en la raíz de la API
app.get('/api', (req, res) => {
  return res.json({
    status: 'OK',
    message: 'API de Lookmatch activa — documentación en /api-docs'
  });
});

app.get('/', (req, res) => {
  res.redirect('/api');
});


// 7) Rutas de API
app.use('/api/usuario', usuarioRoutes);
app.use('/api/prenda',  prendaRoutes);
app.use('/api/color',        colorRoutes);
app.use('/api/outfits',      outfitRoutes);
app.use('/api/stacks',       stackRoutes);
app.use('/api/subcategoria', subcategoriaRoutes);
app.use('/api/categoria',    categoriaRoutes);


// 9) 404 para rutas no encontradas
app.use((req, res) => {
  console.error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 10) Error handler global
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
