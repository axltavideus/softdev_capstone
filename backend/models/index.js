const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const Project = require('./project')(sequelize);
const BomItem = require('./bomItem')(sequelize);
const BarangKeluar = require('./barangkeluar')(sequelize);
const BarangMasuk = require('./barangmasuk')(sequelize);
const MasterData = require('./master_data')(sequelize);

// Associations
Project.hasMany(BomItem, { as: 'bomItems', foreignKey: 'projectId' });
BomItem.belongsTo(Project, { foreignKey: 'projectId' });

BomItem.hasMany(BarangKeluar, { as: 'barangKeluars', foreignKey: 'bomItemId' });
BarangKeluar.belongsTo(BomItem, { foreignKey: 'bomItemId' });

// Add association between BomItem and MasterData on idBarang
BomItem.hasOne(MasterData, { foreignKey: 'idBarang', sourceKey: 'idBarang' });
MasterData.belongsTo(BomItem, { foreignKey: 'idBarang', targetKey: 'idBarang' });

module.exports = {
  sequelize,
  Project,
  BomItem,
  BarangKeluar,
  BarangMasuk,
  MasterData,
};
