const { Project, BomItem, BarangKeluar } = require('../models');

module.exports = {
  // Get barang keluar data, optionally filtered by projectId
  async getBarangKeluar(req, res) {
    try {
      const { projectId } = req.query; // use query param for filtering
      const { search } = req.query;
      const { Op } = require('sequelize');
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
            attributes: ['projectName'],
          }],
        }],
      });
      // Map the result to include projectName at top level for convenience
      const result = barangKeluar.map(item => {
        const projectName = item.BomItem && item.BomItem.Project ? item.BomItem.Project.projectName : null;
        return {
          ...item.toJSON(),
          namaProjek: projectName,
        };
      });
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
};
