'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const User = loader.database.define('users' , {
  userId: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  }
},{
  freezeTableName: true,
  timestamps: false
});

module.exports = User;