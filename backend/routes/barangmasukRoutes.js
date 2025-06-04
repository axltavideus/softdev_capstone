const express = require('express');
const router = express.Router();
const { createBarangMasuk, getAllBarangMasuk, updateBarangMasuk, deleteBarangMasuk } = require('../controllers/barangmasukController');

router.post('/', createBarangMasuk);
router.get('/', getAllBarangMasuk);
router.put('/:id', updateBarangMasuk);
router.delete('/:id', deleteBarangMasuk);

module.exports = router;
