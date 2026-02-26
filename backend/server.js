const express = require(`express`);
const app = express();
const routesHandler = require(`../backend/routes/routesHandler`);

app.use(`/api/auth`,routesHandler);