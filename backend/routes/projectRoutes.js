const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Project routes
router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// File upload route
router.post('/upload', upload.single('file'), projectController.uploadExcelFile);

// BOM Items routes
router.get('/:projectId/bomitems', projectController.getBomItemsByProject);
router.post('/:projectId/bomitems', projectController.createBomItem);
router.put('/:projectId/bomitems/:itemId', projectController.updateBomItem);
router.delete('/:projectId/bomitems/:itemId', projectController.deleteBomItem);

// BarangKeluar route for adding keluar input
router.post('/:projectId/bomitems/:itemId/keluar', projectController.addBarangKeluar);

module.exports = router;
