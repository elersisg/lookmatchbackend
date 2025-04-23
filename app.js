require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const swaggerUi    = require('swagger-ui-express');
const basicAuth    = require('express-basic-auth');
const SwaggerJsdoc = require('swagger-jsdoc');
const session      = require('express-session');
const fileUpload   = require('express-fileupload');

// Rutas
const usuarioRoutes      = require('./src/routes/usuario.routes.js');
const prendaRoutes       = require('./src/routes/prenda.routes.js');
const categoriaRoutes    = require('./src/routes/categoria.routes.js');
const subcategoriaRoutes = require('./src/routes/subcategoria.routes.js');
const colorRoutes        = require('./src/routes/color.routes.js');
const outfitRoutes       = require('./src/routes/outfit.routes.js');
const stackRoutes        = require('./src/routes/stack.routes.js');

const app = express();

// Configurar sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Body parsers y logs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: './uploads/' }));
app.use(morgan('dev'));

// 🛡️ Swagger Auth
app.use(['/api-docs', '/swagger.json'], basicAuth({
  users: {
    [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD
  },
  challenge: true,
  realm: 'Admin Area'
}));

// 📚 Swagger Setup
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
    security: [{ BearerAuth: [] }],
    servers: [
      {
        url: `${process.env.BASE_URL}/api`,
        description: 'Servidor principal'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = SwaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 📍 Endpoint raíz
app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API de Lookmatch activa — documentación en /api-docs'
  });
});

app.get('/', (req, res) => res.redirect('/api'));

// 🚏 Rutas reales
app.use('/api/usuario',      usuarioRoutes);
app.use('/api/prenda',       prendaRoutes);
app.use('/api/categoria',    categoriaRoutes);
app.use('/api/subcategoria', subcategoriaRoutes);
app.use('/api/color',        colorRoutes);
app.use('/api/outfits',      outfitRoutes);
app.use('/api/stacks',       stackRoutes);

app.get('/api-docs-test', (req, res) => {
  res.send('🧪 API Docs funciona');
});

// ❌ Ruta no encontrada
app.use((req, res) => {
  console.error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ❗ Error handler
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
