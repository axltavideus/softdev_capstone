const express = require('express');
const router = express.Router();
const { createBarangMasuk, getAllBarangMasuk } = require('../controllers/barangmasukController');

router.post('/', createBarangMasuk);
router.get('/', getAllBarangMasuk);

module.exports = router;
