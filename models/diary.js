'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Diary =loader.database.define('diaries', {
  diaryId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  diaryName: {
   type: Sequelize.STRING,
   allowNull: false 
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  createdBy: {
    type: Sequelize.STRING,
    allowNull:false
  },
  updatedAt:{
    type: Sequelize.DATE,
    allowNull: false
  }
},{
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {fields: ['createdBy']}
  ]
});

module.exports = Diary;