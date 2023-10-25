require('dotenv').config();
const { DataSource } = require('typeorm');


const AppDataSource = new DataSource({
  type: 'postgres',
  port: 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/models/*.js'],
  migrations: ['dist/migrations/*.js'],
});

module.exports = {
  datasource: AppDataSource,
};
