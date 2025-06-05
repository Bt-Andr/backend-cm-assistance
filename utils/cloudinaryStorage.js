const { cloudinary } = require('./cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars', // Dossier Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 256, height: 256, crop: 'limit' }],
  },
});

const upload = multer({ storage });

module.exports = upload;