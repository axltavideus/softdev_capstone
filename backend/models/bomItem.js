const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BomItem = sequelize.define('BomItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idBarang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qtyPerUnit: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    totalQty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    satuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hargaSatuan: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gambar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    checked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return BomItem;
};
