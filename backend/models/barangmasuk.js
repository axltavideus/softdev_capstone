const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BarangMasuk = sequelize.define('BarangMasuk', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    kodeBarang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    masuk: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return BarangMasuk;
};
