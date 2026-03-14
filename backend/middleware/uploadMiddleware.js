const cloudinary = require(`cloudinary`).v2;


const CloudinaryStorage = require(`multer-storage-cloudinary`);
const multer = require(`multer`);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => { 
    const courseCode = req.params.courseCode;
    return {
      folder: `study-with-me-materials/${courseCode}`,
      allowed_formats: [`pdf`],
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;