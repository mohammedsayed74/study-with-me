const cloudinaryCore = require('cloudinary');
const cloudinary = require('cloudinary').v2;

const CloudinaryStorage = require(`multer-storage-cloudinary`);
const multer = require(`multer`);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinaryCore.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = CloudinaryStorage({
  cloudinary: cloudinaryCore,
  folder: (req, file, cb) => {
    const courseCode = req.params.courseCode || 'general';
    cb(null, `study-with-me-materials/${courseCode}`);
  },
  allowedFormats: ['pdf'],
  params: {
    resource_type: 'auto',
  },
});

const upload = multer({ storage: storage });

module.exports = upload;