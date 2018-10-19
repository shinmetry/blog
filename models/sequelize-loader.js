const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/blog',
   {
    logging: true,
    operatorsAliases: false
  });

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};