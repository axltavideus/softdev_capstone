const { BarangMasuk } = require('../models');

const createBarangMasuk = async (req, res) => {
  try {
    const { tanggal, kodeBarang, deskripsi, masuk, keterangan } = req.body;
    if (!tanggal || !kodeBarang || !deskripsi || masuk === undefined) {
      return res.status(400).json({ message: 'Tanggal, Kode Barang, Deskripsi, dan Masuk wajib diisi' });
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

const deleteBarangMasuk = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BarangMasuk.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Data masuk not found' });
    }
    res.json({ message: 'Data masuk deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBarangMasuk,
  getAllBarangMasuk,
  deleteBarangMasuk,
};
