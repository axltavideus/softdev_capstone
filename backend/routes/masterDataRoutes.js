const express = require('express');
const router = require('express').Router();
const masterDataController = require('../controllers/master_dataController');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

// Get all master data
router.get('/', masterDataController.getAllMasterData);

// Get master data by id
router.get('/:id', masterDataController.getMasterDataById);

// Create new master data
router.post('/', masterDataController.createMasterData);

// Update master data by id
router.put('/:id', masterDataController.updateMasterData);

// Delete master data by id (admin only)
router.delete('/:id', authenticateUser, authorizeAdmin, masterDataController.deleteMasterData);

module.exports = router;
