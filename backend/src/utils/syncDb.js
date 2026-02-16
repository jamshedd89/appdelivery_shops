require('dotenv').config();
const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    const force = process.argv.includes('--force');
    const alter = process.argv.includes('--alter');

    if (force) {
      console.log('WARNING: Force sync will DROP all tables and recreate them!');
      console.log('Waiting 3 seconds... Press Ctrl+C to cancel.');
      await new Promise((r) => setTimeout(r, 3000));
    }

    await sequelize.sync({ force, alter });
    console.log(`Database synced successfully (force=${force}, alter=${alter}).`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to sync database:', error.message);
    process.exit(1);
  }
}

syncDatabase();
