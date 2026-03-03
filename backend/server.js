const express = require(`express`);
const routesHandler = require(`../backend/routes/routesHandler`);
const  mongoose  = require("mongoose");
const app = express();
require(`dotenv`).config();

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`connected to mongoDB`);
  })
  .catch((error) => {
    console.log(`something went wrong`, error);
  });

app.use(`/api/auth`, routesHandler);

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});