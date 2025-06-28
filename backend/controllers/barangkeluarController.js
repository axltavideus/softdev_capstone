const { Project, BomItem, BarangKeluar, MasterData } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

module.exports = {
  // Get barang keluar data, optionally filtered by projectId
  async getBarangKeluar(req, res) {
    try {
      const { projectId } = req.query; // use query param for filtering
      const { search } = req.query;
      let whereClause = {};
      let bomItemWhereClause = undefined;

      if (projectId) {
        // Find bomItems for the project
        const bomItems = await BomItem.findAll({ where: { projectId } });
        const bomItemIds = bomItems.map(item => item.id);
        whereClause.bomItemId = bomItemIds.length > 0 ? bomItemIds : [-1]; // if no bomItems, no results
      }

      if (search) {
        // Only filter by idBarang (kode barang)
        bomItemWhereClause = {
          idBarang: { [Op.like]: `%${search}%` },
        };
      }

      const barangKeluar = await BarangKeluar.findAll({
        where: whereClause,
        include: [{
          model: BomItem,
          attributes: ['idBarang', 'projectId'],
          where: bomItemWhereClause,
          include: [{
            model: Project,
            attributes: ['projectName', 'projectCode'],
          }],
        }],
      });
      // Map the result to include projectName and projectCode at top level for convenience
      const result = barangKeluar.map(item => {
        const projectName = item.BomItem && item.BomItem.Project ? item.BomItem.Project.projectName : null;
        const projectCode = item.BomItem && item.BomItem.Project ? item.BomItem.Project.projectCode : null;
        return {
          ...item.toJSON(),
          namaProjek: projectName,
          projectCode: projectCode,
        };
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // New endpoint to get frequently used and almost out of stock items
  async getFrequentLowStockItems(req, res) {
    try {
      // Threshold for low stock, can be adjusted
      const LOW_STOCK_THRESHOLD = 10;

      // Aggregate total keluar quantity grouped by bomItemId
      const usageData = await BarangKeluar.findAll({
        attributes: [
          'bomItemId',
          [fn('SUM', col('keluar')), 'totalKeluar']
        ],
        group: ['bomItemId'],
        order: [[literal('totalKeluar'), 'DESC']],
        limit: 10, // top 10 frequently used items
      });

      const bomItemIds = usageData.map(item => item.bomItemId);

      // Fetch bomItems with stock info and join with usageData
      const bomItems = await BomItem.findAll({
        where: { id: bomItemIds },
        include: [{
          model: MasterData,
          attributes: ['stock'], // assuming stock field exists in MasterData
        }],
      });

      // Map bomItemId to totalKeluar
      const usageMap = {};
      usageData.forEach(item => {
        usageMap[item.bomItemId] = parseInt(item.get('totalKeluar'), 10);
      });

      // Filter items that are almost out of stock
      const filteredItems = bomItems.filter(item => {
        const stock = item.MasterData ? item.MasterData.stock : 0;
        const totalKeluar = usageMap[item.id] || 0;
        return stock <= LOW_STOCK_THRESHOLD;
      });

      // Map to response format
      const result = filteredItems.map(item => ({
        id: item.id,
        idBarang: item.idBarang,
        deskripsi: item.deskripsi,
        stock: item.MasterData ? item.MasterData.stock : 0,
        totalKeluar: usageMap[item.id] || 0,
      }));

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update keterangan of a BarangKeluar item
  async updateBarangKeluarKeterangan(req, res) {
    try {
      const { id } = req.params;
      const { keterangan } = req.body;
      const barangKeluar = await BarangKeluar.findByPk(id);
      if (!barangKeluar) {
        return res.status(404).json({ error: 'BarangKeluar item not found' });
      }
      await barangKeluar.update({ keterangan });
      res.json(barangKeluar);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add BarangKeluar record
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
      res.status(500).json({ error: error.message });
    }
  },

  // Delete BarangKeluar record
  async deleteBarangKeluar(req, res) {
    try {
      const { id } = req.params;
      const deleted = await BarangKeluar.destroy({ where: { id } });
      if (!deleted) {
        return res.status(404).json({ message: 'BarangKeluar not found' });
      }
      res.json({ message: 'BarangKeluar deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update BarangKeluar record by id
  async updateBarangKeluar(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const barangKeluar = await BarangKeluar.findByPk(id);
      if (!barangKeluar) {
        return res.status(404).json({ error: 'BarangKeluar item not found' });
      }

      // Whitelist allowed fields to update
      const allowedFields = ['tanggal', 'deskripsi', 'keluar', 'keterangan', 'namaProjek'];
      const filteredData = {};
      for (const field of allowedFields) {
        if (updateData.hasOwnProperty(field)) {
          filteredData[field] = updateData[field];
        }
      }

      await barangKeluar.update(filteredData);
      res.json(barangKeluar);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
