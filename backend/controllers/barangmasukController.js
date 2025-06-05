const { BarangMasuk, MasterData } = require('../models'); // <-- Import MasterData

const createBarangMasuk = async (req, res) => {
  try {
    const { tanggal, kodeBarang, deskripsi, masuk, keterangan } = req.body;
    if (!tanggal || !kodeBarang || !deskripsi || masuk === undefined) {
      return res.status(400).json({ message: 'Tanggal, Kode Barang, Deskripsi, dan Masuk wajib diisi' });
    }

    // Check if kodeBarang exists in MasterData
    const masterItem = await MasterData.findOne({ where: { idBarang: kodeBarang } });
    if (!masterItem) {
      return res.status(400).json({ message: 'Kode Barang tidak ditemukan di Master Data!' });
    }

    const newEntry = await BarangMasuk.create({
      tanggal,
      kodeBarang,
      deskripsi,
      masuk,
      keterangan,
    });
    return res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating BarangMasuk:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllBarangMasuk = async (req, res) => {
  try {
    const allEntries = await BarangMasuk.findAll();
    return res.status(200).json(allEntries);
  } catch (error) {
    console.error('Error fetching BarangMasuk:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBarangMasuk = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, kodeBarang, deskripsi, masuk, keterangan } = req.body;
    const barangMasuk = await BarangMasuk.findByPk(id);
    if (!barangMasuk) {
      return res.status(404).json({ message: 'BarangMasuk not found' });
    }
    await barangMasuk.update({ tanggal, kodeBarang, deskripsi, masuk, keterangan });
    return res.json(barangMasuk);
  } catch (error) {
    console.error('Error updating BarangMasuk:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBarangMasuk = async (req, res) => {
  try {
    const { id } = req.params;
    const barangMasuk = await BarangMasuk.findByPk(id);
    if (!barangMasuk) {
      return res.status(404).json({ message: 'BarangMasuk not found' });
    }
    await barangMasuk.destroy();
    return res.json({ message: 'BarangMasuk deleted successfully' });
  } catch (error) {
    console.error('Error deleting BarangMasuk:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createBarangMasuk,
  getAllBarangMasuk,
  updateBarangMasuk,
  deleteBarangMasuk,
};
