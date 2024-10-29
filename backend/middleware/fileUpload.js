const multer = require('multer');

const storage = multer.memoryStorage();

const pdfFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
}

const resumeUpload = multer({
    storage: storage,
    limits: {fileSize: 2*1024*1024},
    fileFilter: pdfFilter
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = {
    resumeUpload,
    upload
};