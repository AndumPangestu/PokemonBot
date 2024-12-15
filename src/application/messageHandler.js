const { searchPokemon } = require('../domain/services/pokemonService');
const { parseQuery } = require('../domain/services/queryParser');
const { logger } = require('../infrastructure/logger');

async function handleMessage(message) {
  try {
    const result = await searchPokemon(message.toLowerCase());
    return formatResponse(result);
  } catch (error) {
    logger.error('Error in message handler:', error);
    throw error;
  }
}

function formatResponse(pokemon) {

  if (!pokemon) {
    return {
      type: 'none',
      data: 'Sorry, I couldn\'t find that keyword. Try checking the spelling or searching for something similar.'
    };
  }

  if (pokemon.type === "list") {

    if (pokemon.isNotFound) {

      message = `Sorry, I couldn\'t find that keyword.\n\n 🛡️ There Are *${pokemon.name.length}* ${pokemon.dataType} ${pokemon.keyword} That May be Similar to Your Search 🛡️\n\n`;

    } else {

      message = `🛡️ There Are *${pokemon.name.length}* ${pokemon.dataType} ${pokemon.keyword} That Match Your Search 🛡️\n\n`
    }

    if (pokemon.dataType === "pokemon") {
      message += '⚡️ Click the *pokemon name* to get detail! ⚡️';
    } else {
      message += '⚡️ Click the *button* to get list pokemon of data! ⚡️';
    }
    return {
      type: 'list',
      message: message,
      data: pokemon.name
    };
  }

  if (pokemon.type === "detail") {

    const statEmoticons = {
      'hp': '❤️',
      'attack': '⚔️',
      'defense': '🛡️',
      'special-attack': '🔥',
      'special-defense': '🛡️',
      'speed': '⚡️',
      'accuracy': '🎯',
      'evasion': '🛡️'
    }

    const stats = pokemon.stats
      .map(stat => ` -  ${statEmoticons[stat.name] ? statEmoticons[stat.name] : ''} ${stat.name}: ${stat.value}`)
      .join('\n');

    const types = pokemon.types.join(', ');
    const abilities = pokemon.abilities.join(', ');


    const caption = `⚡ **${pokemon.name}** ⚡\n\n` +
      `🎨 *Types:* ${types}\n\n` +
      `📊 *Stats:*\n${stats}\n\n` +
      `✨ *Abilities:* ${abilities}`

    return {
      type: 'detail',
      data: {
        caption,
        photo: pokemon.image
      }
    };

  }
}

module.exports = { handleMessage };
