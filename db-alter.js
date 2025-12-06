require('dotenv').config();
const { Sequelize } = require('sequelize');

// Connect using your existing .env values
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    dialectOptions: { ssl: { rejectUnauthorized: false } },
    logging: false
  }
);

async function alterColumns() {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database.");

    console.log("Updating column types...");

    await sequelize.query(`ALTER TABLE "Projects" ALTER COLUMN title TYPE TEXT;`);
    await sequelize.query(`ALTER TABLE "Projects" ALTER COLUMN feature_img_url TYPE TEXT;`);
    await sequelize.query(`ALTER TABLE "Projects" ALTER COLUMN original_source_url TYPE TEXT;`);

    console.log("Successfully updated columns to TEXT.");
  } catch (err) {
    console.error("Error while altering columns:", err.message || err);
  } finally {
    await sequelize.close();
    console.log("Connection closed.");
  }
}

alterColumns();
