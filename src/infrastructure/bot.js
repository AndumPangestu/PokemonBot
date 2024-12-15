const TelegramBot = require('node-telegram-bot-api');
const { handleMessage } = require('../application/messageHandler');
const { logger } = require('./logger');

async function handleQuery(query) {

}


const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

function initializeBot() {

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to Pokemon Bot! Type pokemon name or type to get a list of Pokemon.');
  });

  bot.on('message', async (msg) => {

    if (msg.text && msg.text.startsWith('/start')) {
      return;
    }

    try {
      const response = await handleMessage(msg.text);
      if (response.type === "none") {
        await bot.sendMessage(msg.chat.id, response.data, {
          parse_mode: 'Markdown'
        });
      }
      else if (response.type === "list") {
        await sendListPokemonMessage(msg, response);
      } else if (response.type === "detail") {
        await bot.sendPhoto(msg.chat.id, response.data.photo, { caption: response.data.caption, parse_mode: 'Markdown' });
      }
    } catch (error) {
      logger.error('Error handling message:', error);
      await bot.sendMessage(
        msg.chat.id,
        'Sorry, something went wrong. Please try again later.'
      );
    }
  });


  // Menangani callback query
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    const response = await handleMessage(data);
    if (response.type === "detail") {
      bot.sendPhoto(chatId, response.data.photo, { caption: response.data.caption, parse_mode: 'Markdown' });
    } else if (response.type === "list") {
      await sendListPokemonMessage(callbackQuery.message, response);
    }

  });

  return Promise.resolve();
}


async function sendListPokemonMessage(msg, responseData) {

  const keyboard = responseData.data.reduce((rows, pokemon, index) => {
    if (index % 3 === 0) rows.push([]);
    rows[rows.length - 1].push({ text: "🔥 " + pokemon, callback_data: pokemon });
    return rows;
  }, []);

  await bot.sendMessage(msg.chat.id, responseData.message, {
    reply_markup: {
      inline_keyboard: keyboard,
    },
    parse_mode: 'Markdown'
  });

}

module.exports = { initializeBot };