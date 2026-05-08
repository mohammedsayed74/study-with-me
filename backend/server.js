require(`dotenv`).config({ override: true });
const express = require(`express`);
const userRoutes = require(`./routes/userRoutes`);
const courseRoutes = require(`./routes/courseRoutes`);
const materialRoutes = require("./routes/materialRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const mcqRoutes = require('./routes/mcqRoutes');
const communityRoutes = require("./routes/communityRoutes");
const aiRoutes = require("./routes/aiRoutes");
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
app.use(`/api/dashboard`, dashboardRoutes);
app.use(`/api/MCQs`, mcqRoutes);
app.use(`/api/community`, communityRoutes);
app.use(`/api/ai`, aiRoutes);

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({ error: err.message, stack: err.stack, name: err.name });
});

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
