const mongoose = require('mongoose');
require('dotenv').config({ path: 'e:/Soft/study-with-me/backend/.env' });

const materialSchema = new mongoose.Schema({
  title: String,
  status: String,
  totalRatings: Number,
  averageRating: Number,
  courseCode: String
}, { collection: 'materials' });

const Material = mongoose.model('Material', materialSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const count = await Material.countDocuments();
    console.log('Total materials:', count);
    
    const approved = await Material.find({ status: 'approved' }).limit(5);
    console.log('Approved materials sample:', approved);
    
    const topRated = await Material.find({ status: 'approved', totalRatings: { $gt: 0 } });
    console.log('Top rated materials count:', topRated.length);
    console.log('Top rated materials:', topRated);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
