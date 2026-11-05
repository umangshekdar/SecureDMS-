import multer from 'multer';

// Storage configuration: Memory storage to keep buffer for SHA-256 calculation & Cloudinary streaming
const storage = multer.memoryStorage();

// Allowed MIME types: PDF, DOCX, TXT, JPG, PNG
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed types: PDF, DOCX, TXT, JPG, PNG, WEBP.`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max limit
  },
  fileFilter,
});

export default upload;
