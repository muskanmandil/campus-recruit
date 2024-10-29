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

const excelFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only Excel files are allowed!'), false);
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const resumeUpload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: pdfFilter
});

const excelUpload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024}, 
    fileFilter: excelFilter
});

module.exports = { upload, resumeUpload, excelUpload };