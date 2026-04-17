require('dotenv').config();
const mongoose = require('mongoose');
const Material = require('./models/Material');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const materials = await Material.find({});
  console.log("Total materials:", materials.length);
  for (const m of materials) {
    console.log(`- ${m.title} | Status: ${m.status} | Ratings array size: ${m.ratings.length} | totalRatings: ${m.totalRatings}`);
    for(const r of m.ratings) {
      console.log(`  -> Rating by: ${r.user}, score: ${r.score}, ratedAt: ${r.ratedAt}`);
    }
  }
  process.exit(0);
}
test();
