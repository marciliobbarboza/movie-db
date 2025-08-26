const express = require('express');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');

const app = express();
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));
app.use('/api', routes); // <- aqui

module.exports = app;
