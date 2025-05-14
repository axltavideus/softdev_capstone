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

// Associations
Project.hasMany(BomItem, { as: 'bomItems', foreignKey: 'projectId' });
BomItem.belongsTo(Project, { foreignKey: 'projectId' });

module.exports = {
  sequelize,
  Project,
  BomItem,
};
