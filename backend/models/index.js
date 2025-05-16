const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

const Project = require('./project')(sequelize);
const BomItem = require('./bomItem')(sequelize);
const BarangKeluar = require('./barangkeluar')(sequelize);

// Associations
Project.hasMany(BomItem, { as: 'bomItems', foreignKey: 'projectId' });
BomItem.belongsTo(Project, { foreignKey: 'projectId' });

BomItem.hasMany(BarangKeluar, { as: 'barangKeluars', foreignKey: 'bomItemId' });
BarangKeluar.belongsTo(BomItem, { foreignKey: 'bomItemId' });

module.exports = {
  sequelize,
  Project,
  BomItem,
  BarangKeluar,
};
