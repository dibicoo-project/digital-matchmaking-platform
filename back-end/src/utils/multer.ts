import Multer from 'multer';

// Multer is required to process file uploads and make them available via req.files.
export const multerFile = (fieldName: string, maxSize = 5) => Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: maxSize * 1024 * 1024, // MB
  },
}).single(fieldName);
