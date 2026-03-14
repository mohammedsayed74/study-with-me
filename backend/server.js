require(`dotenv`).config();
const express = require(`express`);
const userRoutes = require(`../backend/routes/userRoutes`);
const courseRoutes = require(`../backend/routes/courseRoutes`);
const materialRoutes = require("./routes/materialRoutes");
const mongoose = require("mongoose");
const app = express();

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
app.use(`/api/materials`, materialRoutes);

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
