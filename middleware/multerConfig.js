const multer = require('multer');

// Allowed MIME types
const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];

// Configure disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './storage'); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only JPEG and PNG files are allowed'), false); // Reject file
    }
};

// Multer configuration with file size limit (e.g., 1MB = 1,000,000 bytes)
const upload = multer({
    storage: storage,
    limits: { fileSize: 100000 }, // 1 MB
    fileFilter: fileFilter
});

module.exports = upload;
