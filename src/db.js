const {Pool} = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: "6281@Tma",
  port: 5432,
});

module.exports = pool;
