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
  folder: 'study-with-me-profiles',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  params: {
    resource_type: 'auto',
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
