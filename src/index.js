require('dotenv').config();
const { initializeBot } = require('./infrastructure/bot');
const { logger } = require('./infrastructure/logger');

async function startBot() {
  try {
    await initializeBot();
    logger.info('Bot started successfully');
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

startBot();