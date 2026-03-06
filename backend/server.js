const express = require(`express`);
const userRoutes = require(`../backend/routes/userRoutes`);
const courseRoutes = require(`../backend/routes/courseRoutes`);
const mongoose = require("mongoose");
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

app.use(`/api/users`, userRoutes);
app.use(`/api/courses`, courseRoutes);

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});