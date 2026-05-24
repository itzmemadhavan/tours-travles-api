const express = require('express');
const router = express.Router();
const packagesController = require('../controllers/packagesController');

// GET /api/packages
router.get('/', packagesController.getPackages);

// GET /api/packages/:id
router.get('/:id', packagesController.getPackageById);

// POST /api/packages
router.post('/', packagesController.createPackage);

// PUT /api/packages/:id
router.put('/:id', packagesController.updatePackage);

// DELETE /api/packages/:id
router.delete('/:id', packagesController.deletePackage);

module.exports = router;
