const express = require('express');
const router = express.Router();
const multer = require('multer');
const printController = require('./print.controller');

// ⚙️ Configure multer for memory storage of PDFs
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        cb(null, true);
    }
});

// 🖨️ Core Print Module Endpoints
router.post('/submit', upload.single('file'), printController.createPrintJob);
router.get('/history', printController.getPrintHistory);
router.put('/:id/status', printController.updatePrintJobStatus);

module.exports = router;
