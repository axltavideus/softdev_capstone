const { Project, BomItem, BarangKeluar } = require('../models');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

module.exports = {
  // Projects
  async getAllProjects(req, res) {
    try {
      const projects = await Project.findAll({
        include: [{ model: BomItem, as: 'bomItems' }],
      });
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createProject(req, res) {
    try {
      const { projectName, projectCode, progress } = req.body;
      const project = await Project.create({ projectName, projectCode, progress });
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.findByPk(id, {
        include: [{ model: BomItem, as: 'bomItems' }],
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const { projectName, projectCode, progress } = req.body;
      const project = await Project.findByPk(id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      await project.update({ projectName, projectCode, progress });
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.findByPk(id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      await project.destroy();
      res.json({ message: 'Project deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // BOM Items
  async getBomItemsByProject(req, res) {
    try {
      const { projectId } = req.params;
      const bomItems = await BomItem.findAll({ where: { projectId } });
      res.json(bomItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createBomItem(req, res) {
    try {
      const { projectId } = req.params;
      const bomItemData = req.body;
      bomItemData.projectId = projectId;
      const bomItem = await BomItem.create(bomItemData);
      res.status(201).json(bomItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateBomItem(req, res) {
    try {
      const { projectId, itemId } = req.params;
      const bomItem = await BomItem.findOne({ where: { id: itemId, projectId } });
      if (!bomItem) return res.status(404).json({ error: 'BOM Item not found' });
      await bomItem.update(req.body);
      res.json(bomItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteBomItem(req, res) {
    try {
      const { projectId, itemId } = req.params;
      const bomItem = await BomItem.findOne({ where: { id: itemId, projectId } });
      if (!bomItem) return res.status(404).json({ error: 'BOM Item not found' });
      await bomItem.destroy();
      res.json({ message: 'BOM Item deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Upload Excel file and store data
  async uploadExcelFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = path.resolve(req.file.path);
      const workbook = XLSX.readFile(filePath);
      const sheetName = 'BOM PENGAJUAN';
      if (!workbook.SheetNames.includes(sheetName)) {
        return res.status(400).json({ error: `Sheet "${sheetName}" not found in Excel file` });
      }
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Extract projectCode and projectName from filename
      const filename = req.file.originalname;
      const projectCodeFromFilename = filename.split('-')[0];
      const projectNameFromFilename = filename
        .replace(projectCodeFromFilename + '-', '')
        .replace(/\.[^/.]+$/, '')
        .trim();

      // Find or create project
      let project = await Project.findOne({ where: { projectCode: projectCodeFromFilename } });
      if (!project) {
        project = await Project.create({ projectName: projectNameFromFilename, projectCode: projectCodeFromFilename, progress: 0 });
      }

      // Parse BOM items from sheet rows, skipping header rows
      // Assuming data starts after first row with headers
      // Columns: I;ID BARANG;MATERIAL PLAT & PROFIL;QTY/UNIT;T. QTY;SATUAN;HARGA SATUAN;;KET;GAMBAR BARANG;;;;
      // Map columns to BomItem fields as appropriate
      const headerRowIndex = jsonData.findIndex(row => row.includes('ID BARANG'));
      if (headerRowIndex === -1) {
        return res.status(400).json({ error: 'Header row with "ID BARANG" not found in sheet' });
      }
      const headers = jsonData[headerRowIndex];
      const dataRows = jsonData.slice(headerRowIndex + 1);

      let currentCategory = null;
      for (const row of dataRows) {
        if (!row || row.length === 0) continue;
        // Skip rows with no description (empty or missing in column 2)
        if (!row[2] || row[2].toString().trim() === '') continue;

        // Check if row is a category header row (e.g., starts with I;ID BARANG;MATERIAL PLAT & PROFIL)
        if (typeof row[0] === 'string' && /^[IVX]+$/.test(row[0].trim()) && row[2]) {
          currentCategory = row[2].trim();
          continue;
        }
        // Map row columns to BomItem fields
        const bomItemData = {
          idBarang: row[1] || null, // ID BARANG
          deskripsi: row[2] && row[2].toString().trim() !== '' ? row[2] : 'No description', // MATERIAL PLAT & PROFIL or other description
          qtyPerUnit: row[3] !== undefined && row[3] !== null ? parseFloat(row[3]) : null, // QTY/UNIT
          totalQty: row[4] !== undefined && row[4] !== null ? parseFloat(row[4]) : null, // T. QTY
          satuan: row[5] ? row[5].toString() : null, // SATUAN
          hargaSatuan: row[6] !== undefined && row[6] !== null ? parseFloat(row[6]) : null, // HARGA SATUAN
          keterangan: row[8] ? row[8].toString() : '', // KET
          gambar: row[9] || null, // GAMBAR BARANG
          kategori: currentCategory || 'Uncategorized',
          projectId: project.id,
        };
        // Create BomItem record
        await BomItem.create(bomItemData);
      }

      // Delete the uploaded file after processing
      fs.unlinkSync(filePath);

      res.json({ message: 'File uploaded and BOM items stored successfully' });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async addBarangKeluar(req, res) {
    try {
      const { projectId, itemId } = req.params;
      const { tanggal, keluar, keterangan, namaProjek } = req.body;

      // Validate input
      if (!tanggal || keluar === undefined || !namaProjek) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Find BomItem
      const bomItem = await BomItem.findOne({ where: { id: itemId, projectId } });
      if (!bomItem) {
        return res.status(404).json({ error: 'BOM Item not found' });
      }

      // Calculate total keluar for this bomItem
      const totalKeluar = await BarangKeluar.sum('keluar', { where: { bomItemId: itemId } }) || 0;

      // Check if new keluar exceeds totalQty
      if (totalKeluar + keluar > bomItem.totalQty) {
        return res.status(400).json({ error: 'Total keluar exceeds totalQty' });
      }

      // Create new BarangKeluar record with deskripsi from BomItem
      const newBarangKeluar = await BarangKeluar.create({
        tanggal,
        deskripsi: bomItem.deskripsi,
        keluar,
        keterangan,
        namaProjek,
        bomItemId: itemId,
      });

      res.status(201).json(newBarangKeluar);
    } catch (error) {
      console.error('Error adding BarangKeluar:', error);
      res.status(500).json({ error: error.message });
    }
  },
};
