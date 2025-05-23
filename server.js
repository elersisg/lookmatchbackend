require('dotenv').config();
const chalk = require('chalk');
const app = require('./app.js');
const { pool } = require('./src/config/dbConfig.js');
const axios = require('axios');           // <–– usa axios

const PORT = process.env.PORT || 3000;

const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.set('port', PORT);


// Función con reintentos
const testConnection = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT NOW()');
      return true;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      console.log(chalk.yellow(`Reintentando conexión (${i + 1}/${retries})...`));
    }
  }
};

(async () => {
  try {
    await testConnection();
    console.log(chalk.green.bold('Conexión a PostgreSQL establecida'));

    app.listen(PORT, () => {
      console.log(chalk.green(`Servidor en ${BASE_URL}`));
      console.log(chalk.blue(`Swagger: ${BASE_URL}/api-docs`));
    });

    //KEEP ALIVE METHOD para que la conexion no de timeout cuando se despliegue 
    const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL || BASE_URL;

    setInterval(async () => {
      try {
        const res = await axios.get(KEEP_ALIVE_URL);
        console.log(chalk.gray(`Keepalive HTTP ping status: ${res.status}`));
      } catch (err) {
        console.error(chalk.red('Keepalive HTTP ping failed:'), err.message);
      }
    }, 15 * 60 * 1000); // cada 15 minutos

  } catch (error) {
    console.error(chalk.red.bold('Error crítico:'), error.message);
    console.log(chalk.yellow('Verifica:'));
    console.log('1. Variables de entorno (.env)');
    console.log('2. Whitelist de IPs en Neon');
    console.log('3. Estado del servicio: https://status.neon.tech');
    process.exit(1);
  }
})();
