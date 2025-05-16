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

module.exports = {
  createBarangMasuk,
  getAllBarangMasuk,
};
