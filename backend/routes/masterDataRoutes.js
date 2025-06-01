const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/master_dataController');

// Get all master data
router.get('/', masterDataController.getAllMasterData);

// Get master data by id
router.get('/:id', masterDataController.getMasterDataById);

// Create new master data
router.post('/', masterDataController.createMasterData);

// Update master data by id
router.put('/:id', masterDataController.updateMasterData);

// Delete master data by id
router.delete('/:id', masterDataController.deleteMasterData);

module.exports = router;
