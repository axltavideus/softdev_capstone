const { MasterData, BarangMasuk, BarangKeluar } = require('../models');
const { Sequelize } = require('sequelize');

module.exports = {
  async getAllMasterData(req, res) {
    try {
      const masterData = await MasterData.findAll();

      // For each master data record, calculate masuk and keluar sums
      const results = await Promise.all(masterData.map(async (item) => {
        const kodeBarang = item.idBarang;

        // Sum masuk from barangmasuk where kodeBarang = kodeBarang
        const masukSumResult = await BarangMasuk.findOne({
          attributes: [[Sequelize.fn('SUM', Sequelize.col('masuk')), 'masukSum']],
          where: { kodeBarang: kodeBarang },
          raw: true,
        });
        const masukSum = masukSumResult.masukSum || 0;

        // Sum keluar from barangkeluar by joining bomItem where idBarang = kodeBarang
        const keluarSumResult = await BarangKeluar.findOne({
          attributes: [[Sequelize.fn('SUM', Sequelize.col('keluar')), 'keluarSum']],
          include: [{
            model: require('../models').BomItem,
            where: { idBarang: kodeBarang },
            attributes: [],
          }],
          raw: true,
        });
        const keluarSum = keluarSumResult.keluarSum || 0;

        // Calculate stock akhir
        const stokAwal = item.stokAwal || 0;
        const stockAkhir = stokAwal + masukSum - keluarSum;

        return {
          id: item.id,
          idBarang: kodeBarang,
          deskripsi: item.deskripsi,
          stokAwal,
          masuk: masukSum,
          keluar: keluarSum,
          stockAkhir,
          keterangan: item.keterangan,
        };
      }));

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getMasterDataById(req, res) {
    try {
      const { id } = req.params;
      const data = await MasterData.findByPk(id);
      if (!data) return res.status(404).json({ error: 'MasterData not found' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createMasterData(req, res) {
    try {
      const newData = await MasterData.create(req.body);
      res.status(201).json(newData);
    } catch (error) {
      console.error('Create MasterData validation error:', error);
      res.status(400).json({ error: error.message, details: error.errors });
    }
  },

  async updateMasterData(req, res) {
    try {
      const { id } = req.params;
      const data = await MasterData.findByPk(id);
      if (!data) return res.status(404).json({ error: 'MasterData not found' });
      await data.update(req.body);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteMasterData(req, res) {
    try {
      const { id } = req.params;
      const data = await MasterData.findByPk(id);
      if (!data) return res.status(404).json({ error: 'MasterData not found' });
      await data.destroy();
      res.json({ message: 'MasterData deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
