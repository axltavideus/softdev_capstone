const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    projectCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    progress: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  });

  return Project;
};
