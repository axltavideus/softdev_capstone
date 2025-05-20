const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MasterData = sequelize.define('MasterData', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idBarang: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'kode_barang',
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stokAwal: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'stok_awal',
    },
    masuk: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    keluar: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    stockAkhir: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'stock_akhir',
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return MasterData;
};
