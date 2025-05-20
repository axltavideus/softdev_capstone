const express = require('express');
const router = express.Router();
const barangkeluarController = require('../controllers/barangkeluarController');

// Get barang keluar data, optionally filtered by projectId via query param
router.get('/', barangkeluarController.getBarangKeluar);

// Update keterangan of a BarangKeluar item
router.put('/:id/keterangan', barangkeluarController.updateBarangKeluarKeterangan);

// Add BarangKeluar record for a bomItem in a project
router.post('/:projectId/bomitems/:itemId/keluar', barangkeluarController.addBarangKeluar);

module.exports = router;
