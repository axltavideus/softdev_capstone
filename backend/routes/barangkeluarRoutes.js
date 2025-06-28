const express = require('express');
const router = express.Router();
const barangkeluarController = require('../controllers/barangkeluarController');

// Get barang keluar data, optionally filtered by projectId via query param
router.get('/', barangkeluarController.getBarangKeluar);

// New route for frequently used and low stock items
router.get('/frequent-low-stock', barangkeluarController.getFrequentLowStockItems);

// Update keterangan of a BarangKeluar item
router.put('/:id/keterangan', barangkeluarController.updateBarangKeluarKeterangan);

// Update entire BarangKeluar item by id
router.put('/:id', barangkeluarController.updateBarangKeluar);

// Add BarangKeluar record for a bomItem in a project
router.post('/:projectId/bomitems/:itemId/keluar', barangkeluarController.addBarangKeluar);

// Add this route
router.delete('/:id', barangkeluarController.deleteBarangKeluar);

module.exports = router;
