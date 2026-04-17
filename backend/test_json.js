require('dotenv').config();
const mongoose = require('mongoose');
const Material = require('./models/Material');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const materials = await Material.find({'ratings.0': {$exists: true}}).lean();
  console.log(JSON.stringify(materials, null, 2));
  process.exit(0);
}
test();
