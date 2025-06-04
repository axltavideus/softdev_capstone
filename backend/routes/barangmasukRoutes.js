const express = require('express');
const router = express.Router();
const { createBarangMasuk, getAllBarangMasuk, deleteBarangMasuk } = require('../controllers/barangmasukController');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/', createBarangMasuk);
router.get('/', getAllBarangMasuk);
router.delete('/:id', authenticateUser, authorizeAdmin, deleteBarangMasuk);

module.exports = router;
