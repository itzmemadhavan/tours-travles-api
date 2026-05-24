const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// Route: Single File Upload
// POST /api/uploads/single
router.post('/single', upload.single('file'), uploadController.uploadSingle);

// Route: Multiple Files Upload
// POST /api/uploads/multiple
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);

// Route: Delete File
// DELETE /api/uploads/:id
router.delete('/:id', uploadController.deleteFile);

// Route: Get File
// GET /api/uploads/:id
router.get('/:id', uploadController.getFile);

// Route: Stream Image Proxy
// GET /api/uploads/proxy/image
router.get('/proxy/image', uploadController.streamImage);

module.exports = router;
