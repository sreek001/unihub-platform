const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const printController = require('./print.controller');

// ⚙️ Ensure uploads directory exists cleanly
const uploadsDir = path.join(__dirname, '../../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

// Middleware to catch multer errors gracefully as JSON
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }
    next();
  });
};

// 🖨️ Core Print Module Endpoints
router.post('/submit', handleUpload, printController.createPrintJob);
router.get('/history', printController.getPrintHistory);
router.put('/:id/status', printController.updatePrintJobStatus);

module.exports = router;
