const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'e:/Soft/study-with-me/backend/.env' });

async function check() {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    console.log('Connected to DB');
    const db = client.db();
    
    const totalMaterials = await db.collection('materials').countDocuments();
    console.log('Total materials:', totalMaterials);
    
    const approvedCount = await db.collection('materials').countDocuments({ status: 'approved' });
    console.log('Approved materials:', approvedCount);
    
    const ratedCount = await db.collection('materials').countDocuments({ status: 'approved', totalRatings: { $gt: 0 } });
    console.log('Rated approved materials:', ratedCount);
    
    const sample = await db.collection('materials').find({ status: 'approved' }).limit(5).toArray();
    console.log('Sample approved:', sample);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

check();
