const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BarangKeluar = sequelize.define('BarangKeluar', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    keluar: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    namaProjek: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bomItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return BarangKeluar;
};
